const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('ส่งเงินให้เพื่อนในฟาร์ม')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('ผู้รับของขวัญ')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('จำนวนเงินที่จะส่ง')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction, dataManager) {
    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // เช็คห้ามส่งให้บอท
    if (receiver.bot) {
      return interaction.reply({ content: '❌ ไม่สามารถส่งเงินให้บอทได้', ephemeral: true });
    }

    // ห้ามส่งให้ตัวเอง
    if (receiver.id === senderId) {
      return interaction.reply({ content: '❌ คุณไม่สามารถส่งเงินให้ตัวเองได้', ephemeral: true });
    }

    try {
      // รองรับกรณี dataManager ใช้ async (ถ้าไม่ใช่จะ fallback เอง)
      const senderData = typeof dataManager.getUserData === 'function' 
        ? await Promise.resolve(dataManager.getUserData(senderId)) 
        : null;
      const receiverData = typeof dataManager.getUserData === 'function' 
        ? await Promise.resolve(dataManager.getUserData(receiver.id)) 
        : null;

      // ถ้าไม่มีข้อมูลผู้เล่น ให้สร้างข้อมูลเริ่มต้น
      if (!senderData) {
        return interaction.reply({ content: '❌ ไม่พบข้อมูลของคุณในระบบ', ephemeral: true });
      }
      if (!receiverData) {
        // สร้างข้อมูลผู้รับหากไม่มี
        await dataManager.updateUserData(receiver.id, { money: 0 });
      }

      if ((senderData.money || 0) < amount) {
        return interaction.reply({ content: `❌ คุณมีเงินไม่พอที่จะส่ง ${amount} เหรียญ`, ephemeral: true });
      }

      // อัปเดตยอดเงินผู้ส่ง-ผู้รับ (ป้องกันติดลบ)
      senderData.money = Math.max(0, (senderData.money || 0) - amount);
      receiverData.money = (receiverData.money || 0) + amount;

      // อัปเดตข้อมูลใน dataManager (รองรับ async)
      await Promise.all([
        dataManager.updateUserData(senderId, senderData),
        dataManager.updateUserData(receiver.id, receiverData),
      ]);

      // ตอบกลับสำเร็จ
      await interaction.reply({
        content: `🎁 คุณส่งเงินจำนวน **${amount}** เหรียญให้กับ **${receiver.username}** เรียบร้อยแล้ว!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการส่งของขวัญ:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการส่งของขวัญ กรุณาลองใหม่อีกครั้ง', ephemeral: true });
      }
    }
  },
};

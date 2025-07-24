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

    if (receiver.bot) {
      return interaction.reply({ content: '❌ ไม่สามารถส่งเงินให้บอทได้', ephemeral: true });
    }
    if (receiver.id === senderId) {
      return interaction.reply({ content: '❌ คุณไม่สามารถส่งเงินให้ตัวเองได้', ephemeral: true });
    }

    try {
      // ดึงข้อมูลผู้ส่งและผู้รับ (ถ้าไม่มีจะสร้างอัตโนมัติใน dataManager)
      const senderData = dataManager.getUserData(senderId);
      const receiverData = dataManager.getUserData(receiver.id);

      if ((senderData.money || 0) < amount) {
        return interaction.reply({ content: `❌ คุณมีเงินไม่พอที่จะส่ง ${amount} เหรียญ`, ephemeral: true });
      }

      // หักเงินผู้ส่ง (ป้องกันติดลบ)
      senderData.money = Math.max(0, senderData.money - amount);

      // เพิ่มเงินผู้รับ
      receiverData.money = (receiverData.money || 0) + amount;

      // บันทึกข้อมูล
      dataManager.updateUserData(senderId, senderData);
      dataManager.updateUserData(receiver.id, receiverData);

      await interaction.reply({
        content: `🎁 คุณส่งเงินจำนวน ${amount} เหรียญให้กับ ${receiver.username} เรียบร้อยแล้ว!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการส่งของขวัญ:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการส่งของขวัญ กรุณาลองใหม่อีกครั้ง', ephemeral: true });
      }
    }
  },
};

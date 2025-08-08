const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('📦 ดูของในคลังและสถานะของคุณ'),

  async execute(interaction, dataManager) {
    try {
      const userId = interaction.user.id;

      // ดึงข้อมูลผู้ใช้จาก dataManager (คืนค่า clone ปลอดภัย)
      const userData = dataManager.getUserData(userId);
      if (!userData) {
        return await interaction.reply({
          content: '❌ ไม่พบข้อมูลของคุณในระบบ กรุณาลองใหม่อีกครั้ง',
          ephemeral: true,
        });
      }

      // ฟังก์ชันช่วยจัดรูปแบบตัวเลข ให้ดูสวยงาม เช่น 1,000 แทน 1000
      const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num);

      // กำหนดค่า default เพื่อป้องกัน undefined หรือข้อมูลผิดพลาด
      const inventory = Number(userData.inventory) || 0;
      const money = Number(userData.money) || 0;
      const plots = Number(userData.plots) || 0;
      const level = Number(userData.level) || 1;
      const xp = Number(userData.xp) || 0;
      const xpForNextLevel = level * 100;

      // สร้าง Embed แบบสวยงามและอ่านง่าย
      const embed = new EmbedBuilder()
        .setTitle(`📦 คลังและสถานะของ ${interaction.user.username}`)
        .setColor('#3498db')
        .addFields(
          { name: '🌾 จำนวนของในคลัง', value: `${formatNumber(inventory)} ชิ้น`, inline: true },
          { name: '💰 เงินในบัญชี', value: `${formatNumber(money)} เงิน`, inline: true },
          { name: '🧑‍🌾 จำนวนแปลงปลูก', value: `${formatNumber(plots)} แปลง`, inline: true },
          { name: '⭐ เลเวล', value: `${formatNumber(level)}`, inline: true },
          { 
            name: '🔄 XP', 
            value: `${formatNumber(xp)} / ${formatNumber(xpForNextLevel)} (เพื่อเลเวลถัดไป)`, 
            inline: true 
          }
        )
        .setFooter({ text: 'คำสั่ง /inventory' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในคำสั่ง /inventory:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'เกิดข้อผิดพลาด โปรดลองอีกครั้งภายหลัง', ephemeral: true });
      } else {
        await interaction.reply({ content: 'เกิดข้อผิดพลาด โปรดลองอีกครั้งภายหลัง', ephemeral: true });
      }
    }
  },
};

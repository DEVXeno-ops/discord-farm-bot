const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('shop').setDescription('ดูร้านค้า'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🏪 ร้านค้า')
      .setColor('#f1c40f')
      .setDescription(`
**🛒 ซื้อพื้นที่ปลูก** - 50 เหรียญ
**📈 อัปเกรดฟาร์ม** - ราคาขึ้นตามเลเวล (100, 200, 300...)
**🌱 ปลูกพืช** - ฟรี แต่ต้องรอเวลาพืชโต

ใช้ปุ่มใน /farm เพื่อจัดการฟาร์ม
      `.trim());

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

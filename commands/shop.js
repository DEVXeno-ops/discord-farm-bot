const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('shop').setDescription('ดูร้านค้า'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🏪 ร้านค้า')
      .setColor(0xf5a623)
      .setDescription(
        '**🛒 ซื้อพื้นที่ปลูก** - 50 เหรียญ\n' +
        '**📈 อัปเกรดฟาร์ม** - ราคาขึ้นตามเลเวล (100, 200, 300...)\n' +
        '**🌱 ปลูกพืช** - ฟรี แต่ต้องรอเวลาพืชโต\n\n' +
        'ใช้ปุ่มใน /farm เพื่อจัดการฟาร์ม'
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

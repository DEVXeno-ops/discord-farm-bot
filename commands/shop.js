const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 ดูร้านค้าฟาร์ม'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🏪 ร้านค้าฟาร์ม')
      .setColor('#f1c40f')
      .setDescription('เลือกซื้อของเพื่อขยายและพัฒนาฟาร์มของคุณ')
      .addFields(
        {
          name: '📦 ซื้อพื้นที่ปลูก',
          value: 'ราคา: **50** 💰\nเพิ่มช่องปลูกพืชอีก 1 ช่อง',
          inline: false,
        },
        {
          name: '📈 อัปเกรดฟาร์ม',
          value: 'ราคา: **100+** 💰 (เพิ่มขึ้นตามเลเวล)\nเพิ่มประสิทธิภาพการฟาร์ม',
          inline: false,
        },
        {
          name: '🌱 ปลูกพืช',
          value: 'ฟรี! แต่ต้องรอให้พืชโต\nใช้คำสั่ง `/plant` เพื่อเริ่มปลูก',
          inline: false,
        },
      )
      .setFooter({ text: 'ใช้คำสั่ง /farm เพื่อดูสถานะฟาร์มของคุณ' })
      .setTimestamp();

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

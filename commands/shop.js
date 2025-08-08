const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 ดูร้านค้าฟาร์ม'),

  async execute(interaction) {
    // ฟังก์ชันช่วยจัดรูปแบบตัวเลข ให้ดูสวยงาม เช่น 1,000 แทน 1000
    const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num);

    // ราคาสินค้าต่าง ๆ (แก้ไขได้ง่าย)
    const pricePlots = 50;
    const basePriceUpgrade = 100; // ราคาเริ่มต้นสำหรับอัปเกรด

    // สร้าง Embed แบบสวยงามและอ่านง่าย
    const embed = new EmbedBuilder()
      .setTitle('🏪 ร้านค้าฟาร์มของคุณ')
      .setColor('#f1c40f')
      .setDescription('✨ เลือกซื้อของเพื่อขยายและพัฒนาฟาร์มของคุณให้เจริญรุ่งเรือง!')
      .addFields(
        {
          name: '📦 ซื้อพื้นที่ปลูก',
          value: `ราคา: **${formatNumber(pricePlots)}** 💰\nเพิ่มช่องปลูกพืชอีก 1 ช่อง`,
          inline: false,
        },
        {
          name: '📈 อัปเกรดฟาร์ม',
          value: `ราคา: **${formatNumber(basePriceUpgrade)}+** 💰 (เพิ่มขึ้นตามเลเวล)\nเพิ่มประสิทธิภาพการฟาร์มของคุณ`,
          inline: false,
        },
        {
          name: '🌱 ปลูกพืช',
          value: 'ฟรี! แต่ต้องรอให้พืชโต\nใช้คำสั่ง `/plant` เพื่อเริ่มปลูกพืชในแปลงของคุณ',
          inline: false,
        },
      )
      .setFooter({ text: 'ใช้คำสั่ง /farm เพื่อดูสถานะฟาร์มของคุณ' })
      .setTimestamp()
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/833/833314.png'); // ตัวอย่างรูปภาพร้านค้า

    // เช็คว่าคำสั่งเคยตอบหรือ defer แล้วหรือยัง เพื่อใช้วิธีตอบให้เหมาะสม
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

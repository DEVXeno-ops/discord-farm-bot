const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('เปิดหน้าฟาร์มของคุณ'),
  async execute(interaction, dataManager) {
    const userId = interaction.user.id;
    const userData = dataManager.getUserData(userId);
    // อัปเดตสถานะพืชก่อน
    const now = Date.now();
    userData.plants.forEach(p => {
      if (!p.ready && now - p.plantedAt >= p.growTime) p.ready = true;
    });
    dataManager.updateUserData(userId, userData);

    const total = userData.plants.length;
    const ready = userData.plants.filter(p => p.ready).length;
    const growing = total - ready;

    const embed = new EmbedBuilder()
      .setTitle(`🌾 ฟาร์มของ ${interaction.user.username}`)
      .setColor('#57f287')
      .addFields(
        { name: '🌱 พืชโตแล้ว', value: `${ready}`, inline: true },
        { name: '🌿 กำลังเติบโต', value: `${growing}`, inline: true },
        { name: '📦 คลัง', value: `${userData.inventory}`, inline: true },
        { name: '💰 เงิน', value: `${userData.money}`, inline: true },
        { name: '📏 พื้นที่ปลูก', value: `${userData.plots}`, inline: true },
        { name: '⭐ เลเวล', value: `${userData.level}`, inline: true },
        { name: '🧪 XP', value: `${userData.xp} / ${userData.level * 100}`, inline: true },
      )
      .setFooter({ text: 'ใช้ปุ่มด้านล่างเพื่อจัดการฟาร์ม' });

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('plant').setLabel('🌱 ปลูก').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('harvest').setLabel('🌾 เก็บเกี่ยว').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('upgrade').setLabel('📈 อัปเกรด').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('buyplot').setLabel('🛒 ซื้อพื้นที่ปลูก (50 ฿)').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('refresh').setLabel('🔄 รีเฟรช').setStyle(ButtonStyle.Primary),
      );

    await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
  }
};

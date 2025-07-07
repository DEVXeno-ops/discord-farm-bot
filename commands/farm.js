const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('farm').setDescription('เปิดหน้าฟาร์มของคุณ'),
  async execute(interaction, users, saveUsers, ensureUserData, checkPlantsReady) {
    const userId = interaction.user.id;
    const user = ensureUserData(users, userId);
    checkPlantsReady(user.plants);

    const total = user.plants.length;
    const ready = user.plants.filter(p => p.ready).length;
    const growing = total - ready;

    const embed = new EmbedBuilder()
      .setTitle(`🌾 ฟาร์มของ ${interaction.user.username}`)
      .setColor(0x86efac)
      .addFields(
        { name: '🌱 พืชโตแล้ว', value: `${ready}`, inline: true },
        { name: '🌿 กำลังเติบโต', value: `${growing}`, inline: true },
        { name: '📦 คลัง', value: `${user.inventory}`, inline: true },
        { name: '💰 เงิน', value: `${user.money}`, inline: true },
        { name: '📏 พื้นที่ปลูก', value: `${user.plots}`, inline: true },
        { name: '⭐ เลเวล', value: `${user.level}`, inline: true },
        { name: '🧪 XP', value: `${user.xp} / ${user.level * 100}`, inline: true },
      )
      .setFooter({ text: 'กดปุ่มเพื่อจัดการฟาร์มของคุณ' });

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

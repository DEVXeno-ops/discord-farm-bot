const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('ดูโปรไฟล์ของคุณ'),
  async execute(interaction, dataManager) {
    const userData = dataManager.getUserData(interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} โปรไฟล์ฟาร์ม`)
      .setColor('#5865F2')
      .addFields(
        { name: '💰 เงิน', value: `${userData.money}`, inline: true },
        { name: '⭐ เลเวล', value: `${userData.level}`, inline: true },
        { name: '🧪 XP', value: `${userData.xp} / ${userData.level * 100}`, inline: true },
        { name: '📦 คลัง', value: `${userData.inventory}`, inline: true },
        { name: '📏 พื้นที่ปลูก', value: `${userData.plots}`, inline: true },
        { name: '📈 เลเวลฟาร์ม', value: `${userData.upgradeLevel}`, inline: true },
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

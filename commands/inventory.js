const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('inventory').setDescription('ดูของในคลัง'),
  async execute(interaction, dataManager) {
    const userData = dataManager.getUserData(interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} คลังของคุณ`)
      .setColor('#2ecc71')
      .addFields({ name: '📦 จำนวนของในคลัง', value: `${userData.inventory}`, inline: true });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

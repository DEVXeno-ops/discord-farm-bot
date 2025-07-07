const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('inventory').setDescription('ดูของในคลัง'),
  async execute(interaction, users, saveUsers, ensureUserData) {
    const user = ensureUserData(users, interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} คลังของคุณ`)
      .setColor(0x7289da)
      .addFields({ name: '📦 จำนวนของในคลัง', value: `${user.inventory}`, inline: true });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('ดูของในคลัง'),

  async execute(interaction, dataManager) {
    const userData = dataManager.getUserData(interaction.user.id);

    // เช็คถ้าไม่มีข้อมูล userData หรือ inventory
    const inventoryAmount = userData && typeof userData.inventory === 'number' ? userData.inventory : 0;

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} คลังของคุณ`)
      .setColor('#2ecc71')
      .addFields({ name: '📦 จำนวนของในคลัง', value: `${inventoryAmount}`, inline: true });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

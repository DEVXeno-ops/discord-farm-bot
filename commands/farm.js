const { SlashCommandBuilder } = require('discord.js');
const { sendFarmWithAutoUpdate } = require('../utils/farmUpdater');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('เปิดหน้าฟาร์มของคุณ'),
  async execute(interaction, dataManager, client) {
    await sendFarmWithAutoUpdate(interaction, dataManager, client);
  },
};

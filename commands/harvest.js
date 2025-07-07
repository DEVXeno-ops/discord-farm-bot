const { SlashCommandBuilder } = require('discord.js');
const plantsData = require('../data/plants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('harvest')
    .setDescription('เก็บเกี่ยวพืชที่โตแล้ว'),

  async execute(interaction, dataManager) {
    const userId = interaction.user.id;
    const userData = dataManager.getUserData(userId);
    const now = Date.now();

    const readyPlants = userData.plants.filter(p => !p.harvested && now - p.plantedAt >= p.growTime);

    if (readyPlants.length === 0) {
      return interaction.reply({
        content: '❌ ยังไม่มีพืชที่พร้อมเก็บเกี่ยว',
        ephemeral: true,
      });
    }

    let totalReward = 0;
    readyPlants.forEach(p => {
      p.ready = true;
      p.harvested = true;
      totalReward += 20;
    });

    userData.money += totalReward;
    userData.inventory += readyPlants.length;

    dataManager.updateUserData(userId, userData);

    const cropsList = readyPlants
      .map(p => `• ${plantsData.find(pl => pl.id === p.id).emoji} ${plantsData.find(pl => pl.id === p.id).name}`)
      .join('\n');

    return interaction.reply({
      content: `✅ เก็บเกี่ยวแล้วจำนวน ${readyPlants.length} ต้น\n${cropsList}\n💰 ได้รับ ${totalReward} เงิน!`,
      ephemeral: true,
    });
  },
};

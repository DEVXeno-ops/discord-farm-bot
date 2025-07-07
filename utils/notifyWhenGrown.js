// utils/notifyWhenGrown.js
const plantsData = require('../data/plants');

function getPlantName(plantId, lang = 'th') {
  const plant = plantsData.find(p => p.id === plantId);
  return plant ? `${plant.emoji} ${plant.name[lang]}` : 'Unknown';
}

async function notifyReadyPlants(client, dataManager) {
  const allUsers = dataManager.getAllUsers();
  const now = Date.now();

  for (const userId in allUsers) {
    const userData = allUsers[userId];
    const readyPlants = [];

    userData.plants.forEach(p => {
      if (!p.ready && now - p.plantedAt >= p.growTime) {
        p.ready = true;
        readyPlants.push(p);
      }
    });

    if (readyPlants.length > 0) {
      dataManager.updateUserData(userId, userData);
      const user = await client.users.fetch(userId).catch(() => null);

      if (user) {
        const language = userData.lang || 'th';
        const list = readyPlants.map(p => `• ${getPlantName(p.id, language)}`).join('\n');
        const message = language === 'th'
          ? `🌾 พืชของคุณเติบโตแล้ว!\n${list}`
          : `🌾 Your crops are ready!\n${list}`;

        user.send({ content: message }).catch(() => null);
      }
    }
  }
}

module.exports = { notifyReadyPlants };

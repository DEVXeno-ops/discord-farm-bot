const plantsData = require('../data/plants');

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
      try {
        const user = await client.users.fetch(userId);
        const list = readyPlants.map(p => `• ${plantsData.find(pl => pl.id === p.id).emoji} ${plantsData.find(pl => pl.id === p.id).name}`).join('\n');
        await user.send(`🌾 พืชของคุณโตแล้ว!\n${list}`);
      } catch {
        // ข้ามถ้า DM ไม่ได้
      }
    }
  }
}

module.exports = { notifyReadyPlants };

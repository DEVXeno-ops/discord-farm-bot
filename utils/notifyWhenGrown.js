const plantsData = require('../data/plants');

async function notifyReadyPlants(client, dataManager) {
  const allUsers = dataManager.getAllUsers();
  const now = Date.now();

  for (const userId in allUsers) {
    const userData = allUsers[userId];
    const readyPlants = [];

    if (!Array.isArray(userData.plants)) continue;

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
        const list = readyPlants.map(p => {
          const plantInfo = plantsData.find(pl => pl.id === p.id);
          if (!plantInfo) return `• 🌱 Unknown Plant (${p.id})`;
          return `• ${plantInfo.emoji} ${plantInfo.name}`;
        }).join('\n');

        await user.send(`🌾 พืชของคุณโตแล้ว!\n${list}`);
      } catch (error) {
        console.error(`ไม่สามารถส่งข้อความ DM ไปยังผู้ใช้ ${userId}:`, error);
        // ข้ามถ้า DM ไม่ได้
      }
    }
  }
}

module.exports = { notifyReadyPlants };

const plantsData = require('../data/plants');

async function notifyReadyPlants(client, dataManager) {
  const allUsers = dataManager.getAllUsers();
  const now = Date.now();

  for (const userId in allUsers) {
    const userData = allUsers[userId];

    if (!Array.isArray(userData.plants)) continue;

    // เก็บพืชที่โตและยังไม่เก็บเกี่ยว (harvested = false)
    const readyPlants = [];

    let updated = false;
    userData.plants.forEach(p => {
      if (!p.harvested && now - p.plantedAt >= p.growTime) {
        p.harvested = false;  // ย้ำสถานะยังไม่เก็บ (ถ้ต้องการเก็บครั้งเดียว)
        readyPlants.push(p);
        updated = true;
      }
    });

    if (readyPlants.length === 0) {
      // ไม่มีพืชโต รอบนี้ข้ามไป
      continue;
    }

    if (updated) {
      try {
        dataManager.updateUserData(userId, userData);
      } catch (err) {
        console.error(`Error updating userData for user ${userId}:`, err);
      }
    }

    try {
      const user = await client.users.fetch(userId);
      const list = readyPlants
        .map(p => {
          const plantInfo = plantsData.find(pl => pl.id === p.id);
          if (!plantInfo) return `• 🌱 Unknown Plant (${p.id})`;
          return `• ${plantInfo.emoji} ${plantInfo.name}`;
        })
        .join('\n');

      await user.send(`🌾 พืชของคุณโตแล้ว! พร้อมเก็บเกี่ยว:\n${list}`);
    } catch (error) {
      console.error(`ไม่สามารถส่งข้อความ DM ไปยังผู้ใช้ ${userId}:`, error);
      // ถ้า DM ไม่ได้ก็ข้ามไป ไม่ต้องทำอะไรเพิ่ม
    }
  }
}

module.exports = { notifyReadyPlants };

const { SlashCommandBuilder } = require('discord.js');
const plantsData = require('../data/plants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('harvest')
    .setDescription('เก็บเกี่ยวพืชที่โตแล้ว'),

  async execute(interaction, dataManager) {
    const userId = interaction.user.id;
    const userData = dataManager.getUserData(userId);

    if (!userData || !Array.isArray(userData.plants)) {
      return interaction.reply({
        content: '❌ ไม่พบข้อมูลฟาร์มของคุณ',
        ephemeral: true,
      });
    }

    const now = Date.now();

    // หาเฉพาะพืชที่ยังไม่เก็บและโตครบเวลา
    const readyPlants = userData.plants.filter(p => !p.harvested && now - p.plantedAt >= p.growTime);

    if (readyPlants.length === 0) {
      return interaction.reply({
        content: '❌ ยังไม่มีพืชที่พร้อมเก็บเกี่ยว',
        ephemeral: true,
      });
    }

    let totalReward = 0;

    readyPlants.forEach(p => {
      p.harvested = true; // ทำเครื่องหมายว่าเก็บแล้ว
      totalReward += 20; // สมมติค่าต้นละ 20 เงิน
    });

    userData.money = (userData.money || 0) + totalReward;

    // ถ้า inventory เป็นจำนวนรวมของพืชที่เก็บได้
    userData.inventory = (userData.inventory || 0) + readyPlants.length;

    dataManager.updateUserData(userId, userData);

    // สร้างลิสต์ชื่อพืช + emoji โดยหา plant data แค่ครั้งเดียวใน loop
    const cropsList = readyPlants
      .map(p => {
        const plantInfo = plantsData.find(pl => pl.id === p.id);
        return `• ${plantInfo?.emoji ?? '🌱'} ${plantInfo?.name ?? 'Unknown Plant'}`;
      })
      .join('\n');

    return interaction.reply({
      content: `✅ เก็บเกี่ยวแล้วจำนวน ${readyPlants.length} ต้น\n${cropsList}\n💰 ได้รับ ${totalReward} เงิน!`,
      ephemeral: true,
    });
  },
};

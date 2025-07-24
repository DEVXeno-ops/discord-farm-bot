const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const plantsData = require('../data/plants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('harvest')
    .setDescription('🌾 เก็บเกี่ยวพืชที่โตแล้ว'),

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

    // หาเฉพาะพืชที่โตครบเวลาและยังไม่ถูกเก็บ
    const readyPlants = userData.plants.filter(p => !p.harvested && now - p.plantedAt >= p.growTime);

    if (readyPlants.length === 0) {
      return interaction.reply({
        content: '⏳ ยังไม่มีพืชที่พร้อมเก็บเกี่ยวในตอนนี้',
        ephemeral: true,
      });
    }

    let totalReward = 0;
    let harvestedList = [];

    // เก็บเกี่ยวพืช
    for (const plant of readyPlants) {
      plant.harvested = true;
      totalReward += 20; // ค่าพืชต้นละ 20
      const plantInfo = plantsData.find(pl => pl.id === plant.id);
      harvestedList.push(`• ${plantInfo?.emoji ?? '🌱'} ${plantInfo?.name ?? 'Unknown Plant'}`);
    }

    // อัปเดตเงินและ inventory
    userData.money = (userData.money || 0) + totalReward;
    userData.inventory = (userData.inventory || 0) + readyPlants.length;
    dataManager.updateUserData(userId, userData);

    // สร้าง embed ตอบกลับ
    const embed = new EmbedBuilder()
      .setTitle('🌾 เก็บเกี่ยวสำเร็จ!')
      .setDescription(`${harvestedList.join('\n')}`)
      .addFields(
        { name: '✅ จำนวนที่เก็บ', value: `${readyPlants.length} ต้น`, inline: true },
        { name: '💰 รางวัลที่ได้รับ', value: `${totalReward} เงิน`, inline: true },
      )
      .setColor(0x2ecc71)
      .setFooter({ text: 'กลับมาดูฟาร์มของคุณอีกครั้งเร็ว ๆ นี้!' });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

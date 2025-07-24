const { EmbedBuilder } = require('discord.js');

async function sendFarmWithAutoUpdate(interaction, dataManager) {
  const userId = interaction.user.id;

  // ดึงข้อมูลฟาร์มครั้งแรก
  const farmData = dataManager.getFarmData(userId);

  // สร้าง Embed สำหรับข้อความแรก
  const embed = formatFarm(farmData);
  const message = await interaction.editReply({ embeds: [embed] });

  // อัปเดตทุก 10 วิ
  const interval = setInterval(async () => {
    try {
      const updatedFarm = dataManager.getFarmData(userId);
      const updatedEmbed = formatFarm(updatedFarm);
      await message.edit({ embeds: [updatedEmbed] });
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตฟาร์ม:', err);
      clearInterval(interval); // หยุดการอัปเดตถ้า error
    }
  }, 10000);

  // หยุดอัปเดตหลัง 1 นาที
  setTimeout(() => clearInterval(interval), 60000);
}

function formatFarm(farmData) {
  const plantList = farmData.plants.map((plant, i) => {
    const status = plant.isGrown ? '✅ โตแล้ว' : '🌱 กำลังโต';
    return `• ${plant.name} - ${status}`;
  }).join('\n') || 'ยังไม่มีพืชในฟาร์ม';

  return new EmbedBuilder()
    .setTitle('🌾 ฟาร์มของคุณ')
    .setDescription(plantList)
    .setColor(0x00cc66)
    .setFooter({ text: 'อัปเดตอัตโนมัติทุก 10 วินาที' });
}

module.exports = { sendFarmWithAutoUpdate };

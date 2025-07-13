async function sendFarmWithAutoUpdate(interaction, dataManager) {
  // ดึงข้อมูลฟาร์ม
  const farmData = dataManager.getFarmData(interaction.user.id);

  // ส่งข้อความแรก
  const message = await interaction.editReply({ content: formatFarm(farmData) });

  // ตั้ง interval อัปเดตทุก 10 วิ (หรือเวลาที่ต้องการ)
  const interval = setInterval(() => {
    const updatedFarm = dataManager.getFarmData(interaction.user.id);
    message.edit(formatFarm(updatedFarm));
  }, 10000);

  // ตัวอย่าง: หยุดอัปเดตหลัง 1 นาที (ถ้าอยากจำกัดเวลา)
  setTimeout(() => {
    clearInterval(interval);
  }, 60000);
}

function formatFarm(farmData) {
  // แปลงข้อมูลฟาร์มเป็นข้อความหรือ embed ที่ต้องการแสดง
  return `🌱 ฟาร์มของคุณ: ${farmData.plants.length} ต้น\n...`;
}

module.exports = { sendFarmWithAutoUpdate };

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

// ตรวจสอบตัวแปรแวดล้อมที่จำเป็น
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  throw new Error('❌ ต้องกำหนด TOKEN และ CLIENT_ID ใน .env');
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// โหลดคำสั่งทั้งหมด
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(typeof command.data.toJSON === 'function' ? command.data.toJSON() : command.data);
  } else {
    console.warn(`⚠️ ไฟล์คำสั่ง "${file}" ไม่มี property 'data'`);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`🚀 เริ่มลงทะเบียนคำสั่งทั้งหมด ${commands.length} คำสั่ง...`);

    if (GUILD_ID) {
      // ลงทะเบียนแบบ Guild Commands (เร็ว เหมาะสำหรับ dev)
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`✅ ลงทะเบียนคำสั่งใน Guild (${GUILD_ID}) เรียบร้อยแล้ว`);
    } else {
      // ลงทะเบียนแบบ Global Commands (อาจใช้เวลาถึง 1 ชั่วโมง)
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('✅ ลงทะเบียนคำสั่งแบบ Global สำเร็จ');
    }
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการลงทะเบียนคำสั่ง:', err);
  }
})();

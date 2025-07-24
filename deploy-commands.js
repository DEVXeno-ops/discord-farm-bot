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
    // รองรับ .toJSON() หรือ object ตรง ๆ
    commands.push(typeof command.data.toJSON === 'function' ? command.data.toJSON() : command.data);
  } else {
    console.warn(`⚠️ ไฟล์คำสั่ง "${file}" ไม่มี property 'data'`);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`🚀 เริ่มลงทะเบียน ${commands.length} คำสั่ง...`);

    // ▼ หากต้องการทดสอบแบบ Guild (แนะนำตอน dev)
    // if (GUILD_ID) {
    //   await rest.put(
    //     Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    //     { body: commands },
    //   );
    //   console.log(`✅ คำสั่งลงทะเบียนใน Guild ${GUILD_ID} แล้ว`);
    // } else {
    //   throw new Error('❌ ต้องกำหนด GUILD_ID เพื่อใช้กับ Guild Commands');
    // }

    // ▼ ลงทะเบียน Global Commands (ใช้งานทั่ว Discord – อาจใช้เวลาหลายนาที)
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('✅ คำสั่งทั้งหมดลงทะเบียนสำเร็จ (Global)');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการลงทะเบียนคำสั่ง:', err);
  }
})();

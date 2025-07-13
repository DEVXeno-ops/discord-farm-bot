require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(typeof command.data.toJSON === 'function' ? command.data.toJSON() : command.data);
  } else {
    console.warn(`ไฟล์คำสั่ง ${file} ไม่มี property data`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`เริ่มลงทะเบียนคำสั่งทั้งหมด ${commands.length} คำสั่ง...`);

    // ถ้าอยากลงทะเบียนแบบ Guild Commands (ทดสอบเร็ว)
    // await rest.put(
    //   Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    //   { body: commands },
    // );

    // ลงทะเบียนแบบ Global Commands (ใช้งานทั่ว Discord)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('ลงทะเบียนคำสั่งเสร็จสิ้น');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียนคำสั่ง:', error);
  }
})();

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const dataManager = require('./utils/dataManager');
const { notifyReadyPlants } = require('./utils/notifyWhenGrown');

// ตรวจสอบ Token และสร้าง Client
const token = process.env.TOKEN;
if (!token) {
  throw new Error('❌ ไม่พบ TOKEN ในไฟล์ .env');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ],
});

client.commands = new Collection();

// โหลด Slash Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`⚠️ คำสั่ง ${file} ไม่มี data หรือ execute`);
  }
}

// บอทพร้อมใช้งาน
client.once(Events.ClientReady, async () => {
  console.log(`✅ เข้าสู่ระบบในชื่อ ${client.user.tag}`);
  console.log('🌾 Discord Farm Bot พร้อมใช้งานแล้ว! โดย xᴇɴᴏ miss');

  // ส่งข้อความไปยังช่องที่กำหนดใน .env
  const channelId = process.env.READY_CHANNEL_ID;
  if (channelId) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        channel.send('🤖 Discord Farm Bot พร้อมใช้งานแล้ว! สร้างโดย xᴇɴᴏ miss.');
      }
    } catch (err) {
      console.error('❌ ไม่สามารถส่งข้อความในช่องที่กำหนดได้:', err);
    }
  }

  // เริ่มตรวจสอบพืชทุก 10 วินาที
  setInterval(() => notifyReadyPlants(client, dataManager), 10000);
});

// จัดการกับ Interaction ของ Slash Commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, dataManager, client);
  } catch (err) {
    console.error(`❌ เกิดข้อผิดพลาดในคำสั่ง ${interaction.commandName}:`, err);
    if (!interaction.replied) {
      await interaction.reply({ content: '🚫 เกิดข้อผิดพลาดระหว่างการดำเนินการคำสั่งนี้', ephemeral: true });
    }
  }
});

// เริ่มต้นบอท
client.login(token);

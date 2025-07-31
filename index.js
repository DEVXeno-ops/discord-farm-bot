require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const dataManager = require('./utils/dataManager');
const { notifyReadyPlants } = require('./utils/notifyWhenGrown');

// ตรวจสอบ Token
const token = process.env.TOKEN;
if (!token) {
  throw new Error('❌ ไม่พบ TOKEN ในไฟล์ .env');
}

// สร้าง Discord Client พร้อม Intent ที่จำเป็น
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();

// โหลดคำสั่ง Slash Commands จากโฟลเดอร์ commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`⚠️ คำสั่ง "${file}" ไม่มี property data หรือ execute`);
  }
}

// ฟังก์ชันวนลูปแจ้งเตือนพืชโต ด้วย setTimeout เพื่อป้องกันการเรียกซ้อนกัน
async function startNotifyLoop() {
  try {
    await notifyReadyPlants(client, dataManager);
  } catch (err) {
    console.error('❌ notifyReadyPlants error:', err);
  }
  setTimeout(startNotifyLoop, 10000);
}

// เมื่อบอทพร้อมใช้งาน
client.once(Events.ClientReady, async () => {
  console.log(`[${new Date().toISOString()}] ✅ เข้าสู่ระบบในชื่อ ${client.user.tag}`);
  console.log(`[${new Date().toISOString()}] 🌾 Discord Farm Bot พร้อมใช้งานแล้ว! โดย xᴇɴᴏ miss`);
  console.log(`[${new Date().toISOString()}] โหลดคำสั่งทั้งหมด ${client.commands.size} คำสั่ง`);

  // ส่งข้อความแจ้งเตือนในช่อง Discord ที่กำหนด (ถ้ามี)
  const channelId = process.env.READY_CHANNEL_ID;
  if (channelId) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (channel?.isTextBased?.()) {
        await channel.send('🤖 Discord Farm Bot พร้อมใช้งานแล้ว! สร้างโดย xᴇɴᴏ miss.');
      }
    } catch (err) {
      console.error('❌ ไม่สามารถส่งข้อความในช่องที่กำหนดได้:', err);
    }
  }

  // เริ่มลูปแจ้งเตือนพืชโต
  startNotifyLoop();
});

// ฟังเหตุการณ์ interaction (slash command)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`❌ ไม่พบคำสั่งชื่อ "${interaction.commandName}"`);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ ไม่พบคำสั่งนี้', ephemeral: true });
      }
    } catch (replyErr) {
      console.error('❌ ไม่สามารถส่งข้อความตอบกลับ interaction:', replyErr);
    }
    return;
  }

  try {
    await command.execute(interaction, dataManager, client);
  } catch (err) {
    console.error(`❌ เกิดข้อผิดพลาดในคำสั่ง ${interaction.commandName}:`, err);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '🚫 เกิดข้อผิดพลาดระหว่างการดำเนินการคำสั่งนี้', ephemeral: true });
      }
    } catch (replyErr) {
      console.error('❌ ไม่สามารถส่งข้อความตอบกลับ interaction เมื่อเกิด error:', replyErr);
    }
  }
});

// เริ่มล็อกอินบอท
(async () => {
  try {
    await client.login(token);
  } catch (err) {
    console.error('❌ ล็อกอินบอทล้มเหลว:', err);
  }
})();

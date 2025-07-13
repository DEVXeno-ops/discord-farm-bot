require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const dataManager = require('./utils/dataManager');
const { notifyReadyPlants } = require('./utils/notifyWhenGrown');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log('Discord Farm Bot by xᴇɴᴏ miss. ขอบคุณที่ใช้บอทนี้!');

  // ส่งข้อความแจ้งใน Discord channel (ถ้ามีตั้งค่าใน .env)
  const channelId = process.env.READY_CHANNEL_ID;
  if (channelId) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        channel.send('🤖 Discord Farm Bot พร้อมใช้งานแล้ว! สร้างโดย xᴇɴᴏ miss.');
      }
    } catch (error) {
      console.error('ไม่สามารถส่งข้อความในช่อง Discord ได้:', error);
    }
  }

  setInterval(() => notifyReadyPlants(client, dataManager), 10000);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, dataManager, client);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'เกิดข้อผิดพลาด', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

const dataPath = path.join(__dirname, 'data', 'users.json');

function loadUsers() {
  if (!fs.existsSync(dataPath)) return {};
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { return {}; }
}
function saveUsers(users) {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}
function ensureUserData(users, userId) {
  if (!users[userId]) users[userId] = { plants: [], inventory: 0, money: 100, upgradeLevel: 1, xp: 0, level: 1, plots: 1, lastPlantTime: 0 };
  return users[userId];
}
function checkPlantsReady(plants) {
  if (!Array.isArray(plants)) return;
  const now = Date.now();
  plants.forEach(p => { if (!p.ready && now - p.plantedAt >= p.growTime) p.ready = true; });
}

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    const users = loadUsers();
    const userId = interaction.user.id;
    ensureUserData(users, userId);
    saveUsers(users);

    try {
      await command.execute(interaction, users, saveUsers, ensureUserData, checkPlantsReady);
    } catch {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'เกิดข้อผิดพลาด', ephemeral: true });
      } else {
        await interaction.reply({ content: 'เกิดข้อผิดพลาด', ephemeral: true });
      }
    }
  }

  if (interaction.isButton()) {
    const users = loadUsers();
    const userId = interaction.user.id;
    const user = ensureUserData(users, userId);
    const now = Date.now();

    switch (interaction.customId) {
      case 'plant':
        if (user.plants.length >= user.plots) return interaction.reply({ content: `❌ พื้นที่ปลูกเต็ม (${user.plots} แปลง)`, ephemeral: true });
        if (now - user.lastPlantTime < 10000) {
          const remain = Math.ceil((10000 - (now - user.lastPlantTime))/1000);
          return interaction.reply({ content: `⏳ โปรดรออีก ${remain} วินาทีก่อนปลูก`, ephemeral: true });
        }
        user.plants.push({ plantedAt: now, growTime: 30000 / user.upgradeLevel, ready: false });
        user.lastPlantTime = now;
        saveUsers(users);
        return interaction.reply({ content: `🌱 ปลูกพืชเรียบร้อย! ใช้เวลา ${Math.floor((30000 / user.upgradeLevel)/1000)} วินาทีจนโต`, ephemeral: true });

      case 'harvest':
        checkPlantsReady(user.plants);
        const readyPlants = user.plants.filter(p => p.ready);
        if (readyPlants.length === 0) return interaction.reply({ content: '❌ ไม่มีพืชโตพร้อมเก็บเกี่ยว', ephemeral: true });
        const harvestCount = readyPlants.length;
        user.inventory += harvestCount;
        user.plants = user.plants.filter(p => !p.ready);
        user.xp += harvestCount * 10;
        user.money += harvestCount * 20;
        if (user.xp >= user.level * 100) { user.level++; user.xp = 0; }
        saveUsers(users);
        return interaction.reply({ content: `🌾 เก็บเกี่ยว ${harvestCount} ต้น\n💰 ได้เงิน ${harvestCount * 20}\n⭐ ได้ XP ${harvestCount * 10}`, ephemeral: true });

      case 'upgrade':
        {
          const cost = user.upgradeLevel * 100;
          if (user.money < cost) return interaction.reply({ content: `❌ เงินไม่พอ อัปเกรดต้องใช้ ${cost}`, ephemeral: true });
          user.money -= cost;
          user.upgradeLevel++;
          saveUsers(users);
          return interaction.reply({ content: `📈 อัปเกรดฟาร์มเป็นระดับ ${user.upgradeLevel}`, ephemeral: true });
        }

      case 'buyplot':
        {
          const cost = 50;
          if (user.money < cost) return interaction.reply({ content: `❌ เงินไม่พอ ซื้อพื้นที่ปลูกต้องใช้ ${cost}`, ephemeral: true });
          user.money -= cost;
          user.plots++;
          saveUsers(users);
          return interaction.reply({ content: `🛒 ซื้อพื้นที่ปลูกเพิ่ม 1 แปลง (ตอนนี้ ${user.plots} แปลง)`, ephemeral: true });
        }

      case 'refresh':
        {
          const farmCommand = client.commands.get('farm');
          if (!farmCommand) return interaction.reply({ content: '❌ ไม่พบคำสั่ง /farm', ephemeral: true });
          return farmCommand.execute(interaction, users, saveUsers, ensureUserData, checkPlantsReady);
        }

      default:
        return interaction.reply({ content: '❌ ปุ่มไม่รู้จัก', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);

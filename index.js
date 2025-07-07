require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const dataManager = require('./utils/dataManager');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = require('fs').readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// ฟังก์ชันตรวจสอบว่าพืชพร้อมเก็บหรือยัง (update ready flag)
function checkPlantsReady(plants) {
  const now = Date.now();
  plants.forEach(plant => {
    if (!plant.ready && now - plant.plantedAt >= plant.growTime) {
      plant.ready = true;
    }
  });
}

// ฟังก์ชัน cooldown ปลูกพืช (ms)
const PLANT_COOLDOWN = 15000; // 15 วินาที

client.once('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, dataManager);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'เกิดข้อผิดพลาดในคำสั่ง', ephemeral: true });
      } else {
        await interaction.reply({ content: 'เกิดข้อผิดพลาดในคำสั่ง', ephemeral: true });
      }
    }
  }

  if (interaction.isButton()) {
    const userId = interaction.user.id;
    const userData = dataManager.getUserData(userId);
    checkPlantsReady(userData.plants);
    const now = Date.now();

    try {
      switch (interaction.customId) {
        case 'plant':
          if (userData.plants.length >= userData.plots) {
            return interaction.reply({ content: `❌ พื้นที่ปลูกเต็ม (${userData.plots} แปลง)`, ephemeral: true });
          }
          if (now - userData.lastPlantTime < PLANT_COOLDOWN) {
            const remain = Math.ceil((PLANT_COOLDOWN - (now - userData.lastPlantTime)) / 1000);
            return interaction.reply({ content: `⏳ โปรดรออีก ${remain} วินาทีก่อนปลูก`, ephemeral: true });
          }
          const growTime = 30000 / userData.upgradeLevel;
          userData.plants.push({ plantedAt: now, growTime, ready: false });
          userData.lastPlantTime = now;
          dataManager.updateUserData(userId, userData);
          return interaction.reply({ content: `🌱 ปลูกพืชเรียบร้อย! ใช้เวลา ${Math.floor(growTime / 1000)} วินาทีจนโต`, ephemeral: true });

        case 'harvest':
          {
            const readyPlants = userData.plants.filter(p => p.ready);
            if (readyPlants.length === 0) return interaction.reply({ content: '❌ ไม่มีพืชโตพร้อมเก็บเกี่ยว', ephemeral: true });

            const harvestCount = readyPlants.length;
            userData.inventory += harvestCount;
            userData.plants = userData.plants.filter(p => !p.ready);
            userData.xp += harvestCount * 10;
            userData.money += harvestCount * 20;

            // Level up check
            if (userData.xp >= userData.level * 100) {
              userData.level++;
              userData.xp = 0;
            }
            dataManager.updateUserData(userId, userData);

            return interaction.reply({
              content: `🌾 เก็บเกี่ยว ${harvestCount} ต้น\n💰 ได้เงิน ${harvestCount * 20}\n⭐ ได้ XP ${harvestCount * 10}`,
              ephemeral: true
            });
          }

        case 'upgrade':
          {
            const cost = userData.upgradeLevel * 100;
            if (userData.money < cost) return interaction.reply({ content: `❌ เงินไม่พอ อัปเกรดต้องใช้ ${cost} เหรียญ`, ephemeral: true });
            userData.money -= cost;
            userData.upgradeLevel++;
            dataManager.updateUserData(userId, userData);
            return interaction.reply({ content: `📈 อัปเกรดฟาร์มเป็นระดับ ${userData.upgradeLevel}`, ephemeral: true });
          }

        case 'buyplot':
          {
            const cost = 50;
            if (userData.money < cost) return interaction.reply({ content: `❌ เงินไม่พอ ซื้อพื้นที่ปลูกต้องใช้ ${cost} เหรียญ`, ephemeral: true });
            userData.money -= cost;
            userData.plots++;
            dataManager.updateUserData(userId, userData);
            return interaction.reply({ content: `🛒 ซื้อพื้นที่ปลูกเพิ่ม 1 แปลง (ตอนนี้ ${userData.plots} แปลง)`, ephemeral: true });
          }

        case 'refresh':
          {
            const farmCmd = client.commands.get('farm');
            if (!farmCmd) return interaction.reply({ content: '❌ ไม่พบคำสั่ง /farm', ephemeral: true });
            return farmCmd.execute(interaction, dataManager);
          }

        default:
          return interaction.reply({ content: '❌ ปุ่มไม่รู้จัก', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'เกิดข้อผิดพลาด', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);

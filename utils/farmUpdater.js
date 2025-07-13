const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const plantsData = require('../data/plants');

function createFarmEmbed(userData, interaction) {
  const total = Array.isArray(userData.plants) ? userData.plants.length : 0;
  const ready = Array.isArray(userData.plants) ? userData.plants.filter(p => p.ready).length : 0;
  const growing = total - ready;

  return new EmbedBuilder()
    .setTitle(`🌾 ฟาร์มของ ${interaction.user.username}`)
    .setColor('#57f287')
    .addFields(
      { name: '🌱 พืชโตแล้ว', value: `${ready}`, inline: true },
      { name: '🌿 กำลังเติบโต', value: `${growing}`, inline: true },
      { name: '📦 คลัง', value: `${userData.inventory ?? 0}`, inline: true },
      { name: '💰 เงิน', value: `${userData.money ?? 0}`, inline: true },
      { name: '🛖 พื้นที่ปลูก', value: `${userData.plots ?? 0}`, inline: true }
    )
    .setFooter({ text: 'ใช้ปุ่มด้านล่างเพื่อจัดการฟาร์ม' });
}

function farmButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('plant').setLabel('🌱 ปลูก').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('harvest').setLabel('🌾 เก็บเกี่ยว').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('refresh').setLabel('🔄 รีเฟรช').setStyle(ButtonStyle.Primary),
  );
}

async function sendFarmWithAutoUpdate(interaction, dataManager) {
  const userId = interaction.user.id;
  let userData = dataManager.getUserData(userId);

  if (!userData) {
    return interaction.reply({ content: '❌ ไม่พบข้อมูลฟาร์มของคุณ', ephemeral: true });
  }

  const now = Date.now();
  if (Array.isArray(userData.plants)) {
    userData.plants.forEach(p => {
      if (!p.ready && now - p.plantedAt >= p.growTime) p.ready = true;
    });
  }
  dataManager.updateUserData(userId, userData);

  let message;
  try {
    message = await interaction.reply({
      embeds: [createFarmEmbed(userData, interaction)],
      components: [farmButtons()],
      ephemeral: true,
      fetchReply: true,
    });
  } catch (error) {
    console.error('Error replying to interaction:', error);
    return;
  }

  const interval = setInterval(async () => {
    try {
      userData = dataManager.getUserData(userId);
      const now = Date.now();

      let updated = false;
      if (Array.isArray(userData.plants)) {
        userData.plants.forEach(plant => {
          if (!plant.ready && now - plant.plantedAt >= plant.growTime) {
            plant.ready = true;
            updated = true;
          }
        });
      }

      if (updated) dataManager.updateUserData(userId, userData);

      await message.edit({
        embeds: [createFarmEmbed(userData, interaction)],
        components: [farmButtons()],
      });
    } catch (err) {
      console.error('Error in farm auto update interval:', err);
      clearInterval(interval);
    }
  }, 10000);

  setTimeout(() => {
    clearInterval(interval);
  }, 300000); // หยุดหลัง 5 นาที
}

module.exports = { sendFarmWithAutoUpdate };

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const plantsData = require('../data/plants');

function createFarmEmbed(userData, interaction) {
  const total = userData.plants.length;
  const ready = userData.plants.filter(p => p.ready).length;
  const growing = total - ready;

  return new EmbedBuilder()
    .setTitle(`🌾 ฟาร์มของ ${interaction.user.username}`)
    .setColor('#57f287')
    .addFields(
      { name: '🌱 พืชโตแล้ว', value: `${ready}`, inline: true },
      { name: '🌿 กำลังเติบโต', value: `${growing}`, inline: true },
      { name: '📦 คลัง', value: `${userData.inventory}`, inline: true },
      { name: '💰 เงิน', value: `${userData.money}`, inline: true },
      { name: '🛖 พื้นที่ปลูก', value: `${userData.plots}`, inline: true }
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

  const now = Date.now();
  userData.plants.forEach(p => {
    if (!p.ready && now - p.plantedAt >= p.growTime) p.ready = true;
  });
  dataManager.updateUserData(userId, userData);

  const message = await interaction.reply({
    embeds: [createFarmEmbed(userData, interaction)],
    components: [farmButtons()],
    ephemeral: true,
    fetchReply: true,
  });

  const interval = setInterval(async () => {
    try {
      userData = dataManager.getUserData(userId);
      const now = Date.now();

      let updated = false;
      userData.plants.forEach(plant => {
        if (!plant.ready && now - plant.plantedAt >= plant.growTime) {
          plant.ready = true;
          updated = true;
        }
      });

      if (updated) dataManager.updateUserData(userId, userData);

      await message.edit({
        embeds: [createFarmEmbed(userData, interaction)],
        components: [farmButtons()],
      });
    } catch (err) {
      clearInterval(interval);
    }
  }, 10000);

  setTimeout(() => clearInterval(interval), 300000); // 5 นาที
}

module.exports = { sendFarmWithAutoUpdate };

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
} = require('discord.js');
const plantsData = require('../data/plants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plant')
    .setDescription('🌱 ปลูกพืชในฟาร์มของคุณ'),

  async execute(interaction, dataManager) {
    const userId = interaction.user.id;
    const userData = dataManager.getUserData(userId);

    if (!userData || !Array.isArray(userData.plants) || typeof userData.plots !== 'number') {
      return interaction.reply({
        content: '❌ ไม่พบข้อมูลฟาร์มหรือข้อมูลไม่ถูกต้อง',
        ephemeral: true,
      });
    }

    if (userData.plants.length >= userData.plots) {
      return interaction.reply({
        content: '❌ คุณไม่มีช่องว่างเพียงพอในการปลูกพืช',
        ephemeral: true,
      });
    }

    // สร้าง select menu สำหรับพืช
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-plant')
      .setPlaceholder('🪴 เลือกพืชที่คุณต้องการปลูก')
      .addOptions(
        plantsData.map(plant => ({
          label: `${plant.name}`,
          description: `⏱️ โตภายใน ${plant.growTime / 1000} วินาที`,
          emoji: plant.emoji,
          value: plant.id,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🌿 เลือกพืชที่คุณต้องการปลูก')
      .setDescription('เลือกพืชจากรายการด้านล่างเพื่อปลูกลงในฟาร์มของคุณ')
      .setColor('#27ae60');

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 15000,
    });

    let hasResponded = false;

    collector.on('collect', async i => {
      if (i.user.id !== userId) {
        return i.reply({ content: '⛔ คุณไม่ได้เป็นเจ้าของเมนูนี้', ephemeral: true });
      }

      if (hasResponded) return; // ป้องกัน double response
      hasResponded = true;

      const selectedPlant = plantsData.find(p => p.id === i.values[0]);
      if (!selectedPlant) {
        return i.reply({ content: '❌ ไม่พบพืชที่คุณเลือก', ephemeral: true });
      }

      // เพิ่มพืชเข้าในฟาร์ม
      userData.plants.push({
        id: selectedPlant.id,
        plantedAt: Date.now(),
        growTime: selectedPlant.growTime,
        harvested: false,
      });

      dataManager.updateUserData(userId, userData);

      const plantedEmbed = new EmbedBuilder()
        .setTitle(`✅ ปลูก ${selectedPlant.name} สำเร็จ!`)
        .setDescription(`${selectedPlant.emoji} กำลังเติบโตในฟาร์มของคุณ`)
        .setColor('#2ecc71');

      await i.update({
        embeds: [plantedEmbed],
        components: [],
      });

      collector.stop();
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time' && !hasResponded) {
        await interaction.editReply({
          content: '⌛ หมดเวลาการเลือกพืชแล้ว',
          components: [],
          embeds: [],
        }).catch(() => {});
      }
    });
  },
};

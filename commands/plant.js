const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const plantsData = require('../data/plants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plant')
    .setDescription('ปลูกพืชในฟาร์มของคุณ'),

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

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-plant')
      .setPlaceholder('เลือกพืชที่ต้องการปลูก')
      .addOptions(
        plantsData.map(plant => ({
          label: `${plant.emoji} ${plant.name}`,
          description: `เวลาโต: ${plant.growTime / 1000} วินาที`,
          value: plant.id,
        })),
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const msg = await interaction.reply({
      content: '🌱 กรุณาเลือกพืชที่ต้องการปลูก:',
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 15000,
    });

    collector.on('collect', async i => {
      if (i.user.id !== userId) {
        return i.reply({ content: '⛔ ไม่ใช่ปุ่มของคุณ!', ephemeral: true });
      }

      try {
        const selectedPlant = plantsData.find(p => p.id === i.values[0]);
        if (!selectedPlant) {
          return i.reply({ content: '❌ ไม่พบพืชที่เลือก', ephemeral: true });
        }

        userData.plants.push({
          id: selectedPlant.id,
          plantedAt: Date.now(),
          growTime: selectedPlant.growTime,
          harvested: false,
        });

        dataManager.updateUserData(userId, userData);

        await i.update({
          content: `✅ คุณได้ปลูก ${selectedPlant.emoji} **${selectedPlant.name}**!`,
          components: [],
        });

        collector.stop();
      } catch (error) {
        console.error('Error in plant select collector:', error);
        await i.reply({ content: 'เกิดข้อผิดพลาดในการปลูกพืช', ephemeral: true });
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({
          content: '⌛ หมดเวลาการเลือกพืชแล้ว',
          components: [],
        }).catch(() => {});
      }
    });
  },
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('📦 ดูของในคลังของคุณ'),

  async execute(interaction, dataManager) {
    const userId = interaction.user.id;
    const userData = dataManager.getUserData(userId);

    // กำหนดค่า default ถ้าไม่มีข้อมูล
    const inventory = userData?.inventory ?? 0;
    const money = userData?.money ?? 0;

    const embed = new EmbedBuilder()
      .setTitle(`📦 คลังของ ${interaction.user.username}`)
      .setColor('#3498db')
      .addFields(
        { name: '🌾 จำนวนของในคลัง', value: `${inventory} ชิ้น`, inline: true },
        { name: '💰 เงินในบัญชี', value: `${money} เงิน`, inline: true },
      )
      .setFooter({ text: 'คำสั่ง /inventory' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

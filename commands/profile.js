const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('ดูโปรไฟล์ของคุณ'),

  async execute(interaction, dataManager) {
    const userData = dataManager.getUserData(interaction.user.id) || {};

    // กำหนดค่าเริ่มต้น หากไม่มีข้อมูล
    const money = typeof userData.money === 'number' ? userData.money : 0;
    const level = typeof userData.level === 'number' ? userData.level : 1;
    const xp = typeof userData.xp === 'number' ? userData.xp : 0;
    const inventory = typeof userData.inventory === 'number' ? userData.inventory : 0;
    const plots = typeof userData.plots === 'number' ? userData.plots : 0;
    const upgradeLevel = typeof userData.upgradeLevel === 'number' ? userData.upgradeLevel : 0;

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} โปรไฟล์ฟาร์ม`)
      .setColor('#5865F2')
      .addFields(
        { name: '💰 เงิน', value: `${money}`, inline: true },
        { name: '⭐ เลเวล', value: `${level}`, inline: true },
        { name: '🧪 XP', value: `${xp} / ${level * 100}`, inline: true },
        { name: '📦 คลัง', value: `${inventory}`, inline: true },
        { name: '📏 พื้นที่ปลูก', value: `${plots}`, inline: true },
        { name: '📈 เลเวลฟาร์ม', value: `${upgradeLevel}`, inline: true },
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

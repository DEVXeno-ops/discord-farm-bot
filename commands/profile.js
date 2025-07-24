const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('👤 ดูโปรไฟล์ฟาร์มของคุณ'),

  async execute(interaction, dataManager) {
    const user = interaction.user;
    const userData = dataManager.getUserData(user.id) || {};

    // กำหนดค่าเริ่มต้น
    const money = typeof userData.money === 'number' ? userData.money : 0;
    const level = typeof userData.level === 'number' ? userData.level : 1;
    const xp = typeof userData.xp === 'number' ? userData.xp : 0;
    const inventory = typeof userData.inventory === 'number' ? userData.inventory : 0;
    const plots = typeof userData.plots === 'number' ? userData.plots : 1;
    const upgradeLevel = typeof userData.upgradeLevel === 'number' ? userData.upgradeLevel : 0;

    const xpRequired = level * 100;
    const xpPercent = Math.min(Math.floor((xp / xpRequired) * 100), 100);
    const progressBar = createProgressBar(xpPercent, 15);

    const embed = new EmbedBuilder()
      .setTitle(`🌾 โปรไฟล์ของ ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor('#5865F2')
      .addFields(
        { name: '💰 เงิน', value: `${money} 💵`, inline: true },
        { name: '⭐ เลเวล', value: `${level}`, inline: true },
        { name: '📈 XP', value: `${xp} / ${xpRequired}\n${progressBar}`, inline: false },
        { name: '📦 คลัง', value: `${inventory} หน่วย`, inline: true },
        { name: '📏 พื้นที่ปลูก', value: `${plots} ช่อง`, inline: true },
        { name: '🏡 เลเวลฟาร์ม', value: `${upgradeLevel}`, inline: true },
      )
      .setFooter({ text: 'โปรไฟล์ฟาร์มของคุณ' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

// ฟังก์ชันสร้าง progress bar แบบเท่ ๆ
function createProgressBar(percent, length = 10) {
  const filledLength = Math.round((percent / 100) * length);
  const emptyLength = length - filledLength;
  const filledBar = '█'.repeat(filledLength);
  const emptyBar = '░'.repeat(emptyLength);
  return `${filledBar}${emptyBar} ${percent}%`;
}

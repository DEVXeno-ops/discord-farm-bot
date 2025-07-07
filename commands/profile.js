const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('ดูโปรไฟล์ของคุณ'),
  async execute(interaction, users, saveUsers, ensureUserData) {
    const user = ensureUserData(users, interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} โปรไฟล์ฟาร์ม`)
      .setColor(0x5ac18e)
      .addFields(
        { name: '💰 เงิน', value: `${user.money}`, inline: true },
        { name: '⭐ เลเวล', value: `${user.level}`, inline: true },
        { name: '🧪 XP', value: `${user.xp} / ${user.level * 100}`, inline: true },
        { name: '📦 คลัง', value: `${user.inventory}`, inline: true },
        { name: '📏 พื้นที่ปลูก', value: `${user.plots}`, inline: true },
        { name: '📈 เลเวลฟาร์ม', value: `${user.upgradeLevel}`, inline: true },
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

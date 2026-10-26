const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserStats, getCommunityPool } = require('../database/db');
const { categoryNames } = require('../data/wellbeingTips');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pisteet')
    .setDescription('Tarkastele omia hyvinvointipisteitäsi (näkyy vain sinulle)'),

  async execute(interaction) {
    try {
      const stats = await getUserStats(interaction.user.id);
      const pool = await getCommunityPool();

      const allCategories = ['liikunta', 'ravitsemus', 'luovuus', 'sosiaaliset', 'lepo'];
      const statusLines = allCategories.map(cat => {
        const isDone = stats.categoriesToday.includes(cat);
        const icon = isDone ? '✅' : '⚪';
        return `${icon} ${categoryNames[cat]}`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x0984e3)
        .setTitle(`🥄 ${interaction.user.username} — Omat hyvinvointilusikat`)
        .setDescription('Tämä näkymä on täysin yksityinen. Muut osallistujat eivät näe pisteitäsi.')
        .addFields(
          { name: 'Omat kokonaispisteet', value: `**${stats.totalPoints}** lusikkaa`, inline: true },
          { name: 'Tämän viikon pisteet', value: `**${stats.weekPoints}** lusikkaa`, inline: true },
          { name: 'Yhteisön potti', value: `**${pool.total_points}** lusikkaa`, inline: true },
          { name: 'Tämän päivän suoritukset (max 5/pv)', value: statusLines }
        )
        .setFooter({ text: 'Jokainen teko kerryttää yhteistä pottia ja edistää omaa jaksamista!' });

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    } catch (error) {
      console.error('Virhe pisteet-komennossa:', error);
      return interaction.reply({
        content: '❌ Virhe pisteiden haussa. Yritä hetken kuluttua uudelleen.',
        ephemeral: true
      });
    }
  }
};

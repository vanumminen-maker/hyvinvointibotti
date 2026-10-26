const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logAction } = require('../database/db');
const { categoryNames } = require('../data/wellbeingTips');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hyvinvointi')
    .setDescription('Kirjaa päivän hyvinvointiteko (enintään 1 per kategoria / päivä, max 5/pv)')
    .addStringOption(option =>
      option.setName('kategoria')
        .setDescription('Valitse teon kategoria')
        .setRequired(true)
        .addChoices(
          { name: '🏃 Liikunta', value: 'liikunta' },
          { name: '🥗 Ravitsemus', value: 'ravitsemus' },
          { name: '🎨 Luovuus', value: 'luovuus' },
          { name: '👥 Sosiaaliset kontaktit', value: 'sosiaaliset' },
          { name: '😴 Lepo & palautuminen', value: 'lepo' }
        ))
    .addStringOption(option =>
      option.setName('kuvaus')
        .setDescription('Kuvaile lyhyesti mitä teit (esim. "Kävin 15 min kävelyllä")')
        .setRequired(true)
        .setMaxLength(250)),

  async execute(interaction) {
    const category = interaction.options.getString('kategoria');
    const description = interaction.options.getString('kuvaus');
    const discordId = interaction.user.id;
    const username = interaction.user.username;

    try {
      const result = await logAction(discordId, username, category, description);

      if (!result.success) {
        if (result.reason === 'CATEGORY_ALREADY_LOGGED') {
          return interaction.reply({
            content: `⚠️ Olet jo kirjannut teon kategoriaan **${categoryNames[category]}** tälle päivälle! Voit kirjata yhden teon per kategoria joka päivä (yhteensä max 5/pv).`,
            ephemeral: true
          });
        }
        if (result.reason === 'DAILY_LIMIT_REACHED') {
          return interaction.reply({
            content: `🎉 Olet jo saavuttanut päivän maksimin (5/5 tekoa kaikista kategorioista)! Huikeaa työtä, lepää ja palaa huomenna!`,
            ephemeral: true
          });
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x00b894)
        .setTitle('✅ Hyvinvointiteko kirjattu!')
        .setDescription(`**Kategoria:** ${categoryNames[category]}\n**Teko:** "${description}"\n\n🥄 **+1 lusikka** lisätty omaan pottiisi ja yhteisön yhteiseen pottiin!`)
        .setFooter({ text: `Tänään suoritettu: ${result.loggedCountToday} / 5 kategoriaa • Pisteet ovat yksityisiä` });

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    } catch (error) {
      console.error('Virhe hyvinvointi-komennossa:', error);
      return interaction.reply({
        content: '❌ Tapahtui virhe tekoa kirjatessa. Yritä hetken kuluttua uudelleen.',
        ephemeral: true
      });
    }
  }
};

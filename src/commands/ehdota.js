const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { wellbeingTips, categoryNames } = require('../data/wellbeingTips');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ehdota')
    .setDescription('Pyydä ideoita ja esimerkkejä pienistä hyvinvointiteoista')
    .addStringOption(option =>
      option.setName('kategoria')
        .setDescription('Valitse halutessasi tietty kategoria (tai jätä tyhjäksi nähdäksesi kaikista)')
        .setRequired(false)
        .addChoices(
          { name: '🏃 Liikunta', value: 'liikunta' },
          { name: '🥗 Ravitsemus', value: 'ravitsemus' },
          { name: '🎨 Luovuus', value: 'luovuus' },
          { name: '👥 Sosiaaliset kontaktit', value: 'sosiaaliset' },
          { name: '😴 Lepo & palautuminen', value: 'lepo' }
        )),

  async execute(interaction) {
    const selectedCategory = interaction.options.getString('kategoria');

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('💡 Esimerkkejä pienistä hyvinvointiteoista')
      .setDescription('Nämä ovat yhteisön kokoamia esimerkkejä. Voit aina soveltaa tekoja omaan jaksamiseesi sopiviksi — pienikin teko on arvokas! 🥄');

    if (selectedCategory && wellbeingTips[selectedCategory]) {
      const tips = wellbeingTips[selectedCategory];
      // Poimitaan satunnaiset 4 vinkkiä tai kaikki jos vähemmän
      const shuffled = [...tips].sort(() => 0.5 - Math.random()).slice(0, 4);
      embed.addFields({
        name: categoryNames[selectedCategory],
        value: shuffled.map(t => `• ${t}`).join('\n')
      });
    } else {
      // Yksi satunnainen jokaisesta kategoriasta
      for (const [catKey, tips] of Object.entries(wellbeingTips)) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        embed.addFields({
          name: categoryNames[catKey],
          value: `• ${randomTip}`
        });
      }
    }

    embed.setFooter({ text: 'Kirjaa teko komennolla: /hyvinvointi' });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};

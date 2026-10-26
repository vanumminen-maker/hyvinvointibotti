const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { buyItem, getCommunityPool } = require('../database/db');
const { shopItems } = require('../data/shopItems');

function isAdmin(member) {
  if (!member) return false;
  if (member.permissions && member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }
  const roleName = process.env.ADMIN_ROLE_NAME || 'Ylläpito';
  return member.roles.cache.some(r => r.name.toLowerCase() === roleName.toLowerCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('osta')
    .setDescription('Ylläpito: Osta kala, koriste tai lahjoitus yhteisöpisteillä')
    .addStringOption(option => {
      option.setName('tuote')
        .setDescription('Valitse ostettava tuote kaupasta')
        .setRequired(true);

      for (const item of shopItems) {
        option.addChoices({
          name: `${item.emoji} ${item.name} (${item.price} p)`,
          value: item.key
        });
      }
      return option;
    }),

  async execute(interaction) {
    // Tarkistetaan ylläpito-oikeus
    if (!isAdmin(interaction.member)) {
      const roleName = process.env.ADMIN_ROLE_NAME || 'Ylläpito';
      return interaction.reply({
        content: `⛔ Vain roolin **${roleName}** jäsenet voivat tehdä ostoja yhteisöpisteillä.`,
        ephemeral: true
      });
    }

    const itemKey = interaction.options.getString('tuote');
    const shopItem = shopItems.find(i => i.key === itemKey);

    if (!shopItem) {
      return interaction.reply({
        content: `❌ Tuotetta ei löytynyt valikoimasta.`,
        ephemeral: true
      });
    }

    try {
      const result = await buyItem(itemKey);

      if (!result.success) {
        if (result.reason === 'NOT_ENOUGH_POINTS') {
          return interaction.reply({
            content: `⚠️ Yhteisöpotissa ei ole tarpeeksi pisteitä tuotteelle **${shopItem.name}**! Hinta on **${result.required}** pistettä, mutta potissa on vain **${result.current}** pistettä.`,
            ephemeral: true
          });
        }
        return interaction.reply({
          content: `❌ Osto epäonnistui: ${result.reason}`,
          ephemeral: true
        });
      }

      const pool = await getCommunityPool();

      if (result.isDonation) {
        const embed = new EmbedBuilder()
          .setColor(0xe84393)
          .setTitle('🐾 UPEAA! YHTEISÖN LAHJOITUS ON TEHTY! ❤️')
          .setDescription(`Yhteisö on yhdessä kerännyt tarvittavat **${shopItem.price} lusikkaa** ja suorittanut tavoitteen:\n\n` +
            `🎉 **${shopItem.name}**!\n\n` +
            `Kiitos jokaiselle osallistujalle oman ja toisten hyvinvoinnin edistämisestä! Pottiin jäi: **${pool.total_points}** lusikkaa.`)
          .setFooter({ text: 'Oston suoritti ylläpito: ' + interaction.user.username });

        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor(0x00b894)
        .setTitle(`🎉 Akvaarioon hankittiin uusi asukas / esine!`)
        .setDescription(`Ylläpito hankki akvaarioon: ${shopItem.emoji} **${shopItem.name}**\n\n` +
          `• **Hinta:** ${shopItem.price} lusikkaa\n` +
          `• **Yhteisöpotissa jäljellä:** ${pool.total_points} lusikkaa 🥄\n\n` +
          `Voit ihailla akvaariota komennolla \`/akvaario\`!`)
        .setFooter({ text: 'Ostaja: ' + interaction.user.username });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Virhe osta-komennossa:', error);
      return interaction.reply({
        content: '❌ Ostotapahtuma epäonnistui tietokantavirheen vuoksi.',
        ephemeral: true
      });
    }
  }
};

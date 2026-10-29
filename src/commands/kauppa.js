const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { shopItems } = require('../data/shopItems');
const { getCommunityPool } = require('../database/db');

/**
 * Jakaa esinelistan Discord-kenttiin niin, että 1024 merkin raja ei koskaan ylity
 */
function createChunkedFields(title, items, formatFn) {
  const fields = [];
  let currentText = '';
  let part = 1;

  for (const item of items) {
    const formatted = formatFn(item);
    if (currentText.length + formatted.length + 2 > 950) {
      fields.push({
        name: `${title} (${part})`,
        value: currentText.trim()
      });
      part++;
      currentText = formatted;
    } else {
      currentText += (currentText ? '\n\n' : '') + formatted;
    }
  }

  if (currentText.trim()) {
    fields.push({
      name: part > 1 ? `${title} (${part})` : title,
      value: currentText.trim()
    });
  }

  return fields;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kauppa')
    .setDescription('Selaa akvaarion kauppavalikoimaa ja hintoja'),

  async execute(interaction) {
    try {
      const pool = await getCommunityPool();

      const formatItem = (i) => `${i.emoji} **${i.name}** (\`${i.key}\`)\n└ Hinta: **${i.price} p** (Myynti: ${i.sellPrice} p) — *${i.description}*`;
      const formatDonation = (i) => `${i.emoji} **${i.name}** (\`${i.key}\`)\n└ Tavoite: **${i.price} p** — *${i.description}*`;

      const fishItems = shopItems.filter(i => i.type === 'fish');
      const decoItems = shopItems.filter(i => i.type === 'decoration');
      const donationItems = shopItems.filter(i => i.type === 'donation');

      const fields = [
        ...createChunkedFields('🐟 Kalat', fishItems, formatItem),
        ...createChunkedFields('🏰 Sisustuselementit', decoItems, formatItem),
        ...createChunkedFields('❤️ Hyväntekeväisyys & lahjoitus', donationItems, formatDonation)
      ];

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('🏪 Hyvinvointiakvaarion Kauppa')
        .setDescription(`Yhteisön yhteisöpotti on tällä hetkellä: **${pool.total_points} lusikkaa** 🥄\n` +
          `*Vain ylläpitorooli voi suorittaa ostoja tai myyntejä yhteisöpisteillä komennolla \`/osta\` tai \`/myy\`.*`)
        .addFields(fields)
        .setFooter({ text: 'Osta komennolla: /osta tuote:<avain>' });

      return interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error('Virhe kauppa-komennossa:', error);
      return interaction.reply({
        content: '❌ Kaupan tietojen haku epäonnistui.',
        ephemeral: true
      });
    }
  }
};

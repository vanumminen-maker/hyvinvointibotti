const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { shopItems } = require('../data/shopItems');
const { getCommunityPool } = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kauppa')
    .setDescription('Selaa akvaarion kauppavalikoimaa ja hintoja'),

  async execute(interaction) {
    try {
      const pool = await getCommunityPool();

      const fishList = shopItems
        .filter(i => i.type === 'fish')
        .map(i => `${i.emoji} **${i.name}** (\`${i.key}\`)\n└ Hinta: **${i.price} p** (Myynti: ${i.sellPrice} p) — *${i.description}*`)
        .join('\n\n');

      const decoList = shopItems
        .filter(i => i.type === 'decoration')
        .map(i => `${i.emoji} **${i.name}** (\`${i.key}\`)\n└ Hinta: **${i.price} p** (Myynti: ${i.sellPrice} p) — *${i.description}*`)
        .join('\n\n');

      const donationList = shopItems
        .filter(i => i.type === 'donation')
        .map(i => `${i.emoji} **${i.name}** (\`${i.key}\`)\n└ Tavoite: **${i.price} p** — *${i.description}*`)
        .join('\n\n');

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('🏪 Hyvinvointiakvaarion Kauppa')
        .setDescription(`Yhteisön yhteisöpotti on tällä hetkellä: **${pool.total_points} lusikkaa** 🥄\n` +
          `*Vain ylläpitorooli voi suorittaa ostoja tai myyntejä yhteisöpisteillä komennolla \`/osta\` tai \`/myy\`.*`)
        .addFields(
          { name: '🐟 Kalat (10 kpl)', value: fishList },
          { name: '🏰 Sisustuselementit (6 kpl)', value: decoList },
          { name: '❤️ Hyväntekeväisyys & lahjoitukset', value: donationList }
        )
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

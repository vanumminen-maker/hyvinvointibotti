const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sellItem, getAquariumItems, getCommunityPool } = require('../database/db');

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
    .setName('myy')
    .setDescription('Ylläpito: Myy akvaarion kala tai esine takaisin pisteiksi yhteisöpottiin')
    .addStringOption(option =>
      option.setName('tunnus')
        .setDescription('Akvaariossa olevan esineen ID tai nimi (esim. kultakala tai ID-numero)')
        .setRequired(true)),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      const roleName = process.env.ADMIN_ROLE_NAME || 'Ylläpito';
      return interaction.reply({
        content: `⛔ Vain roolin **${roleName}** jäsenet voivat myydä akvaarion esineitä.`,
        ephemeral: true
      });
    }

    const identifier = interaction.options.getString('tunnus');

    try {
      const result = await sellItem(identifier);

      if (!result.success) {
        if (result.reason === 'ITEM_NOT_IN_AQUARIUM') {
          const currentItems = await getAquariumItems();
          const list = currentItems.map(i => `#${i.id}: ${i.emoji || ''} ${i.item_name}`).join('\n') || 'Akvaariossa ei ole tällä hetkellä mitään.';
          return interaction.reply({
            content: `⚠️ Esinettä ei löytynyt akvaariosta haulla "${identifier}".\n\n**Nykyiset esineet akvaariossa:**\n${list}`,
            ephemeral: true
          });
        }
        return interaction.reply({
          content: `❌ Myynti epäonnistui: ${result.reason}`,
          ephemeral: true
        });
      }

      const pool = await getCommunityPool();

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle('🪙 Esine myyty yhteisöpottiin!')
        .setDescription(`Ylläpito myi akvaariosta esineen: **${result.soldItem.item_name}** (ID #${result.soldItem.id})\n\n` +
          `• **Palautetut pisteet:** +${result.refund} lusikkaa 🥄\n` +
          `• **Yhteisöpotissa nyt:** **${pool.total_points}** lusikkaa\n\n` +
          `Pisteet ovat nyt käytettävissä uusiin hankintoihin tai hyväntekeväisyyslahjoitukseen!`)
        .setFooter({ text: 'Myyjä: ' + interaction.user.username });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Virhe myy-komennossa:', error);
      return interaction.reply({
        content: '❌ Myynti epäonnistui tietokantavirheen vuoksi.',
        ephemeral: true
      });
    }
  }
};

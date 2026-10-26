const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getAquariumItems, getCommunityPool } = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('akvaario')
    .setDescription('Näytä yhteisön hyvinvointiakvaario ja sen asukkaat kuvana'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { drawAquarium } = require('../canvas/akvaario');
      const items = await getAquariumItems();
      const pool = await getCommunityPool();

      const imageBuffer = drawAquarium(items, pool.total_points, pool.total_donations);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'akvaario.png' });

      const fishCount = items.filter(i => i.item_type === 'fish').length;
      const decoCount = items.filter(i => i.item_type === 'decoration').length;

      const embed = new EmbedBuilder()
        .setColor(0x00cec9)
        .setTitle('🐠 Yhteisön Hyvinvointiakvaario')
        .setDescription(`Yhdessä kerätyillä lusikoilla rakentuva akvaariomme!\n\n` +
          `• **Yhteisöpotti:** ${pool.total_points} lusikkaa 🥄\n` +
          `• **Kaloja:** ${fishCount} kpl\n` +
          `• **Sisustuselementtejä:** ${decoCount} kpl\n` +
          (pool.total_donations > 0 ? `• **Eläinsuojelulahjoituksia:** ${pool.total_donations} kpl ❤️\n` : ''))
        .setImage('attachment://akvaario.png')
        .setFooter({ text: 'Uusia kaloja ja esineitä voi hankkia yhteispisteillä /kauppa ja /osta' });

      return interaction.editReply({
        embeds: [embed],
        files: [attachment]
      });
    } catch (error) {
      console.error('Virhe akvaario-komennossa:', error);
      return interaction.editReply({
        content: '❌ Akvaarion kuvan luonti epäonnistui. Yritä uudelleen myöhemmin.'
      });
    }
  }
};

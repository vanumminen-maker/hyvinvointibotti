const cron = require('node-cron');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getDailyActions, getWeeklyStats, getCommunityPool } = require('../database/db');
const { drawHyvinvointimies } = require('../canvas/hyvinvointimies');
const { categoryNames } = require('../data/wellbeingTips');

/**
 * Lähettää päivittäisen yhteenvedon ja Hyvinvointimies-kuvan
 */
async function sendDailySummary(client) {
  const channelId = process.env.DAILY_CHANNEL_ID;
  if (!channelId) {
    console.warn('⚠️ DAILY_CHANNEL_ID ei ole asetettu!');
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error(`❌ Päivittäistä kanavaa ei löytynyt ID:llä ${channelId}`);
      return;
    }

    const daily = await getDailyActions();
    const pool = await getCommunityPool();

    const now = new Date();
    const dateStr = now.toLocaleDateString('fi-FI', {
      timeZone: 'Europe/Helsinki',
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    // Piirretään päivän Hyvinvointimies
    const imageBuffer = drawHyvinvointimies(daily.categoryCounts, daily.totalToday, dateStr);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'hyvinvointimies.png' });

    if (daily.totalToday === 0) {
      const emptyEmbed = new EmbedBuilder()
        .setColor(0x74b9ff)
        .setTitle(`🌙 Päivän hyvinvointikooste — ${dateStr}`)
        .setDescription(`Tänään ei kirjattu uusia hyvinvointitekoja. Muistathan, että lepo ja olemisen sietäminenkin ovat tärkeitä! Huomenna on taas uusi päivä. 🥄\n\nYhteisöpotissa on nyt **${pool.total_points}** lusikkaa.`)
        .setImage('attachment://hyvinvointimies.png')
        .setFooter({ text: 'Voit kirjata tekoja komennolla /hyvinvointi' });

      await channel.send({ embeds: [emptyEmbed], files: [attachment] });
      return;
    }

    // Muotoillaan anonyymi lista teoista kategorioittain
    const categoryOrder = ['liikunta', 'ravitsemus', 'luovuus', 'sosiaaliset', 'lepo'];
    const fields = [];

    for (const cat of categoryOrder) {
      const items = daily.grouped[cat] || [];
      if (items.length > 0) {
        // Otetaan lista teoista ja muotoillaan ranskalaisilla viivoilla
        const text = items.map(desc => `• ${desc}`).join('\n');
        // Varmistetaan Discord-kentän pituusrajoitus (1024 merkkiä)
        const safeText = text.length > 1000 ? text.substring(0, 990) + '... (ja lisää)' : text;
        fields.push({
          name: `${categoryNames[cat]} (${items.length} kpl)`,
          value: safeText
        });
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle(`🌙 Tänään tapahtui seuraavia hyvinvointitekoja! — ${dateStr}`)
      .setDescription(`Yhteisömme teki tänään yhteensä **${daily.totalToday}** upeaa hyvinvointitekoa!\n` +
        `Yhteisöpotissa on nyt yhteensä **${pool.total_points}** lusikkaa 🥄\n\n` +
        `Alla päivän teot koottuna:`)
      .addFields(fields)
      .setImage('attachment://hyvinvointimies.png')
      .setFooter({ text: 'Kiitos kaikille osallistujille! Huomenna taas uusi päivä ja uudet 5 lusikkaa.' });

    await channel.send({ embeds: [embed], files: [attachment] });
    console.log(`✅ Päivittäinen yhteenveto lähetetty kanavalle ${channelId}`);
  } catch (error) {
    console.error('❌ Virhe päivittäisen yhteenvedon lähettämisessä:', error);
  }
}

/**
 * Lähettää viikottaisen yhteenvedon ilmoituskanavalle
 */
async function sendWeeklySummary(client) {
  const channelId = process.env.WEEKLY_CHANNEL_ID;
  if (!channelId) {
    console.warn('⚠️ WEEKLY_CHANNEL_ID ei ole asetettu!');
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error(`❌ Viikkokanavaa ei löytynyt ID:llä ${channelId}`);
      return;
    }

    const weekly = await getWeeklyStats();
    const pool = await getCommunityPool();

    const categoryLines = [
      `🏃 Liikunta: **${weekly.counts.liikunta}** tekoa`,
      `🥗 Ravitsemus: **${weekly.counts.ravitsemus}** tekoa`,
      `🎨 Luovuus: **${weekly.counts.luovuus}** tekoa`,
      `👥 Sosiaaliset kontaktit: **${weekly.counts.sosiaaliset}** tekoa`,
      `😴 Lepo & palautuminen: **${weekly.counts.lepo}** tekoa`
    ].join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x6c5ce7)
      .setTitle('📊 VIIKON HYVINVOINTIKOOSTE')
      .setDescription(`On aika vetää viikko pakettiin ja katsoa yhteistä edistystämme! 💖\n\n` +
        `• **Viikon aikana kerätyt lusikat:** ${weekly.totalWeekly} kpl 🥄\n` +
        `• **Yhteisön potti yhteensä:** ${pool.total_points} lusikkaa 🪙\n` +
        (pool.total_donations > 0 ? `• **Hyväntekeväisyyslahjoituksia tehty:** ${pool.total_donations} kpl 🐾\n` : '') +
        `\n**Pisteiden jakautuminen eri osa-alueille:**\n${categoryLines}\n\n` +
        `Katso miltä yhteinen akvaariomme näyttää komennolla \`/akvaario\` tai selaa kaupan valikoimaa komennolla \`/kauppa\`!`)
      .setFooter({ text: 'Kiitos tästä viikosta! Uusi viikko alkaa taas huomenna.' });

    await channel.send({ embeds: [embed] });
    console.log(`✅ Viikottainen yhteenveto lähetetty kanavalle ${channelId}`);
  } catch (error) {
    console.error('❌ Virhe viikottaisen yhteenvedon lähettämisessä:', error);
  }
}

/**
 * Käynnistää ajastetut tehtävät
 */
function initSchedulers(client) {
  // 1. Päivittäinen kooste klo 21:00 Helsinki-aikaa
  cron.schedule('0 21 * * *', () => {
    console.log('⏰ Käynnistetään päivittäinen kooste (klo 21:00)...');
    sendDailySummary(client);
  }, {
    timezone: 'Europe/Helsinki'
  });

  // 2. Viikottainen kooste sunnuntaisin klo 18:00 Helsinki-aikaa
  cron.schedule('0 18 * * 0', () => {
    console.log('⏰ Käynnistetään viikottainen kooste (su klo 18:00)...');
    sendWeeklySummary(client);
  }, {
    timezone: 'Europe/Helsinki'
  });

  console.log('✅ Ajastimet rekisteröity: Päivittäinen klo 21:00, Viikottainen su klo 18:00 (Europe/Helsinki).');
}

module.exports = {
  initSchedulers,
  sendDailySummary,
  sendWeeklySummary
};

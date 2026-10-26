require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { initDb } = require('./database/db');
const { initSchedulers } = require('./schedulers/tasks');

// Tarkistetaan pakolliset ympäristömuuttujat
const requiredEnv = ['DISCORD_TOKEN', 'DATABASE_URL'];
const missingEnv = requiredEnv.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`❌ Puuttuvat pakolliset ympäristömuuttujat: ${missingEnv.join(', ')}`);
  console.error('Tarkista .env-tiedosto tai Railwayn ympäristöasetukset!');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Ladataan komennot Collectioniin
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`⚠️ Komennosta ${file} puuttuu "data" tai "execute".`);
  }
}

// Botti käynnistyy
client.once('ready', async () => {
  console.log(`🤖 Botti kirjautui sisään käyttäjänä: ${client.user.tag}`);

  // Alustetaan tietokanta
  try {
    await initDb();
  } catch (err) {
    console.error('❌ Tietokannan alustus epäonnistui:', err);
  }

  // Käynnistetään ajastetut toiminnot (päivittäinen & viikottainen kooste)
  try {
    initSchedulers(client);
  } catch (err) {
    console.error('❌ Ajastimien käynnistys epäonnistui:', err);
  }

  // Asetetaan botin tila
  client.user.setPresence({
    activities: [{ name: 'hyvinvointitekoja ja akvaariota 🐠🥄', type: ActivityType.Watching }],
    status: 'online'
  });

  console.log('🌟 Hyvinvointibotti on valmis ja kuuntelee komentoja!');
});

// Vuorovaikutusten (Slash-komentojen) käsittely
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`Komentoa ${interaction.commandName} ei löytynyt.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Virhe suoritettaessa komentoa ${interaction.commandName}:`, error);
    const errorMessage = {
      content: '❌ Komennon suorituksessa tapahtui odottamaton virhe!',
      ephemeral: true
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage).catch(() => {});
    } else {
      await interaction.reply(errorMessage).catch(() => {});
    }
  }
});

// Suljetaan siististi sammutussignaaleilla
process.on('SIGINT', () => {
  console.log('Sammutetaan botti (SIGINT)...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Sammutetaan botti (SIGTERM)...');
  client.destroy();
  process.exit(0);
});

// Kirjaudutaan Discordiin
if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('❌ Discord-kirjautuminen epäonnistui:', err);
  });
}

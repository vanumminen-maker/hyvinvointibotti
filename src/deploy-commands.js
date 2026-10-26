require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ Komentotiedostosta ${filePath} puuttuu "data" tai "execute" -ominaisuus.`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Aloitetaan ${commands.length} slash-komennon rekisteröinti...`);

    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (!clientId) {
      throw new Error('CLIENT_ID puuttuu .env-tiedostosta!');
    }

    let data;
    if (guildId) {
      // Palvelinkohtainen rekisteröinti (päivittyy välittömästi)
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ Onnistui! Rekisteröity ${data.length} komentoa palvelimelle (Guild: ${guildId}).`);
    } else {
      // Globaali rekisteröinti (voi kestää jopa tunnin päivittyä kaikille palvelimille)
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Onnistui! Rekisteröity ${data.length} globaalia komentoa.`);
    }
  } catch (error) {
    console.error('❌ Virhe komentojen rekisteröinnissä:', error);
  }
})();

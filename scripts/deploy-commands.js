const {REST, Routes} = require('discord.js');
const fs = require('fs');
const path = require('path');
const {bot_token, bot_id} = require('../config.json');
const {log_s, log_i, log_w, log_e, important_c, error_c, reset_c} = require('../color_code.json');

// Initialisation de REST avec le token
const rest = new REST({version: '10'}).setToken(bot_token);

// Vérification de la connexion au bot
(async () => {
  try {
    await rest.get(Routes.applicationCommands(bot_id)); // Test pour vérifier la connexion
    console.log(log_s + 'Connexion au bot réussie.');
  } catch (error) {
    console.error(log_e + 'Impossible de se connecter au bot : "', error_c + error + reset_c + '"');
  }
})();

// Préparation des commandes
const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(commandsPath);

// Chargement des commandes
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const commandNames = commands.map(command => command.name); // Extraire les noms des commandes
console.log(log_i + 'Commandes prêtes pour enregistrement :', important_c + commandNames.join(', ') + reset_c);

// Enregistrement avec Discord
(async () => {
  try {
    await rest.put(Routes.applicationCommands(bot_id), {body: commands});
    console.log(log_s + 'Commandes enregistrées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error(log_e + 'Erreur lors de l\'enregistrement des commandes : "', error_c + error + reset_c + '"');
    process.exit(1);
  }
})();

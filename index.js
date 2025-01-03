const {Client, Collection, GatewayIntentBits, Events} = require('discord.js');
const fs = require('fs');
const path = require('path');

const {bot_token} = require('./config.json');
const {log_s, log_i, log_w, log_e, important_c, reset_c, error_c} = require('./color_code.json');

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

// Gestions des commandes
client.commands = new Collection(); // Collection pour stocker les commandes

// Chargement des commandes
console.log(log_i + 'Chargement des commandes...');

const commandsPath = path.join(__dirname, 'commands');
const commandFolder = fs.readdirSync(commandsPath);

for (const folder of commandFolder) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(log_s + `Commande chargée : ${important_c}${command.data.name}` + reset_c);
    } else {
      console.warn(log_e + `La commande ${important_c}${file}${reset_c} n'est pas correctement formatée.`);
    }
  }
}

// Chargement des événements
console.log(log_i + 'Chargement des événements...');

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(log_s + `Événement chargé : ${important_c}${event.name}${reset_c}`);
}

// Connexion du bot
console.log(log_i + 'Les commandes et événements ont été chargés. Connexion du bot...');

client.once(Events.ClientReady, () => {
  console.log(log_s + `Bot connecté en tant que ${important_c}${client.user.tag}` + reset_c);
});

client.login(bot_token);

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.json');

// Créer un nouveau client Discord
// Crée une nouvelle instance de client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Remplir config.json avec les informations nécessaires si celui n'a que {}
if (fs.readFileSync('./config.json').toString() === '{}') {
	console.warn('[WARN] Fichier de configuration vide ou inexistant. Remplissage du fichier avec les informations de base (token, token_api, ServIPPrimaire, ServIPSecondaire, ServPortPrimaire, ServPortSecondaire, ServRconPortPrimaire, ServRconPortSecondaire, RconPassword, rconPrimaireActif, rcconSecondaireActif et maxServeurParUtilisateur).');
	fs.writeFileSync('./config.json', JSON.stringify({
		"token": "YOUR_DISCORD_BOT_TOKEN",
		"token_api": "YOUR_API_TOKEN",
		"ServIPPrimaire": "YOUR_PRIMARY_SERVER_IP",
		"ServIPSecondaire": "YOUR_SECONDARY_SERVER_IP",
		"ServPortPrimaire": "YOUR_PRIMARY_SERVER_PORT",
		"ServPortSecondaire": "YOUR_SECONDARY_SERVER_PORT",
		"ServRconPortPrimaire": "YOUR_PRIMARY_SERVER_RCON_PORT",
		"ServRconPortSecondaire": "YOUR_SECONDARY_SERVER_RCON_PORT",
		"RconPassword": "YOUR_RCON_PASSWORD",
		"rconPrimaireActif": true,
		"rconSecondaireActif": true,
		"maxServeurParUtilisateur": 1
	}, null, 4));
}

// Récupérer les commandes
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Ajouter les commandes à la collection
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			console.log('[INFO] Commande', '\x1b[33m', `${file}`, '\x1b[0m', 'chargée avec succès.');
		} else {
			console.warn('[WARN] La commande', '\x1b[33m', `${file}`, '\x1b[0m', 'ne contient pas de données ou de fonction d\'exécution.');
		}
	}
}

// Récupérer les événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Charger les événements
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	console.log('[INFO] Événement', '\x1b[33m', `${file}`, '\x1b[0m', 'chargé avec succès.');
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Connexion du client
client.login(token);
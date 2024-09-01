const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const commands = [];

const foldersPath = path.join(__dirname, './commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			console.log('[INFO] Commande', '\x1b[33m', `${command.data.name}`, '\x1b[0m', 'chargée avec succès.');
		} else {
			console.warn('[WARN] La commande', '\x1b[33m', `${file}`, '\x1b[0m', 'ne contient pas de données ou de fonction d\'exécution.');
		}
	}
}


const rest = new REST().setToken(token);

// Déployer les commandes globales
(async () => {
	try {
		console.log(`[INFO] Rafraîchissement de ${commands.length} commandes (/) globales...`);

		// La méthode REST#put() prend deux arguments : une route et un objet de configuration.
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`[INFO] ${commands.length} Commandes (/) globales déployées avec succès.`);
	} catch (error) {
		console.error(`[ERROR] Erreur lors du déploiement des commandes globales : ${error}`);	
	}
})();
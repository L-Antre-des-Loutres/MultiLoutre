const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RconPassword, ServIPPrimaire, ServIPSecondaire, ServRconPortPrimaire, ServRconPortSecondaire } = require('../../config.json');
const { Rcon } = require('rcon-client');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rcon-chat')
        .setDescription('Permet d\'administrer les serveurs Minecraft via RCON et de désactivé celui-ci pour les utilisateurs.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activé ou désactiver le RCON sur "discu-mc" ou envoyer une commande.')
                .setRequired(true)
                .addChoices(
                    { name: 'Envoyer une commande', value: 'commande' },
                    { name: 'Donne l\'état du RCON', value: 'etat' },
                    { name: 'Activer RCON', value: 'activer' },
                    { name: 'Désactiver RCON', value: 'desactiver' }
                )
            )
        .addStringOption(option =>
            option.setName('serveur')
                .setDescription('Le serveur principale (La Vanilla) ou un serveur secondaire.')
                .setRequired(true)
                .addChoices(
                    { name: 'Primaire', value: 'primaire' },
                    { name: 'Secondaire', value: 'secondaire' }
                )
            )
        .addStringOption(option =>
            option.setName('commande')
                .setDescription('La commande à envoyer au serveur.')
                .setRequired(false)
            ),
    async execute(interaction) {
        const configFilePath = __dirname + '/../../config.json';
        const action = interaction.options.getString('action');
        const serveur = interaction.options.getString('serveur');
        const commande = interaction.options.getString('commande');
        
        function getRconStatus() {
            let rconPrimaireActif, rconSecondaireActif;
            fs.readFile(configFilePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error(`[ERROR] Erreur lors de la lecture du fichier de configuration : ${err.message}`);
                    return interaction.reply(`Erreur lors de la lecture du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                }
                rconPrimaireActif = JSON.parse(data).rconPrimaireActif;
                console.warn(`[WARN] rconPrimaireActif défini sur : ${rconPrimaireActif} grâce à la lecture du fichier de configuration.`);
                rconSecondaireActif = JSON.parse(data).rconSecondaireActif;
                console.warn(`[WARN] rconSecondaireActif défini sur : ${rconSecondaireActif} grâce à la lecture du fichier de configuration.`);
            });
            return rconPrimaireActif, rconSecondaireActif
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (action === 'commande') {
            if (!commande) {
                return interaction.reply('Vous devez spécifier une commande à envoyer au serveur. 🥸', { ephemeral: true });
            }
            if (serveur === 'primaire') {
                const rcon = new Rcon({ host: ServIPPrimaire, port: ServRconPortPrimaire, password: RconPassword });
                try {
                    await rcon.connect();
                    const response = await rcon.send(commande);
                    console.WARN(`[WARN] Commande ${commande} envoyée au serveur primaire avec la réponse : "${response}"`);
                } catch (error) {
                    console.error(`[ERROR] Erreur lors de l'envoi de la commande "${commande}" : ${error.message}`);
                    return interaction.reply(`Erreur lors de l'envoi de la commande : \`${error.message}\``, { ephemeral: true });
                }
                return interaction.reply(`Commande envoyée au serveur primaire : \`${commande}\``);
            } else if (serveur === 'secondaire') {
                const rcon = new Rcon({ host: ServIPSecondaire, port: ServRconPortSecondaire, password: RconPassword });
                try {
                    await rcon.connect();
                    await rcon.send(commande);
                } catch (error) {
                    console.error(`[ERROR] Erreur lors de l'envoi de la commande "${commande}" : ${error.message}`);
                    return interaction.reply(`Erreur lors de l'envoi de la commande : \`${error.message}\``, { ephemeral: true });
                }
                return interaction.reply(`Commande envoyée au serveur secondaire : \`${commande}\``);
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        } else if (action === 'etat') {
            console.info(getRconStatus());
            let rconPrimaireActif, rconSecondaireActif = getRconStatus();
            console.warn(`[WARN] MAINTENANT rconPrimaireActif : ${rconPrimaireActif}, rconSecondaireActif : ${rconSecondaireActif}`);

            let rconResponse;
            if (!serveur) {
                return interaction.reply('Vous devez spécifier un serveur pour obtenir l\'état du RCON 🥸', { ephemeral: true });
            } else {
                if (serveur === 'primaire') {
                    console.warn(`[WARN] état du RCON du serveur primaire : ${rconPrimaireActif}`);
                    if (rconPrimaireActif) { rconResponse = 'Activé'; } else { rconResponse = 'Désactivé'; }
                } else if (serveur === 'secondaire') {
                    console.warn(`[WARN] état du RCON du serveur secondaire : ${rconSecondaireActif}`);
                    if (rconSecondaireActif) { rconResponse = 'Activé'; } else { rconResponse = 'Désactivé';}
                } else {
                    return interaction.reply('Attend... Tu veux l\'état du RCON de quel serveur la ? 🥸', { ephemeral: true });
                }
            }
            const embed = new EmbedBuilder()
                .setTitle(`Voici l'état du RCON Chat du serveur ${serveur}`)
                .setDescription(`Le RCON du serveur **${serveur}** est réglé sur : **${rconResponse}**`)
                .setColor("#9adeba")
                .setFooter({
                    text: "Mineotter",
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
            return interaction.reply({ embeds: [embed] });

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        } else if (action === 'desactiver') {
            if (!serveur) {
                return interaction.reply('Vous devez spécifier un serveur sur lequel désactiver le RCON 🥸', { ephemeral: true });
            } else if (serveur === 'primaire') {
                if (rconPrimaireActif === false) {
                    return interaction.reply('RCON déjà désactivé sur le serveur primaire 🥸', { ephemeral: true });
                } else {
                    // Mis à jour du fichier config.json : rconPrimaireActif = false;
                    fs.readFile(configFilePath, 'utf-8', (err, data) => {
                        if (err) {
                            console.error(`[ERROR] Erreur lors de la lecture du fichier de configuration : ${err.message}`);
                            return interaction.reply(`Erreur lors de la lecture du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                        }
                        let updatedData = data.replace(/"rconPrimaireActif": true/g, '"rconPrimaireActif": false');
                        fs.writeFile(configFilePath, updatedData, (err) => {
                            if (err) {
                                console.error(`[ERROR] Erreur lors de la mise à jour du fichier de configuration : ${err.message}`);
                                return interaction.reply(`Erreur lors de la mise à jour du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                            }
                        });
                    });
                    return interaction.reply('RCON désactivé sur le serveur primaire.');
                }
            } else if (serveur === 'secondaire') {
                if (rconSecondaireActif === false) {
                    return interaction.reply('RCON déjà désactivé sur le serveur secondaire 🥸', { ephemeral: true });
                } else {
                    // Mis à jour du fichier config.js : rconSecondaireActif = false;
                    fs.readFile(configFilePath, 'utf-8', (err, data) => {
                        if (err) {
                            console.error(`[ERROR] Erreur lors de la lecture du fichier de configuration : ${err.message}`);
                            return interaction.reply(`Erreur lors de la lecture du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                        }
                        let updatedData = data.replace(/"rconSecondaireActif": true/g, '"rconSecondaireActif": false');
                        fs.writeFile(configFilePath, updatedData, (err) => {
                            if (err) {
                                console.error(`[ERROR] Erreur lors de la mise à jour du fichier de configuration : ${err.message}`);
                                return interaction.reply(`Erreur lors de la mise à jour du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                            }
                        });
                    });
                    return interaction.reply('RCON désactivé sur le serveur secondaire.');
                }
            } else {
                return interaction.reply('Attend... Tu veux désactiver le RCON de quel serveur la ? 🥸', { ephemeral: true });
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        } else if (action === 'activer') {
            if (!serveur) {
                return interaction.reply('Vous devez spécifier un serveur sur lequel activer le RCON 🥸', { ephemeral: true });
            } else if (serveur === 'primaire') {
                if (rconPrimaireActif === true) {
                    return interaction.reply('RCON déjà activé sur le serveur primaire 🥸', { ephemeral: true });
                } else {
                    // Mis à jour du fichier config.js : rconPrimaireActif = true;
                    fs.readFile(configFilePath, 'utf-8', (err, data) => {
                        if (err) {
                            console.error(`[ERROR] Erreur lors de la lecture du fichier de configuration : ${err.message}`);
                            return interaction.reply(`Erreur lors de la lecture du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                        }
                        let updatedData = data.replace(/"rconPrimaireActif": false/g, '"rconPrimaireActif": true');
                        fs.writeFile(configFilePath, updatedData, (err) => {
                            if (err) {
                                console.error(`[ERROR] Erreur lors de la mise à jour du fichier de configuration : ${err.message}`);
                                return interaction.reply(`Erreur lors de la mise à jour du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                            }
                        });
                    });
                    return interaction.reply('RCON activé sur le serveur primaire.');
                }
            } else if (serveur === 'secondaire') {
                if (rconSecondaireActif === true) {
                    return interaction.reply('RCON déjà activé sur le serveur secondaire 🥸', { ephemeral: true });
                } else {
                    // Mis à jour du fichier config.js : rconSecondaireActif = true;
                    fs.readFile(configFilePath, 'utf-8', (err, data) => {
                        if (err) {
                            console.error(`[ERROR] Erreur lors de la lecture du fichier de configuration : ${err.message}`);
                            return interaction.reply(`Erreur lors de la lecture du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                        }
                        let updatedData = data.replace(/"rconSecondaireActif": false/g, '"rconSecondaireActif": true');
                        fs.writeFile(configFilePath, updatedData, (err) => {
                            if (err) {
                                console.error(`[ERROR] Erreur lors de la mise à jour du fichier de configuration : ${err.message}`);
                                return interaction.reply(`Erreur lors de la mise à jour du fichier de configuration : \`${err.message}\` 🥸`, { ephemeral: true });
                            }
                        });
                    });
                    return interaction.reply('RCON activé sur le serveur secondaire.');
                }
            } else {
                return interaction.reply('Attend... Tu veux activer le RCON de quel serveur la ? 🥸', { ephemeral: true });
            }
        }
    },
};

const { Events, EmbedBuilder } = require('discord.js');
const { Tail } = require('tail');
const fs = require('fs');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        let logFile = '/home/serveurs/minecraft/vanilla/logs/latest.log';
        
        // A changer l'utilisation des id par des noms de salons
        const channelId = '1159113861593579612'; // ID du salon dans lequel envoyer juste les messages du chat (🌌・discu-mc)
        const channelIDLogs = '1258841065746731019'; // ID du salon dans lequel envoyer TOUT les logs (🍔mcmyadmin-primaire)

        // Vérifiez si le fichier existe
        if (!fs.existsSync(logFile)) {
            console.error(`[ERROR] Le fichier de log n'existe pas : ${logFile}`);
            return;
        }

        console.log(`[INFO] Démarrage de la surveillance des logs de la Vanilla : ${logFile}`);
        
        const tail = new Tail(logFile);

        tail.on('line', async (line) => {
            if (line.trim() === '') return; // Ignorer les lignes vides

            const channel = client.channels.cache.get(channelId);
            const channelLogs = client.channels.cache.get(channelIDLogs);

            function getPlayerMessage(message) {
                // Regex pour capturer le texte du message
                const regex = /^<[^>]+> (.+)$/;
                const match = message.match(regex);
                
                if (match) {
                  return match[1];
                } else {
                  // Retourne null ou une valeur par défaut si le message ne correspond pas
                  return null;
                }
            }

            function isPlayerMessage(message) {
                // Regex pour vérifier le format "<NomDuJoueur> texte"
                const regex = /^<[^>]+> .+$/;
                return regex.test(message);
            }

            function isPlayerJoining(message) {
                // Regex pour vérifier le format "NomDuJoueur joined the game"
                const regex = /^.+ joined the game$/;
                if (regex.test(message)) {
                    // Renvoi le nom du joueur
                    const regex = /^([^ ]+) joined the game$/;
                    const match = message.match(regex);
                    return match[1];
                } else {
                    return null;
                }
            }

            function isPlayerLeaving(message) {
                // Regex pour vérifier le format "NomDuJoueur left the game"
                const regex = /^.+ left the game$/;
                if (regex.test(message)) {
                    // Renvoi le nom du joueur
                    const regex = /^([^ ]+) left the game$/;
                    const match = message.match(regex);
                    return match[1];
                } else {
                    return null;
                }
            }

            function isServerStarting(message) {
                // Regex pour vérifier le format "Done (.*?)(!)"
                const regex = /^Done \(.*?\)!.*$/;
                return regex.test(message);
            }

            function isServerStopping(message) {
                // Regex pour vérifier le format "Stopping server"
                const regex = /^Stopping server$/;
                return regex.test(message);
            }
                

            function getPlayerName(message) {
                // Regex pour capturer le nom du joueur et le texte
                const regex = /^<([^>]+)> .+$/;
                const match = message.match(regex);
                
                if (match) {
                  return match[1];
                } else {
                  // Retourne null ou une valeur par défaut si le message ne correspond pas
                  return null;
                }
            }

            if (channelLogs) {
                try {
                    await channelLogs.send(line);
                } catch (error) {
                    console.error(`[ERROR] Erreur lors de l'envoi du message au salon "mcmyadmin-primaire" : ${error.message}`);
                }

                if (channel) {
                    try {
                        cut_line = line.replace(/\[\d{2}:\d{2}:\d{2}\] \[.*?\]: /, '');
                        if (isPlayerMessage(cut_line)) {
                            // Embed pour les messages des joueurs
                            const embed = new EmbedBuilder()
                            .setTitle(getPlayerName(cut_line))
                            .setURL("https://fr.namemc.com/profile/" + getPlayerName(cut_line))
                            .setDescription(getPlayerMessage(cut_line))
                            .setThumbnail("https://mc-heads.net/avatar/" + getPlayerName(cut_line) + "/50")
                            .setColor("#00b0f4")
                            .setFooter({
                                text: "Message venant du serveur minecraft Vanilla !",
                                iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                            })
                            .setTimestamp();

                            await channel.send({ embeds: [embed] });
                        } else if (isPlayerJoining(cut_line) !== null) {
                            // Embed pour les messages de connexion des joueurs
                            const embed = new EmbedBuilder()
                                .setTitle("Connexion d'un joueur : " + isPlayerJoining(cut_line))
                                .setColor("#00b0f4")
                                .setFooter({
                                    text: "Message venant du serveur minecraft Vanilla !",
                                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                                })
                                .setTimestamp();
                    
                            await channel.send({ embeds: [embed] });
                        } else if (isPlayerLeaving(cut_line) !== null) {
                            // Embed pour les messages de déconnexion des joueurs
                            const embed = new EmbedBuilder()
                                .setTitle("Déconnexion d'un joueur : " + isPlayerLeaving(cut_line))
                                .setColor("#00b0f4")
                                .setFooter({
                                    text: "Message venant du serveur minecraft Vanilla !",
                                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                                })
                                .setTimestamp();
                    
                            await channel.send({ embeds: [embed] });
                        } else if (isServerStarting(cut_line)) {
                            // Embed pour les messages de démarrage du serveur
                            const embed = new EmbedBuilder()
                                .setTitle("Démarrage du serveur")
                                .setDescription("Le serveur est prêt à accueillir des joueurs 🎉")
                                .setColor("#00b0f4")
                                .setFooter({
                                    text: "Message venant du serveur minecraft Vanilla !",
                                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                                })
                                .setTimestamp();
                    
                            await channel.send({ embeds: [embed] });
                        } else if (isServerStopping(cut_line)) {
                            // Embed pour les messages d'arrêt du serveur
                            const embed = new EmbedBuilder()
                                .setTitle("Arrêt du serveur")
                                .setDescription("Le serveur est en train de s'arrêter... Probablement pour pas longtemps !")
                                .setColor("#00b0f4")
                                .setFooter({
                                    text: "Message venant du serveur minecraft Vanilla !",
                                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                                })
                                .setTimestamp();
                    
                            await channel.send({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.error(`[ERROR] Erreur lors de l'envoi du message au salon "discu-mc" : ${error.message}`);
                    }
                } else {
                    console.error('[ERROR] Salon "discu-mc" non trouvé');
                }
            } else {
                console.error('[ERROR] Salon "mcmyadmin-primaire" non trouvé');
            }
        });

        tail.on('error', (err) => {
            console.error(`[ERROR] Erreur de lecture du fichier de log : ${err.message}`);
        });

        // Assurez-vous de fermer le tail proprement lorsque le bot se déconnecte ou redémarre
        client.on(Events.ClientDestroy, () => {
            console.log('[INFO] Fermeture du suivi du fichier de log');
            tail.unwatch();
        });
    }
};

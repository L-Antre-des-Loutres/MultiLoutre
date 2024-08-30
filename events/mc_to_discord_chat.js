const { Events, EmbedBuilder } = require('discord.js');
const { Tail } = require('tail');
const fs = require('fs');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Function pour les regex des messages des logs ----------------------------------------------
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

        // Function d'envoi des messages dans les salons discord ----------------------------------------------
        function sendPlayerMessage(playername, message, serveur) {
            // Embed pour les messages des joueurs
            if (serveur === "primaire") {
                const embed = new EmbedBuilder()
                .setTitle(playername)
                .setURL("https://fr.namemc.com/profile/" + playername)
                .setDescription(message)
                .setThumbnail("https://mc-heads.net/avatar/" + playername + "/50")
                .setColor(servPrimaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servPrimaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                .setTitle(playername)
                .setURL("https://fr.namemc.com/profile/" + playername)
                .setDescription(message)
                .setThumbnail("https://mc-heads.net/avatar/" + playername + "/50")
                .setColor(servSecondaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servSecondaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
        }
        
        function sendPlayerAdvancement() {}

        function sendPlayerDeath() {}

        function sendPlayerJoining(playername, serveur) {
            // Embed pour les messages de connexion des joueurs
            if (serveur === "primaire") {
                const embed = new EmbedBuilder()
                .setTitle("Connexion de " + playername + ' sur le serveur "' + servPrimaireConfigs.nom_serv + '"')
                .setColor(servPrimaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servPrimaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                .setTitle("Connexion de " + playername + ' sur le serveur "' + servSecondaireConfigs.nom_serv + '"')
                .setColor(servSecondaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servSecondaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
        }

        function sendPlayerLeaving(playername, serveur) {
            // Embed pour les messages de déconnexion des joueurs
            if (serveur === "primaire") {
                const embed = new EmbedBuilder()
                .setTitle("Déconnexion de " + playername + ' du serveur "' + servPrimaireConfigs.nom_serv + '"')
                .setColor(servPrimaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servPrimaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                .setTitle("Déconnexion de " + playername + ' du serveur "' + servSecondaireConfigs.nom_serv + '"')
                .setColor(servSecondaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servSecondaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
        }

        function sendServerStarting(server) {
            // Embed pour les messages de démarrage du serveur
            if (server === "primaire") {
                const embed = new EmbedBuilder()
                .setTitle('Le serveur "' + servPrimaireConfigs.nom_serv + '" est démarré !')
                .setDescription("Le serveur est prêt à accueillir des joueurs 🎉")
                .setColor(servPrimaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servPrimaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
            else {
                const embed = new EmbedBuilder()
                .setTitle('Le serveur "' + servSecondaireConfigs.nom_serv + '" est démarré !')
                .setDescription("Le serveur est prêt à accueillir des joueurs 🎉")
                .setColor(servSecondaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servSecondaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
        }

        function sendServerStopping(server) {
            // Embed pour les messages d'arrêt du serveur
            if (server === "primaire") {
                const embed = new EmbedBuilder()
                .setTitle('Arrêt du serveur "' + servPrimaireConfigs.nom_serv + '"')
                .setDescription("Le serveur est en train de s'arrêter... Probablement pour pas longtemps !")
                .setColor(servPrimaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servPrimaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
            else {
                const embed = new EmbedBuilder()
                .setTitle('Arrêt du serveur "' + servSecondaireConfigs.nom_serv + '"')
                .setDescription("Le serveur est en train de s'arrêter... Probablement pour pas longtemps !")
                .setColor(servSecondaireConfigs.embedColor)
                .setFooter({
                    text: 'Message venant du serveur minecraft "' + servSecondaireConfigs.nom_serv + '" !',
                    iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
                })
                .setTimestamp();
                channel.send({ embeds: [embed] });
            }
        }

        function sendServerCrash() {}

        // Réquete vers l'API de l'Antre des Loutres pour récupérer les informations des serveurs primaires et secondaires
        let apiData = await fetch('https://api.antredesloutres.fr/serveurs/primaire/actif');
        const servPrimaireConfigs = await apiData.json();

        apiData = await fetch('https://api.antredesloutres.fr/serveurs/secondaire/actif');
        const servSecondaireConfigs = await apiData.json();
        
        let logFilePrimaire = servPrimaireConfigs.path_serv + '/logs/latest.log';
        let logFileSecondaire = servSecondaireConfigs.path_serv + '/logs/latest.log';
        logFileSecondaire = "safeToDelete.log"
        
        // A changer l'utilisation des id par des noms de salons
        const channelId = '1159113861593579612'; // ID du salon dans lequel envoyer juste les messages du chat (🌌・discu-mc)
        const channelIDLogs = '1258841065746731019'; // ID du salon dans lequel envoyer TOUT les logs (🍔mcmyadmin-primaire)
        const channel = client.channels.cache.get(channelId);
        const channelLogs = client.channels.cache.get(channelIDLogs);
        
        // Vérifiez si le fichier de log pour le serveur primaire existe
        if (!fs.existsSync(logFilePrimaire)) {
            console.error(`[ERROR] Le fichier de log n'existe pas : ${logFilePrimaire}`);
            return;
        } else {
            console.log(`[INFO] Démarrage de la surveillance des logs du serveur primaire : ${logFilePrimaire}`);
            
            // Tail du fichier primaire
            const tail = new Tail(logFilePrimaire);
            tail.on('line', async (line) => {
                if (line.trim() === '') return; // Ignorer les lignes vides
    
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
                                sendPlayerMessage(getPlayerName(cut_line), getPlayerMessage(cut_line), "primaire");
    
                            } else if (isPlayerJoining(cut_line) !== null) {
                                sendPlayerJoining(isPlayerJoining(cut_line), "primaire");
    
                            } else if (isPlayerLeaving(cut_line) !== null) {
                                sendPlayerLeaving(isPlayerLeaving(cut_line), "primaire");
    
                            } else if (isServerStarting(cut_line)) {
                                sendServerStarting("primaire");
    
                            } else if (isServerStopping(cut_line)) {
                                sendServerStopping("primaire");
    
                            }
                        } catch (error) {
                            console.error(`[ERROR] Erreur lors de l'envoi du message au salon "discu-mc (serveur : primaire)" : ${error.message}`);
                        }
                    } else {
                        console.error('[ERROR] Salon "discu-mc" non trouvé (serveur : primaire)');
                    }
                } else {
                    console.error('[ERROR] Salon "mcmyadmin-primaire" non trouvé');
                }
            });
        }

        if (!fs.existsSync(logFileSecondaire)) {
            console.error(`[ERROR] Le fichier de log n'existe pas : ${logFileSecondaire}`);
            return;
        } else {
            console.log(`[INFO] Démarrage de la surveillance des logs du serveur secondaire : ${logFileSecondaire}`);
            // Tail du fichier secondaire
            const tailSecondaire = new Tail(logFileSecondaire);
            tailSecondaire.on('line', async (line) => {
                if (line.trim() === '') return; // Ignorer les lignes vides
    
                if (channelLogs) {
                    try {
                        await channelLogs.send(line);
                    } catch (error) {
                        console.error(`[ERROR] Erreur lors de l'envoi du message au salon "mcmyadmin-secondaire" : ${error.message}`);
                    }
    
                    if (channel) {
                        try {
                            cut_line = line.replace(/\[\d{2}:\d{2}:\d{2}\] \[.*?\]: /, '');
                            if (isPlayerMessage(cut_line)) {
                                sendPlayerMessage(getPlayerName(cut_line), getPlayerMessage(cut_line), "secondaire");
    
                            } else if (isPlayerJoining(cut_line) !== null) {
                                sendPlayerJoining(isPlayerJoining(cut_line), "secondaire");
    
                            } else if (isPlayerLeaving(cut_line) !== null) {
                                sendPlayerLeaving(isPlayerLeaving(cut_line), "secondaire");
    
                            } else if (isServerStarting(cut_line)) {
                                sendServerStarting("secondaire");
    
                            } else if (isServerStopping(cut_line)) {
                                sendServerStopping("secondaire");
    
                            }
                        } catch (error) {
                            console.error(`[ERROR] Erreur lors de l'envoi du message au salon "discu-mc (serveur : secondaire)" : ${error.message}`);
                        }
                    } else {
                        console.error('[ERROR] Salon "discu-mc" non trouvé (serveur : secondaire)');
                    }
                } else {
                    console.error('[ERROR] Salon "mcmyadmin-secondaire" non trouvé');
                }
            });
        }

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
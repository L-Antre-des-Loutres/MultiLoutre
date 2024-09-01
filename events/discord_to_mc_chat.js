const { Rcon } = require('rcon-client');
const { Events } = require('discord.js');
let rconSecondaireActif = true;
let rconPrimaire;
let rconSecondaire;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Réquete vers l'API de l'Antre des Loutres pour récupérer les informations des serveurs primaires et secondaires
        let servPrimaireConfigs;
        let servSecondaireConfigs;
        try {
            let apiData = await fetch('https://api.antredesloutres.fr/serveurs/primaire/actif');
            servPrimaireConfigs = await apiData.json();
        } catch (error) {
            console.error('[ERROR] Erreur lors de la récupération des informations du serveur primaire : ', error.message);
            return;
        }

        try {
            let apiData = await fetch('https://api.antredesloutres.fr/serveurs/secondaire/actif');
            servSecondaireConfigs = await apiData.json();
        } catch (error) {
            console.error('[ERROR] Erreur lors de la récupération des informations du serveur secondaire : ', error.message);
            return;
        }

        // Canal de discussion entre Discord et Minecraft
        const channelDiscuMC = "1159113861593579612"

        if (message.author.username === "Mineotter" || message.content === "") {
            return; // Ignorer les messages de Mineotter ou vides
        }

        if (message.channel.id !== channelDiscuMC) {
            return; // Ignorer les messages qui ne proviennent pas du canal spécifié
        }

        // Vérification de la connexion RCON au serveur Primaire
        if (!rconPrimaire || rconPrimaire.ended) {
            // Si la connexion RCON n'existe pas ou a été interrompue, ont essaye de se reconnecter
            const rconPrimaireOptions = {
                host: "194.164.76.165",
                port: 25575,
                password: "j4SPyLD0J6or9dbSLJqfT70X9sPt0MOGV5RmSkGK",
            };

            try {
                rconPrimaire = await Rcon.connect(rconPrimaireOptions);
                console.info('[INFO] Connexion RCON au serveur primaire réussite.');
            } catch (error) {
                console.error('[ERROR] Erreur lors de la connexion au RCON du serveur primaire : ', error.message);
                return;
            }
        }

        // Vérification de la connexion RCON au serveur Secondaire
        if (rconSecondaireActif) {
            if (!rconSecondaire || rconSecondaire.ended) {
                // Si la connexion RCON n'existe pas ou a été interrompue, ont essaye de se reconnecter
                const rconSecondaireOptions = {
                    host: "194.164.76.165",
                    port: 25574,
                    password: "j4SPyLD0J6or9dbSLJqfT70X9sPt0MOGV5RmSkGK",
                };
    
                try {
                    rconSecondaire = await Rcon.connect(rconSecondaireOptions);
                    console.info('[INFO] Connexion RCON au serveur secondaire réussite.');
                } catch (error) {
                    console.error('[ERROR] Erreur lors de la connexion au RCON du serveur secondaire : ', error.message);
                    return;
                }
            }
        } else {
            console.warn('[WARN] Connexion RCON au serveur secondaire désactivée.');
        }

        // Ajout de cette attente pour s'assurer que la connexion RCON est prête
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde

        try {
            // Vérification de la connexion RCON au serveur Primaire
            if (!rconPrimaire || rconPrimaire.ended) {
                console.error('[ERROR] La connexion RCON au serveur primaire est invalide. Impossible d\'envoyer le message.');
                return;
            }
            if (rconSecondaireActif) {
                if (!rconSecondaire || rconSecondaire.ended) {
                    console.error('[ERROR] La connexion RCON au serveur secondaire est invalide. Impossible d\'envoyer le message.');
                    return;
                } 
            }

            await rconPrimaire.send(`tellraw @a ["",{"text":"<${message.author.username}>","color":"#5865F2","hoverEvent":{"action":"show_text","contents":"Message envoyé depuis le discord de l'Antre des Loutres."}},{"text":" ${message.content}"}]`);
            if (rconSecondaireActif) {
                await rconSecondaire.send(`tellraw @a ["",{"text":"<${message.author.username}>","color":"#5865F2","hoverEvent":{"action":"show_text","contents":"Message envoyé depuis le discord de l'Antre des Loutres."}},{"text":" ${message.content}"}]`);
            } else {
                console.warn('[WARN] Connexion RCON au serveur secondaire désactivée. Envoi du message uniquement sur le serveur primaire.');
            }
        } catch (error) {
            console.error('[ERROR] Erreur lors de l\'envoi du message RCON:', error.message);
            // En cas d'erreur, vous pouvez choisir de définir rcon à null pour qu'il soit réinitialisé lors du prochain message
            rconPrimaire = null;
            rconSecondaire = null;
        }
    },
};
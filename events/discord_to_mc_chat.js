const { Rcon } = require('rcon-client');
const { Events } = require('discord.js');

let rcon;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const channelDiscuMC = "1159113861593579612"

        if (message.author.username === "Mineotter" || message.content === "") {
            return; // Ignorer les messages de Mineotter ou vides
        }

        if (message.channel.id !== channelDiscuMC) {
            return; // Ignorer les messages qui ne proviennent pas du canal spécifié
        }

        if (!rcon || rcon.ended) {
            // Si la connexion RCON n'existe pas ou a été interrompue, ont essaye de se reconnecter
            const rconOptions = {
                host: "vanilla.antredesloutres.fr",
                port: 25575,
                password: "j4SPyLD0J6or9dbSLJqfT70X9sPt0MOGV5RmSkGK",
            };

            try {
                rcon = await Rcon.connect(rconOptions);
                // console.log('[INFO] Connexion au RCON établie.');
            } catch (error) {
                console.error('[ERROR] Erreur lors de la connexion au RCON:', error.message);
                return;
            }
        }

        // Ajout de cette attente pour s'assurer que la connexion RCON est prête
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde

        // console.log('[INFO] Reçu de discord, retransmission sur minecraft: "' + message.content + '"');

        try {
            // Vérification de la connexion RCON
            if (!rcon || rcon.ended) {
                console.error('[ERROR] La connexion RCON est invalide. Impossible d\'envoyer le message.');
                return;
            }

            await rcon.send(`tellraw @a ["",{"text":"<${message.author.username}>","color":"#5865F2","hoverEvent":{"action":"show_text","contents":"Message envoyé depuis le discord de l'Antre des Loutres."}},{"text":" ${message.content}"}]`);
        } catch (error) {
            console.error('[ERROR] Erreur lors de l\'envoi du message RCON:', error.message);
            // En cas d'erreur, vous pouvez choisir de définir rcon à null pour qu'il soit réinitialisé lors du prochain message
            rcon = null;
        }
    },
};
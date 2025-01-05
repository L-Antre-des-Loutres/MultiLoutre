const { Events, EmbedBuilder, MessageFlags } = require('discord.js');
const { bot_color } = require(__dirname + '/../config.json');
const dbController = require(__dirname + '/../utils/dbServeurController');
const { log_e, log_i, reset_c } = require(__dirname + '/../color_code.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId.startsWith('select_serveurs')) return;

        // Récupère l'action et l'ID du serveur sélectionné
        const selectedServerId = interaction.values[0];

        const action = interaction.customId.split(':')[1];

        try {
            const serverInfo = await dbController.getServerById(selectedServerId);

            if (!serverInfo) {
                return interaction.reply({
                    content: 'Impossible de trouver les informations du serveur sélectionné.',
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Appelle la fonction appropriée selon l'action
            if (action === 'check') {
                await this.executeCheck(interaction, serverInfo);
            } else if (action === 'lancer') {
                await this.executeLancer(interaction, serverInfo);
            } else if (action === 'infos') {
                await this.executeInfos(interaction, serverInfo);
            } else {
                return interaction.reply({
                    content: 'Action inconnue. Veuillez réessayer. Si le problème persiste, contactez un administrateur.',
                    flags: MessageFlags.Ephemeral 
                });
            }
        } catch (error) {
            console.error(log_e + 'Erreur lors de l\'exécution de l\'interaction : ' + log_i + error + reset_c);
            await interaction.reply({
                content: 'Une erreur s\'est produite lors de l\'exécution de l\'action.',
                flags: MessageFlags.Ephemeral 
            });
        }
    },

    // Fonction pour "check", normalement pas accessible 
    async executeCheck(interaction, serverInfo) {
        await interaction.reply({
            content: `Uuh... Normalement, tu ne peux pas utiliser "check" avec la liste des serveurs. Si tu vois ce message, c'est qu'il y a un problème copain 🦦`,
            flags: MessageFlags.Ephemeral 
        });
    },

    // Fonction pour "lancer"
    async executeLancer(interaction, serverInfo) {
        await interaction.reply("Fonction lancer selectionnée avec le serveur " + serverInfo.nom);
    },

    // Fonction pour "infos"
    async executeInfos(interaction, serverInfo) {
        let isActiveText = serverInfo.actif ? 'Le serveur peut être lancé !' : 'Le serveur est actuellement désactivé.';
        let isGlobalText = serverInfo.global ? '(Serveur global)' : '(Serveur investisseur)';
        let serverEmoji = dbController.getServerEmoji(serverInfo);
        let serverImage = dbController.getServerImage(serverInfo); // Inutilisé pour le moment

        let serveurIp = '';
        if (serverInfo.nom === 'La Vanilla') {
            serveurIp = '`antredesloutres.fr`';
        } else {
            serveurIp = '`secondaire.antredesloutres.fr`';
        }

        let statutText = '';
        if (true) {
            statutText = 'En ligne (0 joueurs connectés)';
        }

        const embed = new EmbedBuilder()
            .setTitle(`Informations de ${serverInfo.nom} ${isGlobalText}`)
            .setDescription(`
                **Version :** ${serverInfo.version}\n**Modpack :** ${serverEmoji} ${serverInfo.modpack}\n**IP :** ${serveurIp}\n\n**Serveur :** ${statutText}\n${isActiveText}`    
            )
            .setFooter({
                text: "Mineotter",
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(bot_color);

        await interaction.reply({ embeds: [embed] });
    },
};

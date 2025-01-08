const { Events, EmbedBuilder, MessageFlags } = require('discord.js');
const { bot_color, api_token } = require(__dirname + '/../config.json');
const dbController = require(__dirname + '/../utils/dbServeurController');
const { log_e, important_c, reset_c } = require(__dirname + '/../color_code.json');
const fetch = require('node-fetch');

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
            console.error(log_e + 'Erreur lors de l\'exécution de l\'interaction : ' + important_c + error + reset_c);
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

    async executeLancer(interaction, serverInfo) {
        let serverStartResponse = await dbController.startServer(serverInfo.id);

        if (!serverStartResponse) {
            return interaction.reply({ content: 'Une erreur s\'est produite lors de l\'exécution de l\'action. Veuillez réessayer ou contactez un administrateur.', flags: MessageFlags.Ephemeral });
        }

        if (data.status == true) {
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username} a lancé le serveur ${serverInfo.nom} !`)
                .setDescription(`Un message devrait t'avertir lorsque le serveur sera accessible.`)
                .setFooter({
                    text: "Mineotter",
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp()
                .setColor(bot_color);

            await interaction.reply({ embeds: [embed] });
        } else {
            await this.apiErrorHandle(interaction, data);                 
        }
    },

    async executeInfos(interaction, serverInfo) {
        let isActiveText = serverInfo.actif ? 'Le serveur peut être lancé !' : 'Le serveur est actuellement désactivé.';
        let isGlobalText = serverInfo.global ? '(Serveur global)' : '(Serveur investisseur)';
        let serverEmoji = dbController.getServerEmoji(serverInfo);

        let serveurIp = '';
        if (serverInfo.nom === 'La Vanilla') {
            serveurIp = '`antredesloutres.fr`';
        } else {
            serveurIp = '`secondaire.antredesloutres.fr`';
        }

        let serverStatus = await dbController.getServeurStatus(serverInfo.id);
        if (!serverStatus) {
            return interaction.reply({
                content: 'Impossible de récupérer les informations du serveur depuis l\'API. Veuillez réessayer plus tard ou contactez un administrateur.',
                flags: MessageFlags.Ephemeral 
            });
        }
        let statusText = serverStatus.online ? `En ligne (${serverStatus.nb_joueurs} joueurs connectés)` : 'Hors ligne';

        const embed = new EmbedBuilder()
            .setTitle(`Informations de ${serverInfo.nom} ${isGlobalText}`)
            .setDescription(`
                **Version :** ${serverInfo.version}\n**Modpack :** ${serverEmoji} [${serverInfo.modpack}](${serverInfo.modpack_url})\n**IP :** ${serveurIp}\n\n**Statut du serveur :** ${statusText}\n${isActiveText}`
            )
            .setFooter({
                text: "Mineotter",
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(serverInfo.embed_color);

        await interaction.reply({ embeds: [embed] });
    },

    async apiErrorHandle(interaction, data) {
        switch (data.code) {
            case '400':
                console.log(log_e + 'Impossible de lancer le serveur. Paramètres manquants ou incorrects. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. Paramètres manquants ou incorrects. Veuillez contacter un administrateur.',
                    flags: MessageFlags.Ephemeral 
                });
                break;
            case '401' || '403':
                console.log(log_e + 'Impossible de lancer le serveur. Problème de permissions. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. Problème de permissions. Veuillez contacter un administrateur.',
                    flags: MessageFlags.Ephemeral 
                });
            case '404':
                console.log(log_e + 'Impossible de lancer le serveur. Serveur introuvable. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. L\'API ne répond pas. Veuillez réessayer plus tard ou contacter un administrateur.',
                    flags: MessageFlags.Ephemeral 
                });
                console.log(log_e + 'Impossible de lancer le serveur. Serveur introuvable. Retour de l\'API : ' + important_c + data.message + reset_c);
            case '409':
                console.log(log_e + 'Impossible de lancer le serveur. Des joueurs sont déjà connectés. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. Des joueurs sont déjà connectés. Veuillez attendre qu\'ils se déconnectent.',
                    flags: MessageFlags.Ephemeral 
                });
            case '422':
                console.log(log_e + 'Impossible de lancer le serveur. Serveur déjà lancé. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. Le serveur est déjà lancé. Veuillez attendre qu\'il soit arrêté.',
                    flags: MessageFlags.Ephemeral 
                });
            case '500' || '503' || '504':
                console.log(log_e + 'Impossible de lancer le serveur. Erreur interne. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. Erreur internes. Veuillez réessayer ou contacter un administrateur.',
                    flags: MessageFlags.Ephemeral 
                });
            default:
                console.log(log_e + 'Impossible de lancer le serveur. Erreur inconnue. Retour de l\'API : ' + important_c + data.message + reset_c);
                await interaction.reply({
                    content: 'Impossible de lancer le serveur. Erreur inconnue. Veuillez réessayer ou contacter un administrateur.',
                    flags: MessageFlags.Ephemeral
                });
        }
    }
};

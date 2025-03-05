const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { bot_color } = require(__dirname + '/../../config.json');
const dbController = require(__dirname + '/../../utils/dbServeurController');
const { log_i, log_s, log_e, error_c, reset_c, important_c } = require(__dirname + '/../../color_code.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Permet d\'interagir avec les serveurs Minecraft.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action que vous souhaitez effectuer avec le serveur.')
                .setRequired(true)
                .addChoices(
                    { name: 'Lancer', value: 'lancer' },
                    { name: 'Check', value: 'check' },
                    { name: 'Informations', value: 'infos' }
                )
        ),
    async execute(interaction) {
        const action = interaction.options.getString('action');

        // Pour l'action "check", pas besoin d'envoyer la liste des serveurs
        if (action === 'check') {
            let servPrimaire, servSecondaire;
            let servPrimaireEmoji, servSecondaireEmoji;
            let servPrimaireIsOnline, servSecondaireIsOnline;
            let servPrimairenbJoueurs, servSecondairenbJoueurs;
            try {
                servPrimaire = await dbController.getServerById(await dbController.getServerPrimaire());
                servSecondaire = await dbController.getServerById(await dbController.getServerSecondaire());

                const servPrimaireStatus = await dbController.getServeurStatus(servPrimaire.id);
                servPrimaireIsOnline = servPrimaireStatus.online;
                servPrimairenbJoueurs = servPrimaireStatus.nb_joueurs;

                const servSecondaireStatus = await dbController.getServeurStatus(servSecondaire.id);
                servSecondaireIsOnline = servSecondaireStatus.online;
                servSecondairenbJoueurs = servSecondaireStatus.nb_joueurs;
            } catch (error) {
                console.log(log_e + 'Erreur lors de la récupération des serveurs principaux : ' + important_c + error + reset_c);
            }

            if (!servPrimaire || !servSecondaire) {
                return interaction.reply({
                    content: 'Les serveurs n\'ont pas été trouvés. Veuillez réessayer plus tard ou contactez un administrateur.',
                    flags: MessageFlags.Ephemeral 
                });
            }

            let primaryOnlineText, secondaryOnlineText;
            if (servPrimaireIsOnline) { primaryOnlineText = `🟢 ${servPrimairenbJoueurs} joueur(s) en ligne`; } else { primaryOnlineText = `🔴 Serveur hors ligne` };
            if (servSecondaireIsOnline) { secondaryOnlineText = `🟢 ${servSecondairenbJoueurs} joueur(s) en ligne`; } else { secondaryOnlineText = `🔴 Serveur hors ligne` };

            function formatEmbedFields (server, onlineText) { // Pour un meilleur rendu sur téléphone, des caractères invisibles ont été ajoutés entre les accolades
                return `${dbController.getServerEmoji(server)} ${server.nom} (${server.version})\n**Modpack :** [${server.modpack}](${server.modpack_url})\n\n${onlineText}\n`;
            }


            const embed = new EmbedBuilder()
                .setTitle('Voici les serveurs actuellement ouverts !')
                .addFields(  // Pour un meilleur rendu sur téléphone, des caractères invisibles
                    { name: 'Serveur principal', value: formatEmbedFields(servPrimaire, primaryOnlineText) + `\`primaire.antredesloutres.fr\`\n‎`, inline: true },
                    { name: 'Serveur secondaire', value: formatEmbedFields(servSecondaire, secondaryOnlineText) + `\`secondaire.antredesloutres.fr\`\n‎`, inline: true }
                )
                .setFooter({
                    text: "Mineotter",
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp()
                .setColor(bot_color)

            return interaction.reply({ embeds: [embed] });
        }

        // Autres actions
        try {
            const servers = await dbController.getAllServers(true, true, 'Minecraft');
            if (!servers || servers.length === 0) {
                return interaction.reply({
                    content: 'Aucun serveur Minecraft actif trouvé.',
                    flags: MessageFlags.Ephemeral 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('Choisissez un serveur')
                .setDescription('Veuillez sélectionner un serveur Minecraft dans le menu déroulant ci-dessous.')
                .setColor(bot_color);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`select_serveurs:${action}`)
                .setPlaceholder('Choisissez un serveur Minecraft')
                .addOptions(
                    servers.map(server => ({
                        label: server.nom,
                        description: `Version: ${server.version} / Modpack: ${server.modpack}`,
                        value: server.id.toString(),
                    }))
                );
            const actionRow = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                embeds: [embed],
                components: [actionRow],
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            console.log(log_e + 'Erreur lors de la récupération des serveurs Minecraft : ' + important_c + error + reset_c);
            await interaction.reply({
                content: 'Une erreur s\'est produite lors de l\'exécution de la commande. Veuillez réessayer plus tard.',
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};

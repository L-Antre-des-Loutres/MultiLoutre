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
            return interaction.reply('Fonction check selectionnée');
        }

        try {
            const servers = await dbController.getAllActiveMinecraftServers();
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
            console.error(log_e + 'Erreur lors de la récupération des serveurs Minecraft : ' + log_i + error + reset_c);
            await interaction.reply({
                content: 'Une erreur s\'est produite lors de l\'exécution de la commande. Veuillez réessayer plus tard.',
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};

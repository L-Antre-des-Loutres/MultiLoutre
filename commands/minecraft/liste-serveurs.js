const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { bot_color } = require(__dirname + '/../../config.json');
const dbController = require(__dirname + '/../../utils/dbServeurController');
const { log_i, log_s, log_e, error_c, reset_c, important_c } = require(__dirname + '/../../color_code.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('liste-serveurs')
        .setDescription('Renvoi la liste des serveurs Minecraft.'),
    async execute(interaction, client) {
        // On prépare l'embed
        const embed = new EmbedBuilder()
            .setTitle("Liste de nos serveurs Minecraft")
            .setColor(bot_color)
            .setFooter({
                text: "Mineotter",
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        try {
            const servers = await dbController.getAllActiveMinecraftServers();

            // Prépare la description et les champs de l'embed
            let serverListDescription = '[En savoir plus sur nos serveurs Minecraft](https://perdu.com).\nVoici la liste de nos serveurs Minecraft actuellement disponibles :';
            let fields = [];
            if (servers.length > 0) {
                servers.forEach(server => {
                    let serveur_title = '';
                    if (server.modpack == 'Minecraft Vanilla') {
                        serveur_emoji = `<:mc_primaire:1325274691581120582>`;
                    } else {
                        serveur_emoji = `<:mc_secondaire:1325274670215200789>`;
                    }
                    if (server.global) {
                        serveur_title = `${serveur_emoji} ${server.nom} (global)`;
                    } else {
                        serveur_title = `${serveur_emoji} ${server.nom} (investisseur)`;
                    }

                    fields.push({name: serveur_title, value: `**Jeu:** ${server.jeu} ${server.version}\n**Modpack:** [${server.modpack}](${server.modpack_url})`, inline: false});
                });
            } else {
                serverListDescription = 'Aucun serveur disponible actuellement.';
            }

            embed.setDescription(serverListDescription)
            embed.addFields(fields);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(log_e + 'Erreur lors de la récupération de la liste des serveurs : ', error);
            await interaction.reply({ 
                content: 'Désolé, il y a eu une erreur en récupérant la liste des serveurs.',
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};

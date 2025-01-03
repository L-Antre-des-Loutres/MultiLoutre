const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bot_color } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('git-depo')
        .setDescription('Renvoi le lien du dépôt GitHub de Mineotter.'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
        .setTitle("Dépôt GitHub de Mineotter")
        .setURL("https://github.com/Corentin-cott/mineotter-bot")
        .setDescription("Et voilà pour toi le lien de mon magnifique dépôt GitHub !")
        .setImage("https://github.com/Corentin-cott/mineotter-bot/raw/main/imgs/logo.png")
        .setColor(bot_color)
        .setFooter({
            text: "Mineotter",
            iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
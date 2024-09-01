const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('git-depo')
        .setDescription('Renvoi le lien du dépôt GitHub de Mineotter.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle("Dépôt GitHub de Mineotter")
        .setURL("https://github.com/Corentin-cott/mineotter-bot")
        .setDescription("Et voilà pour toi !")
        .setImage("https://github.com/Corentin-cott/mineotter-bot/raw/main/imgs/logo.png")
        .setColor("#9adeba")
        .setFooter({
            text: "Mineotter",
            iconURL: "https://cdn.discordapp.com/app-icons/1247285437425516647/d9859c21466ea0cc1a164d03926ea7bb.png?size=32",
        })
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

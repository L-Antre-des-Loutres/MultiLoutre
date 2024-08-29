const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Afin de vérifier si le bot répond aux commandes.'),
    async execute(interaction) {
        await interaction.reply('Pong 🏓 Je suis bien présent !');
    },
};

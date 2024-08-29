const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-serveur')
        .setDescription(`Permet d'avoir des informations sur les serveurs actifs.`),
    async execute(interaction) {
        await interaction.reply(`nn la flemme de faire ça pour le moment.`);
    },
};

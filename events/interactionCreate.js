const { MessageFlags } = require('discord.js');
const {log_s, log_i, log_w, log_e, important_c, error_c, reset_c} = require('../color_code.json');

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`Commande non trouvée : ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(log_e + 'Erreur lors de l\'exécution de la commande : "', error_c + error + reset_c + '"');
      await interaction.reply({
        content: 'Une erreur est survenue lors de l\'exécution de cette commande !',
        flags: MessageFlags.Ephemeral
      });
    }
  },
};

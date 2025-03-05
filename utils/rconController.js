const Rcon = require('rcon');
const dbServeurController = require('./dbServeurController');

// Fonction pour envoyer une commande RCON à un serveur
async function sendRconCommand(serverSession, command) {
  // Récupération des paramètres RCON
  let rconString;

  try {
    if (serverSession === "primary") {
      rconString = await dbServeurController.getPrimaryRconParameters();
    } else if (serverSession === "secondary") {
      rconString = await dbServeurController.getSecondaryRconParameters();
    } else {
      throw new Error('serverSession non défini ou invalide');
    }
    console.log(rconString);

    // Connexion RCON
    const rcon = new Rcon("127.0.0.1", rconString.port, rconString.password);
    
    await new Promise((resolve, reject) => {
      rcon.on('auth', resolve);
      rcon.on('error', reject);
      rcon.connect();
    });

    // Envoi de la commande
    const response = await new Promise((resolve, reject) => {
      rcon.send(command);
      rcon.on('response', (res) => {
        rcon.disconnect();
        resolve(res);
      });
      rcon.on('error', (err) => {
        rcon.disconnect();
        reject(err);
      });
    });

    return response;
  } catch (error) {
    throw new Error(`Erreur RCON: ${error.message}`);
  }
}

module.exports = {
  sendRconCommand,
};

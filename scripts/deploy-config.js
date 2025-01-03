const fs = require('fs');
const { log_i, log_w, log_s, log_e, important_c, error_c, reset_c } = require('../color_code.json');

// Contenu de la configuration de base
const defaultConfig = {
    bot_token: "placeholder",
    bot_id: "placeholder",
    bot_color: "#9adeba",
    db_host: "localhost",
    db_user: "mineotter",
    db_password: "placeholder",
    db_name: "serveurs_informations",
    db_name: "api_serv_parameters"
};

const configPath = __dirname + '/../config.json';

// Vérification si le fichier config.json existe déjà, ça serait dommage de remplacer le fichier déjà completé
if (fs.existsSync(configPath)) {
    console.log(log_w +  `Le fichier "${important_c}config.json${reset_c}" existe déjà. Voulez-vous le remplacer ? (y/n)`);
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (data) => {
        data = data.trim();
        if (data === 'y') {
            createConfig(defaultConfig);
        } else if (data === 'n') {
            console.log(log_i + "Opération annulée.");
            process.exit(0);
        } else {
            console.log(log_i + "Veuillez répondre par 'y' ou 'n'.");
        }
    });
} else {
    createConfig(defaultConfig);
}

function createConfig(defaultConfig) {
  try {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
      console.log(log_s + `Fichier "${important_c}config.json${reset_c}" créé avec succès !`);
      process.exit(0);
  } catch (error) {
      console.error(log_e + `Erreur lors de la création du fichier "${important_c}config.json${reset_c}" : `, error_c + error + reset_c);
      process.exit(1);
  }
}

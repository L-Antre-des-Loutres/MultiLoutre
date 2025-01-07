const mysql = require('mysql2');
const { db_host, db_user, db_password, api_db_name } = require('../config.json');
const { log_i, log_s, log_e, error_c, reset_c } = require('../color_code.json');

/*
Table serveurs {
    id INT [pk, increment]
    nom VARCHAR(255) [not null]
    jeu VARCHAR(255) [not null]
    version VARCHAR(20) [not null]
    modpack VARCHAR(255) [not null]
    modpack_url VARCHAR(255)
    nom_monde VARCHAR(255) [not null]
    embed_color VARCHAR(7) [default: '#000000']
    path_serv TEXT [not null]
    start_script VARCHAR(255) [not null]
    actif BOOLEAN [default: false, not null]
    global BOOLEAN [default: true, not null]
}

Table serveurs_invests {
    id INT [pk, increment]
    serveur_id INT [ref: > serveurs.id, not null]
    utilisateur_id INT [ref: > utilisateurs_discord.id, not null]
}

Table serveurs_admins {
    id INT [pk, increment]
    serveur_id INT [ref: > serveurs.id, not null]
    utilisateur_id INT [ref: > utilisateurs_discord.id, not null]
}

Table serveurs_parameters {
    id_serv_primaire INT [ref: > serveurs.id, not null]
    id_serv_secondaire INT [ref: > serveurs.id, not null]
    host_primaire VARCHAR(255) [not null]
    host_secondaire VARCHAR(255) [not null]
    rcon_password VARCHAR(255) [not null]
}

Table utilisateurs_discord {
    id INT [pk, increment]
    discord_tag VARCHAR(20) [not null]
    pseudo_discord VARCHAR(255) [not null]
    join_date_discord DATETIME [not null]
    prem_connexion DATETIME
    dern_connexion DATETIME
}

Table joueurs_mc {
    id INT [pk, increment]
    utilisateur_id INT [ref: > utilisateurs_discord.id, not null]
    uuid VARCHAR(255) [not null]
    premiere_co DATETIME
    derniere_co DATETIME
}

Table serveurs_connections_log {
    id INT [pk, increment]
    utilisateur_id INT [ref: > utilisateurs_discord.id, not null]
    serveur_id INT [ref: > serveurs.id, not null]
    date DATETIME
}

Table stats_mc {
  id INT [pk, increment]
  joueurs_mc_id INT [ref: > joueurs_mc.id, not null]
  serveur_id INT [ref: > serveurs.id, not null]
  tmps_jeux BIGINT [default: 0]
  nb_mort INT [default: 0]
  nb_kills INT [default: 0]
  nb_playerkill INT [default: 0]
  mob_killed JSON [default: "{}"]
  nb_blocs_detr INT [default: 0]
  nb_blocs_pose INT [default: 0]
  dist_total INT [default: 0]
  dist_pieds INT [default: 0]
  dist_elytres INT [default: 0]
  dist_vol INT [default: 0]
  item_crafted JSON [default: "{}"]
  item_broken JSON [default: "{}"]
  achievement JSON [default: "{}"]
  dern_enregistrment DATETIME [not null]
}

Table badges {
  id INT [pk, increment]
  nom VARCHAR(100) [not null]
  categorie VARCHAR(100) [not null]
  actif BOOLEAN [default: true]
}

TABLE badges_utilisateurs {
  id INT [pk, increment]
  utilisateur_id INT [ref: > utilisateurs_discord.id, not null]
  badge_id INT [ref: > badges.id, not null]
  date_recu DATETIME [not null]
}
*/

// Création de la connexion à MySQL
const connection = mysql.createConnection({
  host: db_host,
  user: db_user,
  password: db_password
});

// Fonction générique pour créer une table
function createTable(query, table_name) {
  console.log(log_i + `Création de la table ${table_name}...`);
  return new Promise((resolve, reject) => {
    connection.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Connexion à MySQL et création de la base de données
connection.connect((err) => {
  if (err) {
    console.log(log_e + 'Erreur de connexion à la base de données : "', error_c + err + reset_c + '"');
    return;
  }
  console.log(log_s + 'Connexion à MySQL réussie.');

  // Vérification si la base de données existe
  connection.query(`CREATE DATABASE IF NOT EXISTS ${api_db_name};`, (err, result) => {
    if (err) {
      console.log(log_e + 'Erreur lors de la création de la base de données : "', error_c + err + reset_c + '"');
      connection.end();
      return;
    }
    console.log(log_s + `Base de données ${api_db_name} créée ou déjà existante.`);

    // Sélectionner la base de données et créer les tables
    connection.changeUser({ database: api_db_name }, async (err) => {
      if (err) {
        console.log(log_e + 'Erreur lors du changement de base de données : "', error_c + err + reset_c + '"');
        connection.end();
        return;
      }

      try {
        // Créer toutes les tables en parallèle
        await Promise.all([
          createTable(`
            CREATE TABLE IF NOT EXISTS routes (
              id INT AUTO_INCREMENT PRIMARY KEY,
              alias VARCHAR(255) UNIQUE NOT NULL,
              route TEXT NOT NULL,
              description TEXT,
              methode ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL
            );
          `, 'routes'),

          createTable(`
            CREATE TABLE IF NOT EXISTS parameters (
              parametre VARCHAR(255) UNIQUE NOT NULL,
              valeur TEXT
            );
          `, 'parameters'),
        ]);

        console.log(log_s + 'Toutes les tables ont été créées ou existent déjà.');

      } catch (error) {
        console.log(log_e + 'Erreur lors de la création des tables : "', error_c + error + reset_c + '"');
      } finally {
        connection.end();
      }
    });
  });
});

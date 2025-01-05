const mysql = require('mysql2');
const { db_host, db_user, db_password, serv_db_name } = require('../config.json');
const { log_i, log_s, log_e, error_c, reset_c } = require('../color_code.json');

/*
Table serveurs {
    id INT [pk, increment]
    nom VARCHAR(255) [not null]
    jeu VARCHAR(255) [not null]
    version VARCHAR(50) [not null]
    modpack VARCHAR(255) [not null]
    modpack_url VARCHAR(255)
    nom_monde VARCHAR(255) [not null]
    embed_color VARCHAR(7) [not null]
    path_serv TEXT [not null]
    start_script VARCHAR(255) [not null]
    actif BOOLEAN [default: false]
    global BOOLEAN [default: true]
}

Table investisseurs {
    id INT [pk, increment]
    nom VARCHAR(255) [unique, not null]
}

Table administrateurs {
    id INT [pk, increment]
    nom VARCHAR(255) [unique, not null]
}

Table serveurs_investisseurs {
    serveur_id INT [ref: > serveurs.id]
    investisseur_id INT [ref: > investisseurs.id]

    indexes {
        (serveur_id, investisseur_id) [unique]
    }
}

Table serveurs_administrateurs {
    serveur_id INT [ref: > serveurs.id]
    admin_id INT [ref: > administrateurs.id]

    indexes {
        (serveur_id, admin_id) [unique]
    }
}

Table rcon_parameters {
    host_primaire VARCHAR(255) [not null]
    host_secondaire VARCHAR(255) [not null]
    rcon_password VARCHAR(255) [not null]
}

Table serveurs_actuels {
    id_serv_primaire INT [ref: > serveurs.id]
    id_serv_secondaire INT [ref: > serveurs.id]
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
  connection.query(`CREATE DATABASE IF NOT EXISTS ${serv_db_name};`, (err, result) => {
    if (err) {
      console.log(log_e + 'Erreur lors de la création de la base de données : "', error_c + err + reset_c + '"');
      connection.end();
      return;
    }
    console.log(log_s + `Base de données ${serv_db_name} créée ou déjà existante.`);

    // Sélectionner la base de données et créer les tables
    connection.changeUser({ database: serv_db_name }, async (err) => {
      if (err) {
        console.log(log_e + 'Erreur lors du changement de base de données : "', error_c + err + reset_c + '"');
        connection.end();
        return;
      }

      try {
        // Créer toutes les tables en parallèle
        await Promise.all([
          createTable(`
            CREATE TABLE IF NOT EXISTS serveurs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              nom VARCHAR(255) NOT NULL,
              jeu VARCHAR(255) NOT NULL,
              version VARCHAR(50) NOT NULL,
              modpack VARCHAR(255) NOT NULL,
              modpack_url VARCHAR(255),
              nom_monde VARCHAR(255) NOT NULL,
              embed_color VARCHAR(7) NOT NULL,
              path_serv TEXT NOT NULL,
              start_script VARCHAR(255) NOT NULL,
              actif BOOLEAN DEFAULT FALSE,
              global BOOLEAN DEFAULT TRUE
            );
          `, 'serveurs'),

          createTable(`
            CREATE TABLE IF NOT EXISTS investisseurs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              nom VARCHAR(255) UNIQUE NOT NULL
            );
          `, 'investisseurs'),

          createTable(`
            CREATE TABLE IF NOT EXISTS administrateurs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              nom VARCHAR(255) UNIQUE NOT NULL
            );
          `, 'administrateurs'),

          createTable(`
            CREATE TABLE IF NOT EXISTS serveurs_investisseurs (
              serveur_id INT,
              investisseur_id INT,
              UNIQUE (serveur_id, investisseur_id),
              FOREIGN KEY (serveur_id) REFERENCES serveurs(id) ON DELETE CASCADE,
              FOREIGN KEY (investisseur_id) REFERENCES investisseurs(id) ON DELETE CASCADE
            );
          `, 'serveurs_investisseurs'),

          createTable(`
            CREATE TABLE IF NOT EXISTS serveurs_administrateurs (
              serveur_id INT,
              admin_id INT,
              UNIQUE (serveur_id, admin_id),
              FOREIGN KEY (serveur_id) REFERENCES serveurs(id) ON DELETE CASCADE,
              FOREIGN KEY (admin_id) REFERENCES administrateurs(id) ON DELETE CASCADE
            );
          `, 'serveurs_administrateurs'),

          createTable(`
            CREATE TABLE IF NOT EXISTS serveurs_actif (
              serveur_primaire INT,
              serveur_secondaire INT,
              FOREIGN KEY (serveur_primaire) REFERENCES serveurs(id) ON DELETE CASCADE,
              FOREIGN KEY (serveur_secondaire) REFERENCES serveurs(id) ON DELETE CASCADE
            );
          `, 'serveurs_actif'),

          createTable(`
            CREATE TABLE IF NOT EXISTS rcon_parameters (
              host_primaire VARCHAR(255) NOT NULL,
              host_secondaire VARCHAR(255) NOT NULL,
              rcon_password VARCHAR(255) NOT NULL
            );
          `, 'rcon_parameters'),

          createTable(`
            CREATE TABLE IF NOT EXISTS serveurs_actuels (
              id_serv_primaire INT,
              id_serv_secondaire INT,
              FOREIGN KEY (id_serv_primaire) REFERENCES serveurs(id) ON DELETE CASCADE,
              FOREIGN KEY (id_serv_secondaire) REFERENCES serveurs(id) ON DELETE CASCADE
            );
          `, 'serveurs_actuels')
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

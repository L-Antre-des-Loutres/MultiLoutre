const mysql = require('mysql2');
const { db_host, db_user, db_password, api_db_name } = require('../config.json');
const { log_i, log_s, log_e, error_c, reset_c } = require('../color_code.json');

/*
Table routes {
    id INT [pk, increment]
    alias VARCHAR(255) [unique, not null]
    route TEXT [not null]
    description TEXT
    methode ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') [not null]
}

Table parameters {
    parametre VARCHAR(255) [unique, not null]
    valeur TEXT
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

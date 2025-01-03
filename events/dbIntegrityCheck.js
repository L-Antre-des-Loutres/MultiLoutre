const mysql = require('mysql2');
const { db_host, db_user, db_password, db_name } = require('../config.json');
const { log_i, log_s, log_e, error_c, reset_c, important_c } = require('../color_code.json');

module.exports = {
  name: 'dbIntegrityCheck',
  once: false, // Cet événement peut être déclenché à chaque fois que tu veux vérifier l'intégrité
  execute: async () => {
    console.log(log_i + 'Vérification de l\'intégrité de la base de données...');

    // Création de la connexion à MySQL
    const connection = mysql.createConnection({
      host: db_host,
      user: db_user,
      password: db_password,
      database: db_name,
    });

    // Vérifier la connexion
    connection.connect((err) => {
      if (err) {
        console.log(log_e + 'Erreur de connexion à la base de données : "', error_c + err + reset_c + '"');
        return;
      }
      console.log(log_s + 'Connexion à MySQL réussie.');

      // Vérification de l'intégrité de la base de données
      checkDatabaseIntegrity(connection);
    });
  },
};

// Fonction pour vérifier l'intégrité de la base de données
async function checkDatabaseIntegrity(connection) {
  try {
    console.log(log_i + 'Vérification de l\'intégrité de la base de données...' + reset_c);

    // Vérifier que toutes les tables existent
    const tables = await getTables(connection);

    const expectedTables = [
      'serveurs',
      'investisseurs',
      'administrateurs',
      'serveurs_investisseurs',
      'serveurs_administrateurs',
      'serveurs_actif',
      'rcon_parameters',
    ];

    const missingTables = expectedTables.filter(table => !tables.includes(table));

    if (missingTables.length > 0) {
      console.log(log_e + 'Tables manquantes : ', error_c + missingTables.join(', ') + reset_c);
    } else {
      console.log(log_s + 'Toutes les tables sont présentes.' + reset_c);
    }

    // Vérifier l'intégrité des clés étrangères (tables liées)
    await checkForeignKeyConstraints(connection);

    // Optionnel : Vérifier des incohérences dans les données (par exemple, serveurs_investisseurs sans investisseurs)
    await checkDataConsistency(connection);

    connection.end();
  } catch (error) {
    console.error(log_e + 'Erreur lors de la vérification de l\'intégrité : ', error_c + error + reset_c);
    connection.end();
  }
}

// Fonction pour récupérer la liste des tables de la base de données
function getTables(connection) {
  return new Promise((resolve, reject) => {
    connection.query('SHOW TABLES;', (err, results) => {
      if (err) reject(err);
      else resolve(results.map(result => Object.values(result)[0]));
    });
  });
}

// Fonction pour vérifier l'intégrité des clés étrangères
async function checkForeignKeyConstraints(connection) {
  return new Promise((resolve, reject) => {
    connection.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?;
    `, [db_name], (err, results) => {
      if (err) reject(err);

      if (results.length > 0) {
        console.log(log_s + 'Vérification des clés étrangères terminée.' + reset_c);
      } else {
        console.log(log_e + 'Aucune contrainte de clé étrangère trouvée.' + reset_c);
      }

      resolve();
    });
  });
}

// Fonction pour vérifier les incohérences dans les données
async function checkDataConsistency(connection) {
  try {
    // Vérification des incohérences dans la table serveurs_investisseurs
    const [investisseurCheck] = await connection.query(`
      SELECT si.serveur_id, si.investisseur_id
      FROM serveurs_investisseurs si
      LEFT JOIN investisseurs i ON si.investisseur_id = i.id
      WHERE i.id IS NULL;
    `);

    if (investisseurCheck.length > 0) {
      console.log(log_e + 'Incohérences trouvées dans serveurs_investisseurs (Investisseurs inexistants) : ', error_c + JSON.stringify(investisseurCheck) + reset_c);
    } else {
      console.log(log_s + 'Aucune incohérence trouvée dans serveurs_investisseurs.' + reset_c);
    }

    // Vérification des incohérences dans la table serveurs_administrateurs
    const [adminCheck] = await connection.query(`
      SELECT sa.serveur_id, sa.admin_id
      FROM serveurs_administrateurs sa
      LEFT JOIN administrateurs a ON sa.admin_id = a.id
      WHERE a.id IS NULL;
    `);

    if (adminCheck.length > 0) {
      console.log(log_e + 'Incohérences trouvées dans serveurs_administrateurs (Administrateurs inexistants) : ', error_c + JSON.stringify(adminCheck) + reset_c);
    } else {
      console.log(log_s + 'Aucune incohérence trouvée dans serveurs_administrateurs.' + reset_c);
    }
  } catch (err) {
    console.log(log_e + 'Erreur lors de la vérification des incohérences dans les données : ', error_c + err + reset_c);
  }
}

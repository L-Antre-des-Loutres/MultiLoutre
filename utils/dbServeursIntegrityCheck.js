const mysql = require('mysql2/promise'); // Utilisation du wrapper promise
const { db_host, db_user, db_password, serv_db_name } = require('../config.json');
const { log_i, log_s, log_e, important_c, error_c, reset_c } = require('../color_code.json');

async function dbIntegrityCheck() {
  console.log(log_i + `Commande "${important_c}check-db-integrity${reset_c}" lancée. Vérification de l'intégrité de la base de données...`);

  // On prépare un tableau pour les résultats
  const utils_results = [];

  let connection;
  try {
    // Création de la connexion à MySQL avec le wrapper `promise`
    connection = await mysql.createConnection({
      host: db_host,
      user: db_user,
      password: db_password,
      database: serv_db_name,
    });
    console.log(log_s + 'Connexion réussie.');
    utils_results.push({ connection: '🟢 Connexion réussie' });

    // Vérifier l'intégrité de la base de données
    await checkDatabaseIntegrity(connection, utils_results);
    console.log(log_s + 'Vérification terminée.');
  } catch (error) {
    console.error(log_e + 'Erreur lors de la vérification de l\'intégrité : ', error_c + error + reset_c);
    utils_results.push({ connection: '🔴 Erreur lors de la vérification de l\'intégrité : ' + error.message });
  } finally {
    if (connection) {
      await connection.end(); // Fermer la connexion proprement
    }
  }

  return utils_results;
}

async function checkDatabaseIntegrity(connection, utils_results) {
  console.log(log_i + 'Vérification des tables et des données...' + reset_c);

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
    utils_results.push({ tables: '🔴 Tables manquantes : ' + missingTables.join(', ') });
  } else {
    console.log(log_s + 'Toutes les tables sont présentes.' + reset_c);
    utils_results.push({ tables: '🟢 Toutes les tables sont présentes' });
  }

  await checkForeignKeyConstraints(connection, utils_results);
  await checkDataConsistency(connection, utils_results);
}

async function getTables(connection) {
  const [results] = await connection.query('SHOW TABLES;');
  return results.map(result => Object.values(result)[0]);
}

async function checkForeignKeyConstraints(connection, utils_results) {
  const query = `
    SELECT CONSTRAINT_NAME, TABLE_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = ?;
  `;
  const [results] = await connection.query(query, [serv_db_name]);

  if (results.length > 0) {
    console.log(log_s + 'Vérification des clés étrangères terminée.' + reset_c);
    utils_results.push({ foreign_keys: '🟢 Clés étrangères trouvées' });
  } else {
    console.log(log_e + 'Aucune contrainte de clé étrangère trouvée.' + reset_c);
    utils_results.push({ foreign_keys: '🔴 Aucune contrainte de clé étrangère trouvée' });
  }
}

async function checkDataConsistency(connection, utils_results) {
  const [investisseurCheck] = await connection.query(`
    SELECT si.serveur_id, si.investisseur_id
    FROM serveurs_investisseurs si
    LEFT JOIN investisseurs i ON si.investisseur_id = i.id
    WHERE i.id IS NULL;
  `);

  if (investisseurCheck.length > 0) {
    console.log(log_e + 'Incohérences trouvées dans serveurs_investisseurs : ', error_c + JSON.stringify(investisseurCheck) + reset_c);
    utils_results.push({ investisseurs: '🔴 Incohérences trouvées dans serveurs_investisseurs' });
  } else {
    console.log(log_s + 'Aucune incohérence trouvée dans serveurs_investisseurs.' + reset_c);
    utils_results.push({ investisseurs: '🟢 Aucune incohérence trouvée dans serveurs_investisseurs' });
  }

  const [adminCheck] = await connection.query(`
    SELECT sa.serveur_id, sa.admin_id
    FROM serveurs_administrateurs sa
    LEFT JOIN administrateurs a ON sa.admin_id = a.id
    WHERE a.id IS NULL;
  `);

  if (adminCheck.length > 0) {
    console.log(log_e + 'Incohérences trouvées dans serveurs_administrateurs : ', error_c + JSON.stringify(adminCheck) + reset_c);
    utils_results.push({ administrateurs: '🔴 Incohérences trouvées dans serveurs_administrateurs' });
  } else {
    console.log(log_s + 'Aucune incohérence trouvée dans serveurs_administrateurs.' + reset_c);
    utils_results.push({ administrateurs: '🟢 Aucune incohérence trouvée dans serveurs_administrateurs' });
  }
}

module.exports = { dbIntegrityCheck };

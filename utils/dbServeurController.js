const dbApiParametersController = require(__dirname + '/dbApiParametersController.js');
const mysql = require('mysql2');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));
const connection = mysql.createConnection({
  host: config.db_host,
  user: config.db_user,
  password: config.db_password,
  database: config.global_db_name
});

function connectToDB() {
  return new Promise((resolve, reject) => {
    connection.connect(err => {
      if (err) {
        reject('Error connecting to the database: ' + err.stack);
      } else {
        resolve('Connected to the database.');
      }
    });
  });
}

function closeConnection() {
  connection.end(err => {
    if (err) {
      console.error('Error closing the connection:', err);
    } else {
      console.log('Connection closed.');
    }
  });
}

function useDatabase(dbName) {
  return new Promise((resolve, reject) => {
    connection.query('USE ' + dbName, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function getServerEmoji(server) {
  if (server.jeu !== 'Minecraft') {
    return '<:other_servers:1325467780602138736>';
  } else if (server.modpack === 'Minecraft Vanilla') {
    return '<:mc_primaire:1325274691581120582>';
  } else {
    return '<:mc_secondaire:1325274670215200789>';
  }
}

/*
Table serveurs {
    id INT [pk, increment]
    nom VARCHAR(255) [not null]
    jeu VARCHAR(255) [not null]
    version VARCHAR(20) [not null]
    modpack VARCHAR(255) [default: 'Vanilla']
    modpack_url VARCHAR(255) [null]
    nom_monde VARCHAR(255) [default: 'world']
    embed_color VARCHAR(7) [default: '#000000']
    path_serv TEXT [not null]
    start_script VARCHAR(255) [not null]
    actif BOOLEAN [default: false, not null]
    global BOOLEAN [default: true, not null]
}
*/

function getAllServers(actif, global, jeu) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM serveurs';
    let params = [];
    if (actif !== undefined) {
      query += ' WHERE actif = ?';
      params.push(actif);
    }
    if (global !== undefined) {
      query += actif !== undefined ? ' AND global = ?' : ' WHERE global = ?';
      params.push(global);
    }
    if (jeu !== undefined) {
      query += actif !== undefined || global !== undefined ? ' AND jeu = ?' : ' WHERE jeu = ?';
      params.push(jeu);
    }
    connection.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function getServerById(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
}

function isServerActive(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT actif FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(!!results[0]?.actif);
    });
  });
}

function isServerGlobal(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT global FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(!!results[0]?.global);
    });
  });
}

/*
Table serveurs_parameters {
    id_serv_primaire INT [ref: > serveurs.id, not null]
    id_serv_secondaire INT [ref: > serveurs.id, not null]
    host_primaire VARCHAR(255) [not null]
    host_secondaire VARCHAR(255) [not null]
    rcon_password VARCHAR(255) [not null]
}
*/

function getServerPrimaire() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT id_serv_primaire FROM serveurs_parameters', (err, results) => {
      if (err) reject(err);
      else resolve(results[0]?.id_serv_primaire);
    });
  });
}

function getServerSecondaire() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT id_serv_secondaire FROM serveurs_parameters', (err, results) => {
      if (err) reject(err);
      else resolve(results[0]?.id_serv_secondaire);
    });
  });
}

function getPrimaryRconParameters() {
  const rconString = { host: '', port: 25575, password: '' };
  return new Promise((resolve, reject) => {
    connection.query('SELECT host_primaire, rcon_password FROM serveurs_parameters', (err, results) => {
      if (err) reject(err);
      else {
        rconString.host = results[0]?.host_primaire;
        rconString.password = results[0]?.rcon_password;
        resolve(rconString);
      }
    });
  });
}

function getSecondaryRconParameters() {
  const rconString = { host: '', port: 25574, password: '' };
  return new Promise((resolve, reject) => {
    connection.query('SELECT host_secondaire, rcon_password FROM serveurs_parameters', (err, results) => {
      if (err) reject(err);
      else {
        rconString.host = results[0]?.host_secondaire;
        rconString.password = results[0]?.rcon_password;
        resolve(rconString);
      }
    });
  });
}

function isServerPrimary(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT id_serv_primaire FROM serveurs_parameters WHERE id_serv_primaire = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(!!results[0]?.id_serv_primaire);
    });
  });
}

function isServerSecondary(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT id_serv_secondaire FROM serveurs_parameters WHERE id_serv_secondaire = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(!!results[0]?.id_serv_secondaire);
    });
  });
}

/*
Table serveurs_roles {
    id INT [pk, increment]
    serveur_id INT [ref: > serveurs.id, not null]
    utilisateur_id INT [ref: > utilisateurs_discord.id, not null]
    methode ENUM('administrateur', 'investisseur') [not null]
}
*/

function linkServerToInvestor(serverId, userId) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO serveurs_roles (serveur_id, utilisateur_id, methode) VALUES (?, ?, "investisseur")', [serverId, userId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function linkServerToAdministrator(serverId, userId) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO serveurs_roles (serveur_id, utilisateur_id, methode) VALUES (?, ?, "administrateur")', [serverId, userId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

module.exports = {
  connectToDB,
  closeConnection,
  useDatabase,  
  getServerEmoji,
  getAllServers,
  getServerById,
  isServerActive,
  isServerGlobal,
  getServerPrimaire,
  getServerSecondaire,
  getPrimaryRconParameters,
  getSecondaryRconParameters,
  isServerPrimary,
  isServerSecondary,
  linkServerToInvestor,
  linkServerToAdministrator
};

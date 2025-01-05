const mysql = require('mysql2');
const fs = require('fs');

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
    id INT [pk, increment]
    host_primaire VARCHAR(255) [not null]
    host_secondaire VARCHAR(255) [not null]
    rcon_password VARCHAR(255) [not null]
}
*/

// Crée une connexion à la base de données
const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));
const connection = mysql.createConnection({
  host: config.db_host,
  user: config.db_user,
  password: config.db_password,
  database: config.serv_db_name
});

// Lance la connexion à la base de données : sans paramètre
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

// Ferme la connexion à la base de données : sans paramètre
function closeConnection() {
  connection.end(err => {
    if (err) {
      console.error('Error closing the connection:', err);
    } else {
      console.log('Connection closed.');
    }
  });
}

// Récupère tous les serveurs : sans paramètre
function getAllServers() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère un serveur par son ID : paramètre id = id du serveur
function getServerById(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]); // Un seul résultat attendu
      }
    });
  });
}

// Récupère tous les serveurs actifs : sans paramètre
function getAllActiveServers() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs WHERE actif = 1', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère tous les serveurs Minecraft : sans paramètre
function getAllMinecraftServers() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs WHERE jeu = "Minecraft"', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère tous les serveurs Minecraft actifs : sans paramètre
function getAllActiveMinecraftServers() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs WHERE jeu = "Minecraft" AND actif = 1', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère un serveur par son ID : paramètre id = id du serveur
function getServerById(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

// Vérifie si un serveur est actif : paramètre id = id du serveur
function isServerActive(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT actif FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].actif);
      }
    });
  });
}

// Vérifie si un serveur est global : paramètre id = id du serveur
function isServerGlobal(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT global FROM serveurs WHERE id = ?', [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].global);
      }
    });
  });
}

// Récupère tous les investisseurs : sans paramètre
function getAllInvestors() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM investisseurs', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère un investisseur par son nom : paramètre name = nom de l'investisseur
function getInvestorByName(name) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM investisseurs WHERE nom = ?', [name], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

// Ajoute un nouvel investisseur : paramètre name = nom de l'investisseur
function addInvestor(name) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO investisseurs (nom) VALUES (?)', [name], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Réccupère tous les administrateurs : sans paramètre
function getAllAdministrators() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM administrateurs', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère un administrateur par son nom : paramètre name = nom de l'administrateur
function getAdministratorByName(name) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM administrateurs WHERE nom = ?', [name], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

// Ajoute un nouvel administrateur : paramètre name = nom de l'administrateur
function addAdministrator(name) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO administrateurs (nom) VALUES (?)', [name], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Récupère les paramètres RCON : sans paramètre
function getRconParameters() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM rcon_parameters LIMIT 1', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

// Lie un serveur à un investisseur : paramètre serverId = id du serveur, investorId = id de l'investisseur
function linkServerToInvestor(serverId, investorId) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO serveurs_investisseurs (serveur_id, investisseur_id) VALUES (?, ?)', 
    [serverId, investorId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Lie un serveur à un administrateur : paramère serverId = id du serveur, adminId = id de l'administrateur
function linkServerToAdministrator(serverId, adminId) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO serveurs_administrateurs (serveur_id, admin_id) VALUES (?, ?)', 
    [serverId, adminId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Export des fonctions du contrôleur
module.exports = {
  connectToDB,
  closeConnection,
  getAllServers,
  getServerById,
  getAllActiveServers,
  getAllMinecraftServers,
  getAllActiveMinecraftServers,
  getServerById,
  isServerActive,
  isServerGlobal,
  getAllInvestors,
  getInvestorByName,
  addInvestor,
  getAllAdministrators,
  getAdministratorByName,
  addAdministrator,
  getRconParameters,
  linkServerToInvestor,
  linkServerToAdministrator
};

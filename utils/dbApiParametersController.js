const mysql = require('mysql2');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));
const connection = mysql.createConnection({
  host: config.db_host,
  user: config.db_user,
  password: config.db_password,
  database: config.api_db_name
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

async function getAllRoutes() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM routes', (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

async function getRouteById(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM routes WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
}

async function getRouteByAlias(alias) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM routes WHERE alias = ?', [alias], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]?.route);
    });
  });
}

async function getAllParameters() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM parameters', (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

async function getParameterByName(parametre) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM parameters WHERE parametre = ?', [parametre], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]?.valeur);
    });
  });
}

async function fetchServerStatus(alias, id) {
  try {
    const apiRoute = await getRouteByAlias(alias);
    if (!apiRoute) {
      throw new Error(`Route not found for alias "${alias}"`);
    }

    const fullApiRoute = `${apiRoute}${id}`;
    console.log('Fetching server status from:', fullApiRoute);

    const response = await fetch(fullApiRoute);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching server status:', error);
    throw error;
  }
}

module.exports = {
  connectToDB,
  closeConnection,
  getAllRoutes,
  getRouteById,
  getRouteByAlias,
  getAllParameters,
  getParameterByName,
  fetchServerStatus
};

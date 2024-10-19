const mysql = require('mysql2/promise');
const {
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_USER
} = require('./config');  // Importar las configuraciones desde config.js

// Crear el pool de conexiones
const pool = mysql.createPool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME
});

module.exports = pool;  // Exportar el pool de conexiones

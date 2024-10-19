// config.js
module.exports = {
    PORT: process.env.PORT || 3000,
    DB_HOST: process.env.DB_HOST || 'tus-credenciales-railway-host',  // El host de tu base de datos en Railway
    DB_NAME: process.env.DB_NAME || 'tus-credenciales-railway-db-name',  // El nombre de la base de datos
    DB_PASSWORD: process.env.DB_PASSWORD || 'tus-credenciales-railway-password',  // La contraseña proporcionada por Railway
    DB_PORT: process.env.DB_PORT || 3306,  // El puerto proporcionado por Railway (generalmente 3306 para MySQL)
    DB_USER: process.env.DB_USER || 'tus-credenciales-railway-user'  // El usuario de la base de datos
};

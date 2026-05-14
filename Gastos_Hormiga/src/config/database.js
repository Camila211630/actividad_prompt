const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para SQL Server con Autenticación SQL (usuario/contraseña)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,      // Tu usuario SQL (ej: 'sa' o el que creaste)
  process.env.DB_PASSWORD,  // Tu contraseña
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,           // Para SQL Server local
        trustServerCertificate: true,
        enableArithAbort: true
      }
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Probar conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server exitosamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
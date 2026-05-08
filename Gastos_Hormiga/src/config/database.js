const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para SQL Server con Autenticación de Windows
const sequelize = new Sequelize(
  process.env.DB_NAME,
  '',  // Usuario vacío para Windows Auth
  '',  // Contraseña vacía para Windows Auth
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        trustedConnection: true,  // 👈 Clave: Autenticación de Windows
        encrypt: false,           // Para SQL Server local
        trustServerCertificate: true
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
    console.log('✅ Conectado a SQL Server con Autenticación de Windows');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
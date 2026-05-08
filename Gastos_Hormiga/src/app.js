const express = require('express');
const cors = require('cors');

const app = express();

const { sequelize, testConnection } = require('./config/database');
const { syncModels } = require('./models');

// Importar rutas
const categoriaRoutes = require('./routes/categoria.routes');
const gastoRoutes = require('./routes/gasto.routes');

// Probar conexión a la base de datos al iniciar
(async () => {
  const connected = await testConnection();
  if (connected) {
    await syncModels(false); // false = no alterar tablas existentes
  }
})();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar rutas
app.use('/api/categorias', categoriaRoutes);
app.use('/api/gastos', gastoRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de Control de Gastos Hormiga funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
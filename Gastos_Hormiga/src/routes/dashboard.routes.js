const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Rutas del dashboard
router.get('/', dashboardController.getDashboard.bind(dashboardController));
router.get('/metricas', dashboardController.getMetricas.bind(dashboardController));
router.get('/alertas', dashboardController.getAlertas.bind(dashboardController));
router.get('/recomendaciones', dashboardController.getRecomendaciones.bind(dashboardController));
router.get('/tendencias', dashboardController.getTendencias.bind(dashboardController));
router.get('/top-categorias', dashboardController.getTopCategorias.bind(dashboardController));

module.exports = router;    
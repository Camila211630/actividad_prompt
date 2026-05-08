const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gasto.controller');

// Rutas para gastos
router.get('/', gastoController.getAll.bind(gastoController));
router.get('/hormiga', gastoController.getGastosHormiga.bind(gastoController));
router.get('/resumen/:year/:month', gastoController.getResumenPorMes.bind(gastoController));
router.get('/:id', gastoController.getById.bind(gastoController));
router.post('/', gastoController.create.bind(gastoController));
router.put('/:id', gastoController.update.bind(gastoController));
router.delete('/:id', gastoController.delete.bind(gastoController));

module.exports = router;
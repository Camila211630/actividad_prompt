const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');

// Rutas para categorías
router.get('/', categoriaController.getAll.bind(categoriaController));
router.get('/hormiga', categoriaController.getGastosHormiga.bind(categoriaController));
router.get('/:id', categoriaController.getById.bind(categoriaController));
router.post('/', categoriaController.create.bind(categoriaController));
router.put('/:id', categoriaController.update.bind(categoriaController));
router.delete('/:id', categoriaController.delete.bind(categoriaController));

module.exports = router;

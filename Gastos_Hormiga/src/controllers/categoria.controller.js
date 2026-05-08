const categoriaService = require('../services/categoria.service');
const { CrearCategoriaDTO, ActualizarCategoriaDTO } = require('../dtos/categoria.dto');

class CategoriaController {
  
  // Obtener todas las categorías activas
  async getAll(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      
      const categorias = includeInactive 
        ? await categoriaService.findAllIncludingInactive()
        : await categoriaService.findAll();
      
      res.json({
        success: true,
        data: categorias,
        count: categorias.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener categorías hormiga
  async getGastosHormiga(req, res, next) {
    try {
      const categorias = await categoriaService.findGastosHormiga();
      
      res.json({
        success: true,
        data: categorias,
        count: categorias.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener categoría por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.findById(parseInt(id));
      
      res.json({
        success: true,
        data: categoria
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nueva categoría
  async create(req, res, next) {
    try {
      const crearDTO = new CrearCategoriaDTO(req.body);
      const nuevaCategoria = await categoriaService.create(crearDTO);
      
      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: nuevaCategoria
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar categoría
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const actualizarDTO = new ActualizarCategoriaDTO(req.body);
      const categoriaActualizada = await categoriaService.update(parseInt(id), actualizarDTO);
      
      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoriaActualizada
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar categoría (soft delete)
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await categoriaService.delete(parseInt(id));
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoriaController();
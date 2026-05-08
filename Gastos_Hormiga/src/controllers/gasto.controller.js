const gastoService = require('../services/gasto.service');
const { CrearGastoDTO, ActualizarGastoDTO } = require('../dtos/gasto.dto');

class GastoController {
  
  // Obtener todos los gastos con filtros
  async getAll(req, res, next) {
    try {
      const filtros = req.query;
      const gastos = await gastoService.findAll(filtros);
      
      res.json({
        success: true,
        data: gastos,
        count: gastos.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener gastos hormiga
  async getGastosHormiga(req, res, next) {
    try {
      const gastos = await gastoService.findGastosHormiga();
      
      res.json({
        success: true,
        data: gastos,
        count: gastos.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener gasto por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const gasto = await gastoService.findById(parseInt(id));
      
      res.json({
        success: true,
        data: gasto
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo gasto
  async create(req, res, next) {
    try {
      const crearDTO = new CrearGastoDTO(req.body);
      const nuevoGasto = await gastoService.create(crearDTO);
      
      res.status(201).json({
        success: true,
        message: 'Gasto creado exitosamente',
        data: nuevoGasto
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar gasto
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const actualizarDTO = new ActualizarGastoDTO(req.body);
      const gastoActualizado = await gastoService.update(parseInt(id), actualizarDTO);
      
      res.json({
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: gastoActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar gasto
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await gastoService.delete(parseInt(id));
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener resumen por mes
  async getResumenPorMes(req, res, next) {
    try {
      const { year, month } = req.params;
      const resumen = await gastoService.getResumenPorMes(parseInt(year), parseInt(month));
      
      res.json({
        success: true,
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GastoController();
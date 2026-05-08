const { Gasto, Categoria } = require('../models');
const { Op } = require('sequelize');
const { CrearGastoDTO, ActualizarGastoDTO, GastoResponseDTO, FiltrosGastoDTO } = require('../dtos/gasto.dto');

class GastoService {
  
  // Obtener todos los gastos con filtros opcionales
  async findAll(filtros = {}) {
    try {
      const where = {};
      const filtrosDTO = new FiltrosGastoDTO(filtros);

      // Aplicar filtros
      if (filtrosDTO.fechaInicio || filtrosDTO.fechaFin) {
        where.fecha = {};
        if (filtrosDTO.fechaInicio) where.fecha[Op.gte] = filtrosDTO.fechaInicio;
        if (filtrosDTO.fechaFin) where.fecha[Op.lte] = filtrosDTO.fechaFin;
      }

      if (filtrosDTO.categoriaId) {
        where.categoriaId = filtrosDTO.categoriaId;
      }

      if (filtrosDTO.tipoGasto) {
        where.tipoGasto = filtrosDTO.tipoGasto;
      }

      if (filtrosDTO.minMonto || filtrosDTO.maxMonto) {
        where.monto = {};
        if (filtrosDTO.minMonto) where.monto[Op.gte] = filtrosDTO.minMonto;
        if (filtrosDTO.maxMonto) where.monto[Op.lte] = filtrosDTO.maxMonto;
      }

      if (filtrosDTO.esRecurrente !== undefined) {
        where.esRecurrente = filtrosDTO.esRecurrente;
      }

      const gastos = await Gasto.findAll({
        where,
        include: [{
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'icono', 'esGastoHormiga']
        }],
        order: [['fecha', 'DESC']]
      });

      return gastos.map(gasto => new GastoResponseDTO(gasto));
    } catch (error) {
      throw new Error(`Error al obtener gastos: ${error.message}`);
    }
  }

  // Obtener gastos hormiga
  async findGastosHormiga() {
    try {
      const gastos = await Gasto.findAll({
        include: [{
          model: Categoria,
          as: 'categoria',
          where: { esGastoHormiga: true },
          attributes: ['id', 'nombre', 'icono', 'esGastoHormiga']
        }],
        order: [['fecha', 'DESC']]
      });

      return gastos.map(gasto => new GastoResponseDTO(gasto));
    } catch (error) {
      throw new Error(`Error al obtener gastos hormiga: ${error.message}`);
    }
  }

  // Obtener gasto por ID
  async findById(id) {
    try {
      const gasto = await Gasto.findByPk(id, {
        include: [{
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'icono', 'esGastoHormiga']
        }]
      });

      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      return new GastoResponseDTO(gasto);
    } catch (error) {
      throw new Error(`Error al obtener gasto: ${error.message}`);
    }
  }

  // Crear nuevo gasto
  async create(crearGastoDTO) {
    try {
      // Validar que la categoría existe
      const categoria = await Categoria.findByPk(crearGastoDTO.categoriaId);
      if (!categoria) {
        throw new Error('La categoría especificada no existe');
      }

      // Si la categoría es hormiga, el tipo de gasto puede ser 'Hormiga'
      let tipoGasto = crearGastoDTO.tipoGasto;
      if (categoria.esGastoHormiga && tipoGasto !== 'Hormiga') {
        tipoGasto = 'Hormiga';
      }

      const gasto = await Gasto.create({
        descripcion: crearGastoDTO.descripcion,
        monto: crearGastoDTO.monto,
        fecha: crearGastoDTO.fecha,
        tipoGasto: tipoGasto,
        moneda: crearGastoDTO.moneda,
        notas: crearGastoDTO.notas,
        esRecurrente: crearGastoDTO.esRecurrente,
        categoriaId: crearGastoDTO.categoriaId
      });

      // Recargar el gasto con la relación de categoría
      const gastoCompleto = await this.findById(gasto.id);
      return gastoCompleto;
    } catch (error) {
      throw new Error(`Error al crear gasto: ${error.message}`);
    }
  }

  // Actualizar gasto
  async update(id, actualizarGastoDTO) {
    try {
      const gasto = await Gasto.findByPk(id);
      
      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      // Si se actualiza la categoría, validar que existe
      if (actualizarGastoDTO.categoriaId !== undefined) {
        const categoria = await Categoria.findByPk(actualizarGastoDTO.categoriaId);
        if (!categoria) {
          throw new Error('La categoría especificada no existe');
        }
        
        // Actualizar tipo de gasto si la categoría es hormiga
        if (categoria.esGastoHormiga) {
          actualizarGastoDTO.tipoGasto = 'Hormiga';
        }
      }

      // Actualizar solo los campos que vienen en el DTO
      if (actualizarGastoDTO.descripcion !== undefined) gasto.descripcion = actualizarGastoDTO.descripcion;
      if (actualizarGastoDTO.monto !== undefined) gasto.monto = actualizarGastoDTO.monto;
      if (actualizarGastoDTO.fecha !== undefined) gasto.fecha = actualizarGastoDTO.fecha;
      if (actualizarGastoDTO.tipoGasto !== undefined) gasto.tipoGasto = actualizarGastoDTO.tipoGasto;
      if (actualizarGastoDTO.moneda !== undefined) gasto.moneda = actualizarGastoDTO.moneda;
      if (actualizarGastoDTO.notas !== undefined) gasto.notas = actualizarGastoDTO.notas;
      if (actualizarGastoDTO.esRecurrente !== undefined) gasto.esRecurrente = actualizarGastoDTO.esRecurrente;
      if (actualizarGastoDTO.categoriaId !== undefined) gasto.categoriaId = actualizarGastoDTO.categoriaId;

      await gasto.save();

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar gasto: ${error.message}`);
    }
  }

  // Eliminar gasto
  async delete(id) {
    try {
      const gasto = await Gasto.findByPk(id);
      
      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      await gasto.destroy();
      return { message: 'Gasto eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar gasto: ${error.message}`);
    }
  }

  // Obtener resumen por mes
  async getResumenPorMes(year, month) {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

      const gastos = await Gasto.findAll({
        where: {
          fecha: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{
          model: Categoria,
          as: 'categoria'
        }]
      });

      const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
      const gastosHormiga = gastos.filter(g => {
        const dto = new GastoResponseDTO(g);
        return dto.esGastoHormiga;
      });
      const totalHormiga = gastosHormiga.reduce((sum, g) => sum + parseFloat(g.monto), 0);

      // Agrupar por categoría
      const porCategoria = {};
      gastos.forEach(gasto => {
        const catNombre = gasto.categoria.nombre;
        if (!porCategoria[catNombre]) {
          porCategoria[catNombre] = {
            categoria: catNombre,
            total: 0,
            cantidad: 0,
            icono: gasto.categoria.icono
          };
        }
        porCategoria[catNombre].total += parseFloat(gasto.monto);
        porCategoria[catNombre].cantidad += 1;
      });

      return {
        mes: `${year}-${month.toString().padStart(2, '0')}`,
        totalGastos,
        totalGastosHormiga: totalHormiga,
        cantidadGastosHormiga: gastosHormiga.length,
        promedioDiario: totalGastos / 30,
        gastosPorCategoria: Object.values(porCategoria)
      };
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }
}

module.exports = new GastoService();
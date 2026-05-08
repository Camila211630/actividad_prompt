const { Gasto, Categoria } = require('../models');
const { Op } = require('sequelize');
const { 
  MetricasPrincipalesDTO, 
  AlertaHormigaDTO, 
  RecomendacionDTO,
  TendenciaMensualDTO,
  TopCategoriaDTO 
} = require('../dtos/dashboard.dto');

class DashboardService {
  
  // Obtener métricas principales
  async getMetricasPrincipales(fechaInicio, fechaFin) {
    try {
      const where = {};
      
      if (fechaInicio && fechaFin) {
        where.fecha = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      }

      const gastos = await Gasto.findAll({
        where,
        include: [{
          model: Categoria,
          as: 'categoria'
        }]
      });

      const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
      
      // Identificar gastos hormiga
      const gastosHormiga = gastos.filter(g => {
        const esHormigaPorCategoria = g.categoria && g.categoria.esGastoHormiga;
        const esHormigaPorTipo = g.tipoGasto === 'Hormiga';
        const esHormigaPorMonto = parseFloat(g.monto) < 100;
        return esHormigaPorCategoria || esHormigaPorTipo || esHormigaPorMonto;
      });
      
      const totalHormiga = gastosHormiga.reduce((sum, g) => sum + parseFloat(g.monto), 0);
      
      // Calcular días en el período
      let dias = 30; // por defecto
      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
      }

      return new MetricasPrincipalesDTO({
        totalGastos,
        totalHormiga,
        promedioDiario: totalGastos / dias,
        transaccionesTotales: gastos.length
      });
    } catch (error) {
      throw new Error(`Error al obtener métricas: ${error.message}`);
    }
  }

  // Obtener alertas de gastos hormiga
  async getAlertasHormiga(limite = 10) {
    try {
      const gastosRecientes = await Gasto.findAll({
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['fecha', 'DESC']],
        limit: limite
      });

      const alertas = [];
      
      for (const gasto of gastosRecientes) {
        const esHormiga = gasto.categoria?.esGastoHormiga || 
                         gasto.tipoGasto === 'Hormiga' || 
                         parseFloat(gasto.monto) < 100;
        
        if (esHormiga) {
          let sugerencia = '';
          
          if (parseFloat(gasto.monto) < 5) {
            sugerencia = 'Considera si realmente necesitas este gasto diario.';
          } else if (parseFloat(gasto.monto) < 20) {
            sugerencia = 'Reduce la frecuencia de este gasto para ahorrar.';
          } else {
            sugerencia = 'Evalúa alternativas más económicas.';
          }
          
          alertas.push(new AlertaHormigaDTO({
            descripcion: gasto.descripcion,
            monto: parseFloat(gasto.monto),
            fecha: gasto.fecha,
            categoria: gasto.categoria?.nombre || 'Sin categoría',
            sugerencia
          }));
        }
      }
      
      return alertas;
    } catch (error) {
      throw new Error(`Error al obtener alertas: ${error.message}`);
    }
  }

  // Generar recomendaciones inteligentes
  async getRecomendaciones() {
    try {
      const recomendaciones = [];
      
      // Obtener últimos 30 días
      const fecha30Dias = new Date();
      fecha30Dias.setDate(fecha30Dias.getDate() - 30);
      
      const gastosRecientes = await Gasto.findAll({
        where: {
          fecha: {
            [Op.gte]: fecha30Dias.toISOString().split('T')[0]
          }
        },
        include: [{
          model: Categoria,
          as: 'categoria'
        }]
      });

      // Analizar gastos hormiga
      const gastosHormiga = gastosRecientes.filter(g => 
        g.categoria?.esGastoHormiga || g.tipoGasto === 'Hormiga'
      );
      
      if (gastosHormiga.length > 10) {
        const totalHormiga = gastosHormiga.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        recomendaciones.push(new RecomendacionDTO({
          titulo: '¡Demasiados gastos hormiga!',
          descripcion: `Has realizado ${gastosHormiga.length} gastos hormiga en el último mes, totalizando $${totalHormiga.toFixed(2)}.`,
          ahorroPotencial: totalHormiga * 0.5,
          prioridad: 'alta',
          accion: 'Identifica cuáles puedes eliminar o reducir'
        }));
      }

      // Analizar categoría más costosa
      const gastosPorCategoria = {};
      gastosRecientes.forEach(gasto => {
        const catNombre = gasto.categoria?.nombre || 'Sin categoría';
        if (!gastosPorCategoria[catNombre]) {
          gastosPorCategoria[catNombre] = 0;
        }
        gastosPorCategoria[catNombre] += parseFloat(gasto.monto);
      });
      
      let categoriaMax = '';
      let montoMax = 0;
      for (const [cat, monto] of Object.entries(gastosPorCategoria)) {
        if (monto > montoMax) {
          montoMax = monto;
          categoriaMax = cat;
        }
      }
      
      if (categoriaMax && montoMax > 0) {
        recomendaciones.push(new RecomendacionDTO({
          titulo: `Alto gasto en ${categoriaMax}`,
          descripcion: `Has gastado $${montoMax.toFixed(2)} en ${categoriaMax} durante el último mes.`,
          ahorroPotencial: montoMax * 0.3,
          prioridad: 'media',
          accion: `Revisa si puedes reducir gastos en ${categoriaMax}`
        }));
      }

      // Sugerencia de ahorro general
      const totalGastos = gastosRecientes.reduce((sum, g) => sum + parseFloat(g.monto), 0);
      if (totalGastos > 0) {
        recomendaciones.push(new RecomendacionDTO({
          titulo: 'Metas de ahorro',
          descripcion: `Si ahorras el 10% de tus gastos mensuales, tendrías $${(totalGastos * 0.1).toFixed(2)} en un año.`,
          ahorroPotencial: totalGastos * 0.1,
          prioridad: 'baja',
          accion: 'Configura una meta de ahorro mensual automática'
        }));
      }
      
      return recomendaciones;
    } catch (error) {
      throw new Error(`Error al generar recomendaciones: ${error.message}`);
    }
  }

  // Obtener tendencias mensuales
  async getTendencias(ultimosMeses = 6) {
    try {
      const tendencias = [];
      const hoy = new Date();
      
      for (let i = ultimosMeses - 1; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const year = fecha.getFullYear();
        const month = fecha.getMonth() + 1;
        
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
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
        
        const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        
        const gastosHormiga = gastos.filter(g => 
          g.categoria?.esGastoHormiga || g.tipoGasto === 'Hormiga'
        );
        const hormiga = gastosHormiga.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        
        // Calcular porcentaje de cambio respecto al mes anterior
        let porcentajeCambio = 0;
        if (tendencias.length > 0 && tendencias[tendencias.length - 1].totalGastos > 0) {
          const mesAnterior = tendencias[tendencias.length - 1];
          porcentajeCambio = ((total - mesAnterior.totalGastos) / mesAnterior.totalGastos) * 100;
        }
        
        tendencias.push({
          mes: `${year}-${month.toString().padStart(2, '0')}`,
          total,
          hormiga,
          cantidad: gastos.length,
          porcentajeCambio
        });
      }
      
      return tendencias.map(t => new TendenciaMensualDTO(t));
    } catch (error) {
      throw new Error(`Error al obtener tendencias: ${error.message}`);
    }
  }

  // Obtener top categorías
  async getTopCategorias(limite = 5, fechaInicio, fechaFin) {
    try {
      const where = {};
      
      if (fechaInicio && fechaFin) {
        where.fecha = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      }
      
      const gastos = await Gasto.findAll({
        where,
        include: [{
          model: Categoria,
          as: 'categoria'
        }]
      });
      
      const categoriasMap = {};
      const totalGeneral = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
      
      gastos.forEach(gasto => {
        const catNombre = gasto.categoria?.nombre || 'Sin categoría';
        const catIcono = gasto.categoria?.icono || '❓';
        
        if (!categoriasMap[catNombre]) {
          categoriasMap[catNombre] = {
            nombre: catNombre,
            total: 0,
            icono: catIcono
          };
        }
        categoriasMap[catNombre].total += parseFloat(gasto.monto);
      });
      
      const topCategorias = Object.values(categoriasMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, limite)
        .map(cat => new TopCategoriaDTO({
          nombre: cat.nombre,
          total: cat.total,
          porcentaje: totalGeneral > 0 ? (cat.total / totalGeneral) * 100 : 0,
          icono: cat.icono,
          tendencia: 'stable' // Por ahora fijo, se puede mejorar
        }));
      
      return topCategorias;
    } catch (error) {
      throw new Error(`Error al obtener top categorías: ${error.message}`);
    }
  }

  // Dashboard completo
  async getDashboardCompleto(periodo = 'mes') {
    try {
      let fechaInicio, fechaFin;
      const hoy = new Date();
      
      switch(periodo) {
        case 'semana':
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 7);
          fechaFin = hoy;
          break;
        case 'mes':
          fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          fechaFin = hoy;
          break;
        case 'trimestre':
          fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
          fechaFin = hoy;
          break;
        case 'año':
          fechaInicio = new Date(hoy.getFullYear(), 0, 1);
          fechaFin = hoy;
          break;
        default:
          fechaInicio = null;
          fechaFin = null;
      }
      
      const fechaInicioStr = fechaInicio ? fechaInicio.toISOString().split('T')[0] : null;
      const fechaFinStr = fechaFin ? fechaFin.toISOString().split('T')[0] : null;
      
      const [metricas, alertas, recomendaciones, tendencias, topCategorias] = await Promise.all([
        this.getMetricasPrincipales(fechaInicioStr, fechaFinStr),
        this.getAlertasHormiga(10),
        this.getRecomendaciones(),
        this.getTendencias(6),
        this.getTopCategorias(5, fechaInicioStr, fechaFinStr)
      ]);
      
      return {
        periodo,
        metricas,
        alertas: alertas.slice(0, 5),
        recomendaciones: recomendaciones.slice(0, 3),
        tendencias,
        topCategorias,
        actualizado: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error al obtener dashboard: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();
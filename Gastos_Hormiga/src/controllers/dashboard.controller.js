const dashboardService = require('../services/dashboard.service');

class DashboardController {
  
  // Obtener dashboard completo
  async getDashboard(req, res, next) {
    try {
      const { periodo = 'mes' } = req.query; // semana, mes, trimestre, año
      const dashboard = await dashboardService.getDashboardCompleto(periodo);
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener solo métricas principales
  async getMetricas(req, res, next) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const metricas = await dashboardService.getMetricasPrincipales(fechaInicio, fechaFin);
      
      res.json({
        success: true,
        data: metricas
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener alertas de gastos hormiga
  async getAlertas(req, res, next) {
    try {
      const { limite = 10 } = req.query;
      const alertas = await dashboardService.getAlertasHormiga(parseInt(limite));
      
      res.json({
        success: true,
        data: alertas,
        count: alertas.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener recomendaciones
  async getRecomendaciones(req, res, next) {
    try {
      const recomendaciones = await dashboardService.getRecomendaciones();
      
      res.json({
        success: true,
        data: recomendaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener tendencias mensuales
  async getTendencias(req, res, next) {
    try {
      const { meses = 6 } = req.query;
      const tendencias = await dashboardService.getTendencias(parseInt(meses));
      
      res.json({
        success: true,
        data: tendencias
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener top categorías
  async getTopCategorias(req, res, next) {
    try {
      const { limite = 5, fechaInicio, fechaFin } = req.query;
      const top = await dashboardService.getTopCategorias(parseInt(limite), fechaInicio, fechaFin);
      
      res.json({
        success: true,
        data: top
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
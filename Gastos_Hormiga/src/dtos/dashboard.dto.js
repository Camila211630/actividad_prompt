// DTO para métricas principales
class MetricasPrincipalesDTO {
  constructor({ totalGastos, totalHormiga, promedioDiario, transaccionesTotales }) {
    this.totalGastos = totalGastos || 0;
    this.totalGastosHormiga = totalHormiga || 0;
    this.porcentajeHormiga = totalGastos > 0 ? ((totalHormiga / totalGastos) * 100).toFixed(2) : 0;
    this.promedioDiario = promedioDiario || 0;
    this.transaccionesTotales = transaccionesTotales || 0;
  }
}

// DTO para alerta de gasto hormiga
class AlertaHormigaDTO {
  constructor({ descripcion, monto, fecha, categoria, sugerencia }) {
    this.descripcion = descripcion;
    this.monto = monto;
    this.fecha = fecha;
    this.categoria = categoria;
    this.sugerencia = sugerencia;
    this.nivel = this.calcularNivel(monto);
  }

  calcularNivel(monto) {
    if (monto < 5) return 'bajo';
    if (monto < 20) return 'medio';
    return 'alto';
  }
}

// DTO para recomendación
class RecomendacionDTO {
  constructor({ titulo, descripcion, ahorroPotencial, prioridad, accion }) {
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.ahorroPotencial = ahorroPotencial;
    this.prioridad = prioridad; // 'alta', 'media', 'baja'
    this.accion = accion;
    this.fechaGeneracion = new Date().toISOString();
  }
}

// DTO para tendencia mensual
class TendenciaMensualDTO {
  constructor({ mes, total, hormiga, cantidad, porcentajeCambio }) {
    this.mes = mes;
    this.totalGastos = total;
    this.gastosHormiga = hormiga;
    this.cantidadTransacciones = cantidad;
    this.porcentajeCambio = porcentajeCambio || 0;
  }
}

// DTO para categoría top
class TopCategoriaDTO {
  constructor({ nombre, total, porcentaje, icono, tendencia }) {
    this.nombre = nombre;
    this.total = total;
    this.porcentaje = porcentaje;
    this.icono = icono;
    this.tendencia = tendencia; // 'up', 'down', 'stable'
  }
}

module.exports = {
  MetricasPrincipalesDTO,
  AlertaHormigaDTO,
  RecomendacionDTO,
  TendenciaMensualDTO,
  TopCategoriaDTO
};
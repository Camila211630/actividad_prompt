// DTO para crear gasto
class CrearGastoDTO {
  constructor({ descripcion, monto, fecha, tipoGasto, moneda, notas, esRecurrente, categoriaId }) {
    this.descripcion = descripcion;
    this.monto = parseFloat(monto);
    this.fecha = fecha || new Date().toISOString().split('T')[0];
    this.tipoGasto = tipoGasto || 'Deseo';
    this.moneda = moneda || 'USD';
    this.notas = notas || null;
    this.esRecurrente = esRecurrente || false;
    this.categoriaId = parseInt(categoriaId);
  }
}

// DTO para actualizar gasto
class ActualizarGastoDTO {
  constructor({ descripcion, monto, fecha, tipoGasto, moneda, notas, esRecurrente, categoriaId }) {
    this.descripcion = descripcion;
    this.monto = monto ? parseFloat(monto) : undefined;
    this.fecha = fecha;
    this.tipoGasto = tipoGasto;
    this.moneda = moneda;
    this.notas = notas;
    this.esRecurrente = esRecurrente;
    this.categoriaId = categoriaId ? parseInt(categoriaId) : undefined;
  }
}

// DTO para respuesta
class GastoResponseDTO {
  constructor(gasto) {
    this.id = gasto.id;
    this.descripcion = gasto.descripcion;
    this.monto = parseFloat(gasto.monto);
    this.fecha = gasto.fecha;
    this.tipoGasto = gasto.tipoGasto;
    this.moneda = gasto.moneda;
    this.notas = gasto.notas;
    this.esRecurrente = gasto.esRecurrente;
    this.categoriaId = gasto.categoriaId;
    this.fechaCreacion = gasto.fechaCreacion;
    this.esGastoHormiga = this.calcularSiEsHormiga(gasto);
    
    // Incluir datos de la categoría si está cargada
    if (gasto.categoria) {
      this.categoria = {
        id: gasto.categoria.id,
        nombre: gasto.categoria.nombre,
        icono: gasto.categoria.icono,
        esGastoHormiga: gasto.categoria.esGastoHormiga
      };
    }
  }

  calcularSiEsHormiga(gasto) {
    // Un gasto es hormiga si:
    // 1. La categoría está marcada como gasto hormiga
    // 2. O el monto es menor a $100 USD (o equivalente flexible)
    // 3. O el tipo de gasto es 'Hormiga'
    
    if (gasto.categoria && gasto.categoria.esGastoHormiga) {
      return true;
    }
    
    if (gasto.tipoGasto === 'Hormiga') {
      return true;
    }
    
    if (parseFloat(gasto.monto) < 100 && gasto.moneda === 'USD') {
      return true;
    }
    
    return false;
  }
}

// DTO para filtros de búsqueda
class FiltrosGastoDTO {
  constructor({ fechaInicio, fechaFin, categoriaId, tipoGasto, minMonto, maxMonto, esRecurrente }) {
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.categoriaId = categoriaId ? parseInt(categoriaId) : undefined;
    this.tipoGasto = tipoGasto;
    this.minMonto = minMonto ? parseFloat(minMonto) : undefined;
    this.maxMonto = maxMonto ? parseFloat(maxMonto) : undefined;
    this.esRecurrente = esRecurrente === 'true' ? true : esRecurrente === 'false' ? false : undefined;
  }
}

module.exports = {
  CrearGastoDTO,
  ActualizarGastoDTO,
  GastoResponseDTO,
  FiltrosGastoDTO
};
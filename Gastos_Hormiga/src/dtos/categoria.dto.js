// DTO para crear categoría
class CrearCategoriaDTO {
  constructor({ nombre, descripcion, icono, esGastoHormiga }) {
    this.nombre = nombre;
    this.descripcion = descripcion || null;
    this.icono = icono || '💰';
    this.esGastoHormiga = esGastoHormiga || false;
  }
}

// DTO para actualizar categoría
class ActualizarCategoriaDTO {
  constructor({ nombre, descripcion, icono, esGastoHormiga, activo }) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.icono = icono;
    this.esGastoHormiga = esGastoHormiga;
    this.activo = activo;
  }
}

// DTO para respuesta
class CategoriaResponseDTO {
  constructor(categoria) {
    this.id = categoria.id;
    this.nombre = categoria.nombre;
    this.descripcion = categoria.descripcion;
    this.icono = categoria.icono;
    this.esGastoHormiga = categoria.esGastoHormiga;
    this.activo = categoria.activo;
    this.fechaCreacion = categoria.fechaCreacion;
  }
}

module.exports = {
  CrearCategoriaDTO,
  ActualizarCategoriaDTO,
  CategoriaResponseDTO
};
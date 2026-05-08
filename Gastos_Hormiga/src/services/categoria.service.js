const { Categoria } = require('../models');
const { CrearCategoriaDTO, ActualizarCategoriaDTO, CategoriaResponseDTO } = require('../dtos/categoria.dto');

class CategoriaService {
  
  // Obtener todas las categorías activas
  async findAll() {
    try {
      const categorias = await Categoria.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      return categorias.map(cat => new CategoriaResponseDTO(cat));
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  // Obtener todas las categorías (incluyendo inactivas)
  async findAllIncludingInactive() {
    try {
      const categorias = await Categoria.findAll({
        order: [['nombre', 'ASC']]
      });
      return categorias.map(cat => new CategoriaResponseDTO(cat));
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  // Obtener categoría por ID
  async findById(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }
      return new CategoriaResponseDTO(categoria);
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
  }

  // Obtener categorías hormiga
  async findGastosHormiga() {
    try {
      const categorias = await Categoria.findAll({
        where: { 
          esGastoHormiga: true,
          activo: true 
        },
        order: [['nombre', 'ASC']]
      });
      return categorias.map(cat => new CategoriaResponseDTO(cat));
    } catch (error) {
      throw new Error(`Error al obtener categorías hormiga: ${error.message}`);
    }
  }

  // Crear nueva categoría
  async create(crearCategoriaDTO) {
    try {
      // Validar que no exista una categoría con el mismo nombre
      const existing = await Categoria.findOne({
        where: { nombre: crearCategoriaDTO.nombre }
      });

      if (existing) {
        throw new Error('Ya existe una categoría con ese nombre');
      }

      const categoria = await Categoria.create({
        nombre: crearCategoriaDTO.nombre,
        descripcion: crearCategoriaDTO.descripcion,
        icono: crearCategoriaDTO.icono,
        esGastoHormiga: crearCategoriaDTO.esGastoHormiga
      });

      return new CategoriaResponseDTO(categoria);
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  // Actualizar categoría
  async update(id, actualizarCategoriaDTO) {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si el nuevo nombre ya existe en otra categoría
      if (actualizarCategoriaDTO.nombre && actualizarCategoriaDTO.nombre !== categoria.nombre) {
        const existing = await Categoria.findOne({
          where: { nombre: actualizarCategoriaDTO.nombre }
        });
        
        if (existing) {
          throw new Error('Ya existe otra categoría con ese nombre');
        }
      }

      // Actualizar solo los campos que vienen en el DTO
      if (actualizarCategoriaDTO.nombre !== undefined) categoria.nombre = actualizarCategoriaDTO.nombre;
      if (actualizarCategoriaDTO.descripcion !== undefined) categoria.descripcion = actualizarCategoriaDTO.descripcion;
      if (actualizarCategoriaDTO.icono !== undefined) categoria.icono = actualizarCategoriaDTO.icono;
      if (actualizarCategoriaDTO.esGastoHormiga !== undefined) categoria.esGastoHormiga = actualizarCategoriaDTO.esGastoHormiga;
      if (actualizarCategoriaDTO.activo !== undefined) categoria.activo = actualizarCategoriaDTO.activo;

      await categoria.save();

      return new CategoriaResponseDTO(categoria);
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  // Eliminar categoría (soft delete - solo desactivar)
  async delete(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si tiene gastos asociados
      const gastosCount = await categoria.countGastos();
      
      if (gastosCount > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${gastosCount} gastos asociados`);
      }

      // Soft delete: desactivar en lugar de eliminar
      categoria.activo = false;
      await categoria.save();

      return { message: 'Categoría desactivada exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }

  // Eliminar categoría físicamente (solo si no tiene gastos)
  async hardDelete(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      const gastosCount = await categoria.countGastos();
      
      if (gastosCount > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${gastosCount} gastos asociados`);
      }

      await categoria.destroy();
      return { message: 'Categoría eliminada permanentemente' };
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }
}

module.exports = new CategoriaService();
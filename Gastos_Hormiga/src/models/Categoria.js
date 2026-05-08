const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es requerido' },
      len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' }
    }
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  icono: {
    type: DataTypes.STRING(10),
    defaultValue: '💰',
    allowNull: false
  },
  esGastoHormiga: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'es_gasto_hormiga'  // Nombre en la base de datos con snake_case
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'categorias',
  timestamps: false  // No usar createdAt/updatedAt automáticos
});

module.exports = Categoria;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Categoria = require('./Categoria');

const Gasto = sequelize.define('Gasto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La descripción es requerida' },
      len: { args: [3, 200], msg: 'La descripción debe tener entre 3 y 200 caracteres' }
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: 'El monto debe ser mayor a 0' }
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipoGasto: {
    type: DataTypes.ENUM('Necesidad', 'Deseo', 'Ahorro', 'Hormiga'),
    defaultValue: 'Deseo',
    field: 'tipo_gasto'
  },
  moneda: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
    allowNull: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  esRecurrente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'es_recurrente'
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'gastos',
  timestamps: false
});

// Relación: Un Gasto pertenece a una Categoria
Gasto.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'categoria'
});

// Relación: Una Categoria tiene muchos Gastos
Categoria.hasMany(Gasto, {
  foreignKey: 'categoriaId',
  as: 'gastos'
});

module.exports = Gasto;
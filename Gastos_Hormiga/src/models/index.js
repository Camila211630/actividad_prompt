const Categoria = require('./Categoria');
const Gasto = require('./Gasto');

const syncModels = async (alter = false) => {
  try {
    await Categoria.sync({ alter });
    await Gasto.sync({ alter });
    console.log('✅ Tablas sincronizadas');
  } catch (error) {
    console.error('❌ Error al sincronizar:', error.message);
    throw error;
  }
};

module.exports = {
  Categoria,
  Gasto,
  syncModels
};
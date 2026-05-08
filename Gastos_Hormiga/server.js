const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API de Control de Gastos Hormiga`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

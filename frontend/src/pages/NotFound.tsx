import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="text-center py-16">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">La ruta que buscas no existe.</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700">
          Volver al Dashboard
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;

import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DashboardData, Periodo } from '../types';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import MetricsCard from '../components/dashboard/MetricsCard';
import TrendsChart from '../components/dashboard/TrendsChart';

const periodos: Periodo[] = ['semana', 'mes', 'trimestre', 'año'];

const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (selectedPeriodo: Periodo) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getDashboard(selectedPeriodo);
      setDashboard(data);
    } catch (err) {
      setError('No se pudo cargar el dashboard. Verifica la conexión con el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(periodo);
  }, [periodo]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Resumen financiero</p>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {periodos.map((item) => (
              <button
                key={item}
                onClick={() => setPeriodo(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  periodo === item
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <Loading message="Cargando dashboard..." />}
        {error && <Error message={error} onRetry={() => loadDashboard(periodo)} />}

        {dashboard && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricsCard title="Total Gastos" value={`$${dashboard.metricas.totalGastos.toFixed(2)}`} />
              <MetricsCard title="Gastos Hormiga" value={`$${dashboard.metricas.totalGastosHormiga.toFixed(2)}`} />
              <MetricsCard title="% Hormiga" value={`${Number(dashboard.metricas.porcentajeHormiga).toFixed(1)}%`} />
              <MetricsCard title="Promedio Diario" value={`$${dashboard.metricas.promedioDiario.toFixed(2)}`} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tendencias</h3>
                    <p className="text-sm text-gray-500">Vista por {periodo}</p>
                  </div>
                </div>
                <TrendsChart data={dashboard.tendencias} />
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categorías</h3>
                  <ul className="space-y-3">
                    {dashboard.topCategorias.map((item) => (
                      <li key={item.categoria} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-medium text-gray-900">{item.categoria}</p>
                          <p className="text-sm text-gray-500">{item.porcentaje.toFixed(1)}%</p>
                        </div>
                        <span className="text-gray-700 font-semibold">${item.total.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
                  <div className="space-y-3">
                    {dashboard.alertas.length ? (
                      dashboard.alertas.map((alerta) => (
                        <div key={alerta.id} className="rounded-xl border p-3 bg-red-50">
                          <p className="text-sm font-semibold text-red-700">{alerta.mensaje}</p>
                          <p className="text-xs text-red-600">{new Date(alerta.fecha).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay alertas recientes.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
              <div className="space-y-4">
                {dashboard.recomendaciones.map((item) => (
                  <div key={item.id} className="rounded-xl border p-4 bg-slate-50">
                    <p className="font-semibold text-gray-900">{item.titulo}</p>
                    <p className="text-sm text-gray-600">{item.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

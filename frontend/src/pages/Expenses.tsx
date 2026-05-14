import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import { apiService } from '../services/api';
import { Categoria, Gasto, GastoFilters, CrearGastoDTO } from '../types';

const GastoSchema = z.object({
  descripcion: z.string().min(3, 'Descripción mínima 3 caracteres'),
  monto: z.number().positive('Monto debe ser mayor a 0'),
  fecha: z.string().optional(),
  tipoGasto: z.enum(['Necesidad', 'Deseo', 'Ahorro', 'Hormiga']).optional(),
  moneda: z.string().optional(),
  notas: z.string().optional(),
  esRecurrente: z.boolean().optional(),
  categoriaId: z.number().min(1, 'Selecciona una categoría'),
});

type GastoFormValues = z.infer<typeof GastoSchema>;

const Expenses: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GastoFilters>({});

  const form = useForm<GastoFormValues>({
    resolver: zodResolver(GastoSchema),
    defaultValues: {
      descripcion: '',
      monto: 0,
      tipoGasto: 'Necesidad',
      moneda: 'USD',
      esRecurrente: false,
      categoriaId: 0,
    },
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [gastosData, categoriasData] = await Promise.all([
        apiService.getGastos(filters),
        apiService.getCategories(),
      ]);

      setGastos(gastosData);
      setCategorias(categoriasData.filter((categoria) => categoria.activo));
    } catch (err) {
      setError('No se pudo cargar los gastos. Revisa el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const filteredGastos = useMemo(() => {
    if (!filters.descripcion) {
      return gastos;
    }
    return gastos.filter((gasto) =>
      gasto.descripcion.toLowerCase().includes(filters.descripcion!.toLowerCase()),
    );
  }, [gastos, filters.descripcion]);

  const onSubmit = async (values: GastoFormValues) => {
    try {
      if (selectedGasto) {
        await apiService.updateGasto(selectedGasto.id, values);
      } else {
        const dto: CrearGastoDTO = values;
        await apiService.createGasto(dto);
      }
      form.reset({
        descripcion: '',
        monto: 0,
        tipoGasto: 'Necesidad',
        moneda: 'USD',
        esRecurrente: false,
        categoriaId: 0,
      });
      setSelectedGasto(null);
      await loadData();
    } catch (err) {
      setError('Error al guardar el gasto. Intenta nuevamente.');
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setSelectedGasto(gasto);
    form.reset({
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      fecha: gasto.fecha,
      tipoGasto: gasto.tipoGasto,
      moneda: gasto.moneda,
      notas: gasto.notas ?? '',
      esRecurrente: gasto.esRecurrente,
      categoriaId: gasto.categoriaId,
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      await apiService.deleteGasto(id);
      await loadData();
    } catch (err) {
      setError('No se pudo eliminar el gasto. Intenta de nuevo.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Administración de gastos</p>
            <h2 className="text-2xl font-semibold text-gray-900">Gastos</h2>
          </div>
        </div>

        {isLoading && <Loading message="Cargando gastos..." />}
        {error && <Error message={error} onRetry={() => loadData()} />}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">Lista de gastos</h3>
                <p className="text-sm text-gray-500">Filtra, busca y administra tus registros</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Buscar descripción"
                  value={filters.descripcion ?? ''}
                  onChange={(event) => setFilters((prev) => ({ ...prev, descripcion: event.target.value }))}
                  className="w-full rounded-2xl border-gray-200 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <select
                  value={filters.categoriaId ?? ''}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      categoriaId: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-2xl border-gray-200 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGastos.length > 0 ? (
                    filteredGastos.map((gasto) => (
                      <tr key={gasto.id}>
                        <td className="px-4 py-3 text-sm text-gray-700">{gasto.descripcion}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">${gasto.monto.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{new Date(gasto.fecha).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{gasto.categoria?.nombre ?? 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{gasto.tipoGasto}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(gasto)}
                            className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs hover:bg-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(gasto.id)}
                            className="px-3 py-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay gastos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedGasto ? 'Editar gasto' : 'Nuevo gasto'}</h3>
              <p className="text-sm text-gray-500">Completa el formulario para guardar un gasto.</p>
            </div>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  {...form.register('descripcion')}
                  className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {form.formState.errors.descripcion && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.descripcion.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('monto', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {form.formState.errors.monto && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.monto.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <input
                    type="date"
                    {...form.register('fecha')}
                    className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de gasto</label>
                  <select
                    {...form.register('tipoGasto')}
                    className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Necesidad">Necesidad</option>
                    <option value="Deseo">Deseo</option>
                    <option value="Ahorro">Ahorro</option>
                    <option value="Hormiga">Hormiga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moneda</label>
                  <select
                    {...form.register('moneda')}
                    className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  {...form.register('categoriaId', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={0}>Selecciona una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {form.formState.errors.categoriaId && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.categoriaId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                  rows={3}
                  {...form.register('notas')}
                  className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...form.register('esRecurrente')}
                  id="recurrente"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="recurrente" className="text-sm text-gray-700">Gasto recurrente</label>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-white text-sm font-medium hover:bg-blue-700"
                >
                  {selectedGasto ? 'Actualizar gasto' : 'Crear gasto'}
                </button>
                {selectedGasto && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGasto(null);
                      form.reset({
                        descripcion: '',
                        monto: 0,
                        tipoGasto: 'Necesidad',
                        moneda: 'USD',
                        esRecurrente: false,
                        categoriaId: 0,
                      });
                    }}
                    className="inline-flex justify-center rounded-2xl bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Expenses;

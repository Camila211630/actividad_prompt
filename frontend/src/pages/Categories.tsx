import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import { apiService } from '../services/api';
import { Categoria } from '../types';

const CategoriaSchema = z.object({
  nombre: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  esGastoHormiga: z.boolean().optional(),
});

type CategoriaFormValues = z.infer<typeof CategoriaSchema>;

const Categories: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(CategoriaSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      icono: '💰',
      esGastoHormiga: false,
    },
  });

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getCategories(true);
      setCategorias(data);
    } catch (err) {
      setError('No se pudieron cargar las categorías. Revisa el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSubmit = async (values: CategoriaFormValues) => {
    try {
      if (selectedCategoria) {
        await apiService.updateCategory(selectedCategoria.id, values);
      } else {
        await apiService.createCategory(values);
      }
      await loadCategories();
      setSelectedCategoria(null);
      form.reset({ nombre: '', descripcion: '', icono: '💰', esGastoHormiga: false });
    } catch (err) {
      setError('Error al guardar la categoría. Intenta nuevamente.');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    form.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
      icono: categoria.icono,
      esGastoHormiga: categoria.esGastoHormiga,
    });
  };

  const handleDelete = async (categoria: Categoria) => {
    const confirmDelete = window.confirm(`¿Eliminar la categoría ${categoria.nombre}?`);
    if (!confirmDelete) return;
    try {
      await apiService.deleteCategory(categoria.id);
      await loadCategories();
    } catch (err) {
      setError('No se pudo eliminar la categoría. Intenta de nuevo.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Gestión de categorías</p>
            <h2 className="text-2xl font-semibold text-gray-900">Categorías</h2>
          </div>
        </div>

        {isLoading && <Loading message="Cargando categorías..." />}
        {error && <Error message={error} onRetry={loadCategories} />}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías existentes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Icono</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hormiga</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td className="px-4 py-3 text-sm">{categoria.icono}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{categoria.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{categoria.esGastoHormiga ? 'Sí' : 'No'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{categoria.activo ? 'Activo' : 'Inactivo'}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(categoria)}
                          className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(categoria)}
                          className="px-3 py-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedCategoria ? 'Editar categoría' : 'Nueva categoría'}</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  {...form.register('nombre')}
                  className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {form.formState.errors.nombre && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.nombre.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  rows={3}
                  {...form.register('descripcion')}
                  className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Icono</label>
                <input
                  type="text"
                  {...form.register('icono')}
                  className="mt-1 block w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="esGastoHormiga"
                  type="checkbox"
                  {...form.register('esGastoHormiga')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="esGastoHormiga" className="text-sm text-gray-700">Es gasto hormiga</label>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-white text-sm font-medium hover:bg-blue-700"
                >
                  {selectedCategoria ? 'Actualizar categoría' : 'Crear categoría'}
                </button>
                {selectedCategoria && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoria(null);
                      form.reset({ nombre: '', descripcion: '', icono: '💰', esGastoHormiga: false });
                    }}
                    className="inline-flex justify-center rounded-2xl bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    Cancelar
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

export default Categories;

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Categoria,
  Gasto,
  DashboardData,
  CrearCategoriaDTO,
  ActualizarCategoriaDTO,
  CrearGastoDTO,
  ActualizarGastoDTO,
  ApiResponse,
  GastoFilters,
  Periodo
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptors para manejo de errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<AxiosResponse> {
    return this.api.get('/health');
  }

  async dbCheck(): Promise<AxiosResponse> {
    return this.api.get('/db-check');
  }

  // Categories
  async getCategories(includeInactive = false): Promise<Categoria[]> {
    const response = await this.api.get<ApiResponse<Categoria[]>>('/categorias', {
      params: { includeInactive }
    });
    return response.data.data;
  }

  async getHormigaCategories(): Promise<Categoria[]> {
    const response = await this.api.get<ApiResponse<Categoria[]>>('/categorias/hormiga');
    return response.data.data;
  }

  async getCategory(id: number): Promise<Categoria> {
    const response = await this.api.get<ApiResponse<Categoria>>(`/categorias/${id}`);
    return response.data.data;
  }

  async createCategory(data: CrearCategoriaDTO): Promise<Categoria> {
    const response = await this.api.post<ApiResponse<Categoria>>('/categorias', data);
    return response.data.data;
  }

  async updateCategory(id: number, data: ActualizarCategoriaDTO): Promise<Categoria> {
    const response = await this.api.put<ApiResponse<Categoria>>(`/categorias/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categorias/${id}`);
  }

  // Gastos
  async getGastos(filters?: GastoFilters): Promise<Gasto[]> {
    const response = await this.api.get<ApiResponse<Gasto[]>>('/gastos', {
      params: filters
    });
    return response.data.data;
  }

  async getHormigaGastos(): Promise<Gasto[]> {
    const response = await this.api.get<ApiResponse<Gasto[]>>('/gastos/hormiga');
    return response.data.data;
  }

  async getGastoResumen(year: number, month: number): Promise<any> {
    const response = await this.api.get(`/gastos/resumen/${year}/${month}`);
    return response.data.data;
  }

  async getGasto(id: number): Promise<Gasto> {
    const response = await this.api.get<ApiResponse<Gasto>>(`/gastos/${id}`);
    return response.data.data;
  }

  async createGasto(data: CrearGastoDTO): Promise<Gasto> {
    const response = await this.api.post<ApiResponse<Gasto>>('/gastos', data);
    return response.data.data;
  }

  async updateGasto(id: number, data: ActualizarGastoDTO): Promise<Gasto> {
    const response = await this.api.put<ApiResponse<Gasto>>(`/gastos/${id}`, data);
    return response.data.data;
  }

  async deleteGasto(id: number): Promise<void> {
    await this.api.delete(`/gastos/${id}`);
  }

  // Dashboard
  async getDashboard(periodo: Periodo = 'mes'): Promise<DashboardData> {
    const response = await this.api.get<ApiResponse<DashboardData>>('/dashboard', {
      params: { periodo }
    });
    return response.data.data;
  }

  async getDashboardMetrics(fechaInicio?: string, fechaFin?: string): Promise<any> {
    const response = await this.api.get('/dashboard/metricas', {
      params: { fechaInicio, fechaFin }
    });
    return response.data.data;
  }

  async getDashboardAlertas(limite = 10): Promise<any[]> {
    const response = await this.api.get('/dashboard/alertas', {
      params: { limite }
    });
    return response.data.data;
  }

  async getDashboardRecomendaciones(): Promise<any[]> {
    const response = await this.api.get('/dashboard/recomendaciones');
    return response.data.data;
  }

  async getDashboardTendencias(meses = 6): Promise<any[]> {
    const response = await this.api.get('/dashboard/tendencias', {
      params: { meses }
    });
    return response.data.data;
  }

  async getDashboardTopCategorias(limite?: number, fechaInicio?: string, fechaFin?: string): Promise<any[]> {
    const response = await this.api.get('/dashboard/top-categorias', {
      params: { limite, fechaInicio, fechaFin }
    });
    return response.data.data;
  }
}

export const apiService = new ApiService();
export default apiService;
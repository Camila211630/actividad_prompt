// Tipos basados en los DTOs del backend

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  icono: string;
  esGastoHormiga: boolean;
  activo: boolean;
  fechaCreacion: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  tipoGasto: 'Necesidad' | 'Deseo' | 'Ahorro' | 'Hormiga';
  moneda: string;
  notas?: string;
  esRecurrente: boolean;
  categoriaId: number;
  fechaCreacion: string;
  esGastoHormiga: boolean;
  categoria?: Categoria;
}

export interface DashboardMetrics {
  totalGastos: number;
  totalGastosHormiga: number;
  porcentajeHormiga: number;
  promedioDiario: number;
  transaccionesTotales: number;
}

export interface DashboardTendencia {
  mes: string;
  total: number;
  hormiga: number;
}

export interface DashboardTopCategoria {
  categoria: string;
  total: number;
  porcentaje: number;
}

export interface DashboardAlerta {
  id: number;
  mensaje: string;
  tipo: 'advertencia' | 'error' | 'info';
  fecha: string;
}

export interface DashboardRecomendacion {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta';
}

export interface DashboardData {
  metricas: DashboardMetrics;
  tendencias: DashboardTendencia[];
  topCategorias: DashboardTopCategoria[];
  alertas: DashboardAlerta[];
  recomendaciones: DashboardRecomendacion[];
}

// DTOs para requests
export interface CrearCategoriaDTO {
  nombre: string;
  descripcion?: string;
  icono?: string;
  esGastoHormiga?: boolean;
}

export interface ActualizarCategoriaDTO extends Partial<CrearCategoriaDTO> {}

export interface CrearGastoDTO {
  descripcion: string;
  monto: number;
  fecha?: string;
  tipoGasto?: Gasto['tipoGasto'];
  moneda?: string;
  notas?: string;
  esRecurrente?: boolean;
  categoriaId: number;
}

export interface ActualizarGastoDTO extends Partial<CrearGastoDTO> {}

// Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Filtros para gastos
export interface GastoFilters {
  fechaInicio?: string;
  fechaFin?: string;
  categoriaId?: number;
  tipoGasto?: Gasto['tipoGasto'];
  minMonto?: number;
  maxMonto?: number;
  esRecurrente?: boolean;
}

// Periodos para dashboard
export type Periodo = 'semana' | 'mes' | 'trimestre' | 'año';
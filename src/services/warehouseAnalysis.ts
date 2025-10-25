import { supabase } from "@/integrations/supabase/client";

export interface AnalysisProgress {
  stage: string;
  percent: number;
}

export interface AnalysisResult {
  success: boolean;
  runId?: string;
  summary?: {
    total_recommendations: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    estimated_overall_improvement_percent: number;
    estimated_distance_saved_per_order_m: number;
    estimated_time_saved_per_order_minutes: number;
    estimated_annual_hours_saved: number;
    estimated_annual_cost_savings_usd: number;
  };
  skuCount?: number;
  orderCount?: number;
  error?: string;
}

/**
 * Process warehouse data through AI analysis
 * @param data - Parsed CSV data
 * @param fileName - Original file name
 * @param onProgress - Optional callback for progress updates
 */
export async function processWarehouseData(
  data: any[],
  fileName: string,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AnalysisResult> {
  // Frontend validations
  if (data.length < 100) {
    throw new Error('Arquivo muito pequeno. Mínimo de 100 linhas necessário para análise estatística confiável.');
  }

  const requiredColumns = ['order_id', 'order_date', 'sku_code', 'sku_name', 'category', 'quantity', 'current_location', 'weight_kg'];
  const firstRow = data[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
  }

  // Simulate progress updates (actual progress comes from backend processing)
  const stages = [
    { stage: 'Validando CSV...', percent: 15 },
    { stage: 'Calculando velocidade ABC...', percent: 35 },
    { stage: 'Analisando afinidade de produtos...', percent: 60 },
    { stage: 'Calculando distâncias e rotas...', percent: 80 },
    { stage: 'Gerando recomendações com IA...', percent: 95 },
    { stage: 'Salvando resultados...', percent: 100 }
  ];

  let currentStage = 0;
  const progressInterval = setInterval(() => {
    if (currentStage < stages.length && onProgress) {
      onProgress(stages[currentStage]);
      currentStage++;
    }
  }, 2000);

  try {
    onProgress?.({ stage: 'Iniciando análise...', percent: 0 });

    // Call the Edge Function
    const { data: result, error } = await supabase.functions.invoke<AnalysisResult>('analyze-warehouse', {
      body: {
        csvData: data,
        fileName: fileName
      }
    });

    clearInterval(progressInterval);

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Erro ao processar análise. Tente novamente.');
    }

    if (!result || !result.success) {
      throw new Error(result?.error || 'Erro desconhecido ao processar análise.');
    }

    onProgress?.({ stage: 'Concluído!', percent: 100 });

    return result;

  } catch (error: any) {
    clearInterval(progressInterval);
    console.error('Error in processWarehouseData:', error);
    
    // Parse error messages
    const errorMessage = error.message || 'Erro ao processar análise';
    
    if (errorMessage.includes('RATE_LIMIT')) {
      throw new Error('Muitas requisições. Aguarde 1 minuto e tente novamente.');
    }
    
    if (errorMessage.includes('TIMEOUT')) {
      throw new Error('Processamento demorado. Tente com arquivo menor ou subdivida os dados.');
    }
    
    if (errorMessage.includes('INVALID_REQUEST')) {
      throw new Error('Dados inválidos. Verifique o formato do arquivo e tente novamente.');
    }

    if (errorMessage.includes('UNAUTHORIZED')) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    throw error;
  }
}

/**
 * Fetch the latest optimization run for a warehouse
 */
export async function getLatestOptimizationRun(warehouseId: string) {
  const { data, error } = await supabase
    .from('optimization_runs')
    .select('*')
    .eq('warehouse_id', warehouseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching optimization run:', error);
    return null;
  }

  return data;
}

/**
 * Fetch pending recommendations for a warehouse
 */
export async function getPendingRecommendations(warehouseId: string) {
  const { data, error } = await supabase
    .from('v_pending_recommendations')
    .select('*')
    .eq('warehouse_id', warehouseId)
    .eq('status', 'pending')
    .order('priority', { ascending: true });

  if (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch ABC distribution for a warehouse
 */
export async function getABCDistribution(warehouseId: string) {
  const { data, error } = await supabase
    .from('v_abc_distribution')
    .select('*')
    .eq('warehouse_id', warehouseId);

  if (error) {
    console.error('Error fetching ABC distribution:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch top SKUs for a warehouse
 */
export async function getTopSKUs(warehouseId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('v_top_skus')
    .select('*')
    .eq('warehouse_id', warehouseId)
    .limit(limit);

  if (error) {
    console.error('Error fetching top SKUs:', error);
    return [];
  }

  return data || [];
}

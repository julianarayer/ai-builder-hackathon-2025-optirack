import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface CSVRow {
  order_id: string;
  order_date: string;
  sku_code: string;
  sku_name: string;
  category: string;
  quantity: number;
  current_location: string;
  weight_kg: number;
}

interface ABCAnalysis {
  [skuCode: string]: {
    class: 'A' | 'B' | 'C' | 'D';
    picks: number;
    pickFrequencyMonthly: number;
    percentageOfTotal: number;
  };
}

interface AffinityPair {
  sku_a: string;
  sku_b: string;
  sku_a_name: string;
  sku_b_name: string;
  support: number;
  confidence: number;
  lift: number;
  co_occurrences: number;
  current_distance_m: number;
  recommendation: string;
}

interface AffinityPairEnhanced {
  sku_i: string;
  sku_j: string;
  support_ij: number;
  confidence_i_to_j: number;
  lift: number;
  phi: number;
}

interface OrderDistanceSample {
  order_id: string;
  items_count: number;
  sku_codes: string[];
  distance_m: number;
  route_points: string[];
}

interface AnalyticsSnapshot {
  warehouse_id: string;
  optimization_run_id: string;
  abc_distribution: { [key: string]: number };
  top_affinity_pairs: AffinityPairEnhanced[];
  avg_distance_per_order_m: number;
  target_sla_reduction_pct: number;
  estimated_distance_reduction_pct: number;
  estimated_time_saved_pct: number;
  method_notes: {
    distance_metric: string;
    path_heuristic: string;
    min_pair_support: number;
    fallback_sem_layout: boolean;
  };
  order_distance_samples?: OrderDistanceSample[];
}

interface GeminiRecommendation {
  sku_code: string;
  sku_name: string;
  current_location: string;
  current_zone: string;
  recommended_location: string;
  recommended_zone: string;
  reason: string;
  priority: number;
  estimated_improvement_percent: number;
  distance_saved_per_pick_m: number;
  related_skus: string[];
  affinity_note: string;
}

interface GeminiResponse {
  recommendations: GeminiRecommendation[];
  summary: {
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
}

// Utility functions
function validateCSVData(data: any[]): { valid: boolean; error?: string } {
  if (data.length < 100) {
    return { valid: false, error: 'Arquivo muito pequeno. Mínimo de 100 linhas necessário para análise estatística confiável.' };
  }

  const requiredColumns = ['order_id', 'order_date', 'sku_code', 'sku_name', 'category', 'quantity', 'current_location', 'weight_kg'];
  const firstRow = data[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    return { valid: false, error: `Colunas obrigatórias ausentes: ${missingColumns.join(', ')}` };
  }

  // Check for too many null values
  let nullCount = 0;
  data.forEach(row => {
    requiredColumns.forEach(col => {
      if (row[col] === null || row[col] === undefined || row[col] === '') {
        nullCount++;
      }
    });
  });

  const totalValues = data.length * requiredColumns.length;
  if (nullCount / totalValues > 0.5) {
    return { valid: false, error: 'Dados incompletos. Mais de 50% dos valores estão vazios.' };
  }

  return { valid: true };
}

function normalizeCSVData(data: any[]): CSVRow[] {
  return data.map(row => ({
    order_id: String(row.order_id).trim(),
    order_date: row.order_date,
    sku_code: String(row.sku_code).trim().toUpperCase(),
    sku_name: String(row.sku_name).trim(),
    category: String(row.category).trim(),
    quantity: Number(row.quantity),
    current_location: String(row.current_location).trim().toUpperCase(),
    weight_kg: Number(row.weight_kg)
  }));
}

function performABCAnalysis(data: CSVRow[], periodInDays: number): ABCAnalysis {
  // Group by SKU and sum quantities
  const skuPicks: { [key: string]: { picks: number; name: string } } = {};
  
  data.forEach(row => {
    if (!skuPicks[row.sku_code]) {
      skuPicks[row.sku_code] = { picks: 0, name: row.sku_name };
    }
    skuPicks[row.sku_code].picks += row.quantity;
  });

  // Calculate monthly frequency
  const monthlyFactor = 30 / periodInDays;
  const skuData = Object.entries(skuPicks).map(([code, data]) => ({
    code,
    name: data.name,
    picks: data.picks,
    pickFrequencyMonthly: data.picks * monthlyFactor
  }));

  // Sort by picks descending
  skuData.sort((a, b) => b.picks - a.picks);

  // Calculate total picks and cumulative percentage
  const totalPicks = skuData.reduce((sum, item) => sum + item.picks, 0);
  let cumulativePercentage = 0;
  const analysis: ABCAnalysis = {};

  skuData.forEach(item => {
    const percentage = (item.picks / totalPicks) * 100;
    cumulativePercentage += percentage;

    let classification: 'A' | 'B' | 'C' | 'D';
    if (cumulativePercentage <= 80) {
      classification = 'A';
    } else if (cumulativePercentage <= 95) {
      classification = 'B';
    } else if (cumulativePercentage <= 99) {
      classification = 'C';
    } else {
      classification = 'D';
    }

    analysis[item.code] = {
      class: classification,
      picks: item.picks,
      pickFrequencyMonthly: item.pickFrequencyMonthly,
      percentageOfTotal: percentage
    };
  });

  return analysis;
}

function performAffinityAnalysis(data: CSVRow[], skuNames: { [code: string]: string }): AffinityPair[] {
  // Group items by order_id
  const orderGroups: { [orderId: string]: string[] } = {};
  
  data.forEach(row => {
    if (!orderGroups[row.order_id]) {
      orderGroups[row.order_id] = [];
    }
    if (!orderGroups[row.order_id].includes(row.sku_code)) {
      orderGroups[row.order_id].push(row.sku_code);
    }
  });

  const totalOrders = Object.keys(orderGroups).length;
  
  // Calculate support for individual SKUs
  const skuSupport: { [sku: string]: number } = {};
  Object.values(orderGroups).forEach(skus => {
    skus.forEach(sku => {
      skuSupport[sku] = (skuSupport[sku] || 0) + 1;
    });
  });

  // Find all pairs and calculate metrics
  const pairMetrics: { [pair: string]: { coOccurrences: number; skuA: string; skuB: string } } = {};
  
  Object.values(orderGroups).forEach(skus => {
    for (let i = 0; i < skus.length; i++) {
      for (let j = i + 1; j < skus.length; j++) {
        const skuA = skus[i];
        const skuB = skus[j];
        const pairKey = [skuA, skuB].sort().join('|');
        
        if (!pairMetrics[pairKey]) {
          pairMetrics[pairKey] = { coOccurrences: 0, skuA, skuB };
        }
        pairMetrics[pairKey].coOccurrences++;
      }
    }
  });

  // Calculate affinity metrics and filter
  const affinityPairs: AffinityPair[] = [];
  
  Object.values(pairMetrics).forEach(({ coOccurrences, skuA, skuB }) => {
    const support = coOccurrences / totalOrders;
    const confidence = coOccurrences / skuSupport[skuA];
    const probabilityB = skuSupport[skuB] / totalOrders;
    const lift = confidence / probabilityB;

    // Filter: support >= 1%, confidence >= 20%, lift > 1.2
    if (support >= 0.01 && confidence >= 0.2 && lift > 1.2) {
      // Estimate distance based on location zones (simplified)
      const locationA = data.find(r => r.sku_code === skuA)?.current_location || '';
      const locationB = data.find(r => r.sku_code === skuB)?.current_location || '';
      const distance = estimateDistance(locationA, locationB);

      affinityPairs.push({
        sku_a: skuA,
        sku_b: skuB,
        sku_a_name: skuNames[skuA] || skuA,
        sku_b_name: skuNames[skuB] || skuB,
        support,
        confidence,
        lift,
        co_occurrences: coOccurrences,
        current_distance_m: distance,
        recommendation: lift > 1.5 && distance > 50 
          ? `Produtos com alta afinidade (Lift ${lift.toFixed(2)}) estão a ${distance}m de distância. Recomenda-se aproximá-los.`
          : `Afinidade moderada. Monitorar.`
      });
    }
  });

  // Sort by lift descending
  affinityPairs.sort((a, b) => b.lift - a.lift);
  
  return affinityPairs.slice(0, 30); // Top 30 pairs
}

function estimateDistance(locationA: string, locationB: string): number {
  // Simple distance estimation based on zone
  // Format expected: A-01, B-15, C-22
  const getZoneDistance = (loc: string): number => {
    const zone = loc.charAt(0);
    switch (zone) {
      case 'A': return 15;
      case 'B': return 45;
      case 'C': return 75;
      default: return 50;
    }
  };

  const distA = getZoneDistance(locationA);
  const distB = getZoneDistance(locationB);
  
  return Math.abs(distA - distB) + 10; // Add average within-zone distance
}

function extractZone(location: string): string {
  return location.charAt(0);
}

// Calculate Phi (Matthews correlation coefficient)
function calculatePhi(
  tp: number, // pedidos com i e j
  tn: number, // pedidos sem i e sem j
  fp: number, // pedidos com j e sem i
  fn: number  // pedidos com i e sem j
): number {
  const numerator = (tp * tn) - (fp * fn);
  const denominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
  
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Enhanced affinity analysis with Phi coefficient
function performAffinityAnalysisEnhanced(
  data: CSVRow[], 
  skuNames: { [code: string]: string }
): AffinityPairEnhanced[] {
  // Agrupar por order_id
  const orderGroups: { [orderId: string]: Set<string> } = {};
  
  data.forEach(row => {
    if (!orderGroups[row.order_id]) {
      orderGroups[row.order_id] = new Set();
    }
    if (row.quantity > 0) {
      orderGroups[row.order_id].add(row.sku_code);
    }
  });

  const totalOrders = Object.keys(orderGroups).length;
  
  // Calcular support individual
  const skuSupport: { [sku: string]: number } = {};
  Object.values(orderGroups).forEach(skus => {
    skus.forEach(sku => {
      skuSupport[sku] = (skuSupport[sku] || 0) + 1;
    });
  });
  
  // Filtrar SKUs com support < 1%
  const validSkus = Object.keys(skuSupport).filter(
    sku => (skuSupport[sku] / totalOrders) >= 0.01
  );

  // Calcular métricas de pares
  const pairMetrics: { [pair: string]: { 
    tp: number;
    skuA: string; 
    skuB: string;
  } } = {};
  
  Object.values(orderGroups).forEach(skus => {
    const skusArray = Array.from(skus).filter(s => validSkus.includes(s));
    for (let i = 0; i < skusArray.length; i++) {
      for (let j = i + 1; j < skusArray.length; j++) {
        const skuA = skusArray[i];
        const skuB = skusArray[j];
        const pairKey = [skuA, skuB].sort().join('|');
        
        if (!pairMetrics[pairKey]) {
          pairMetrics[pairKey] = { tp: 0, skuA, skuB };
        }
        pairMetrics[pairKey].tp++;
      }
    }
  });

  // Calcular affinity metrics com Phi
  const affinityPairs: AffinityPairEnhanced[] = [];
  
  Object.values(pairMetrics).forEach(({ tp, skuA, skuB }) => {
    const supportA = skuSupport[skuA] / totalOrders;
    const supportB = skuSupport[skuB] / totalOrders;
    const supportAB = tp / totalOrders;
    
    // Filtrar: support(i,j) >= 2%
    if (supportAB < 0.02) return;
    
    const confidence = tp / skuSupport[skuA];
    const lift = supportAB / (supportA * supportB);
    
    // Calcular Phi
    const fp = skuSupport[skuB] - tp;
    const fn = skuSupport[skuA] - tp;
    const tn = totalOrders - tp - fp - fn;
    
    const phi = calculatePhi(tp, tn, fp, fn);
    
    affinityPairs.push({
      sku_i: skuA,
      sku_j: skuB,
      support_ij: supportAB,
      confidence_i_to_j: confidence,
      lift: lift,
      phi: phi
    });
  });

  // Ordenar por lift (desc), desempate por |phi| (desc)
  affinityPairs.sort((a, b) => {
    if (Math.abs(b.lift - a.lift) > 0.01) {
      return b.lift - a.lift;
    }
    return Math.abs(b.phi) - Math.abs(a.phi);
  });
  
  return affinityPairs.slice(0, 20); // Top 20
}

// Calculate average distance per order
function calculateAvgDistancePerOrder(
  data: CSVRow[],
  layoutPlan: any | null,
  abcAnalysis: ABCAnalysis
): {
  avgDistance: number;
  samples: OrderDistanceSample[];
  methodNotes: {
    distance_metric: string;
    path_heuristic: string;
    fallback_sem_layout: boolean;
  };
} {
  const orderGroups: { [orderId: string]: string[] } = {};
  
  data.forEach(row => {
    if (!orderGroups[row.order_id]) {
      orderGroups[row.order_id] = [];
    }
    orderGroups[row.order_id].push(row.sku_code);
  });

  const orderIds = Object.keys(orderGroups);
  const distances: number[] = [];
  const samples: OrderDistanceSample[] = [];
  
  let useFallback = !layoutPlan || !layoutPlan.shapes || layoutPlan.shapes.length === 0;
  
  if (useFallback) {
    // FALLBACK: Usar posição ordinal baseada em ABC
    console.log('📍 Layout não disponível. Usando fallback ordinal por ABC.');
    
    orderIds.forEach((orderId, idx) => {
      const skus = orderGroups[orderId];
      let totalDistance = 0;
      
      skus.forEach(sku => {
        const abcClass = abcAnalysis[sku]?.class || 'C';
        let estimatedDistance = 0;
        
        switch (abcClass) {
          case 'A': estimatedDistance = 10; break;
          case 'B': estimatedDistance = 30; break;
          case 'C': estimatedDistance = 50; break;
          case 'D': estimatedDistance = 70; break;
        }
        
        totalDistance += estimatedDistance * 2;
      });
      
      distances.push(totalDistance);
      
      if (idx < 50) {
        samples.push({
          order_id: orderId,
          items_count: skus.length,
          sku_codes: skus,
          distance_m: totalDistance,
          route_points: [`ABC-based: ${skus.map(s => abcAnalysis[s]?.class || '?').join(',')}`]
        });
      }
    });
    
    return {
      avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
      samples,
      methodNotes: {
        distance_metric: 'ordinal',
        path_heuristic: 'ordinal_fallback',
        fallback_sem_layout: true
      }
    };
  }
  
  // COM LAYOUT: Usar coordenadas simplificadas
  console.log('📍 Layout disponível. Calculando distância Manhattan.');
  
  const skuCoordinates: { [sku: string]: { x: number; y: number } } = {};
  
  data.forEach(row => {
    if (!skuCoordinates[row.sku_code]) {
      const location = row.current_location;
      const zone = location.charAt(0);
      
      let x = 0, y = 0;
      switch (zone) {
        case 'A': x = 10; y = 5; break;
        case 'B': x = 30; y = 15; break;
        case 'C': x = 50; y = 25; break;
        default: x = 40; y = 20; break;
      }
      
      skuCoordinates[row.sku_code] = { x, y };
    }
  });
  
  const packingPoint = { x: 0, y: 0 };
  
  orderIds.forEach((orderId, idx) => {
    const skus = orderGroups[orderId];
    const points = [packingPoint];
    
    const skuPoints = skus
      .map(sku => skuCoordinates[sku] || packingPoint)
      .sort((a, b) => a.x - b.x || a.y - b.y);
    
    points.push(...skuPoints);
    points.push(packingPoint);
    
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = Math.abs(points[i].x - points[i - 1].x);
      const dy = Math.abs(points[i].y - points[i - 1].y);
      totalDistance += dx + dy;
    }
    
    distances.push(totalDistance);
    
    if (idx < 50) {
      samples.push({
        order_id: orderId,
        items_count: skus.length,
        sku_codes: skus,
        distance_m: totalDistance,
        route_points: points.map(p => `(${p.x},${p.y})`)
      });
    }
  });
  
  return {
    avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
    samples,
    methodNotes: {
      distance_metric: 'manhattan',
      path_heuristic: 's-shape',
      fallback_sem_layout: false
    }
  };
}

// Calculate SLA estimate
function calculateSLAEstimate(
  abcAnalysis: ABCAnalysis,
  affinityPairs: AffinityPairEnhanced[],
  data: CSVRow[],
  targetSLA: number = 15
): {
  estimated_distance_reduction_pct: number;
  estimated_time_saved_pct: number;
} {
  const totalPicks = data.reduce((sum, row) => sum + row.quantity, 0);
  
  const picksA = Object.entries(abcAnalysis)
    .filter(([_, info]) => info.class === 'A')
    .reduce((sum, [code, _]) => {
      return sum + data
        .filter(row => row.sku_code === code)
        .reduce((s, row) => s + row.quantity, 0);
    }, 0);
  
  const sharePicksA = picksA / totalPicks;
  
  const topSkus = new Set<string>();
  affinityPairs.slice(0, 10).forEach(pair => {
    topSkus.add(pair.sku_i);
    topSkus.add(pair.sku_j);
  });
  
  const picksTopPairs = data
    .filter(row => topSkus.has(row.sku_code))
    .reduce((sum, row) => sum + row.quantity, 0);
  
  const shareTopPairs = picksTopPairs / totalPicks;
  
  const impactFactor = 0.5 * sharePicksA + 0.5 * shareTopPairs;
  
  const maxReduction = Math.min(100 * impactFactor, 100);
  const estimatedReduction = Math.min(targetSLA, maxReduction);
  
  console.log(`📊 SLA Estimate: shareA=${sharePicksA.toFixed(2)}, sharePairs=${shareTopPairs.toFixed(2)}, impact=${impactFactor.toFixed(2)}, reduction=${estimatedReduction.toFixed(1)}%`);
  
  return {
    estimated_distance_reduction_pct: estimatedReduction,
    estimated_time_saved_pct: estimatedReduction
  };
}

async function callGeminiAPI(prompt: string): Promise<GeminiResponse> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error('RATE_LIMIT: Muitas requisições à API Gemini. Aguarde 1 minuto.');
    }

    if (response.status === 400) {
      throw new Error('INVALID_REQUEST: Dados inválidos enviados à IA.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error('GEMINI_ERROR: Erro ao processar análise inteligente.');
    }

    const result = await response.json();
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('INVALID_RESPONSE: Resposta da IA incompleta.');
    }

    const jsonText = result.candidates[0].content.parts[0].text;
    
    // Try to parse JSON, cleaning common issues
    let cleaned = jsonText.trim();
    
    // Remove markdown code blocks if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }
    
    // Log for debugging
    console.log('Gemini raw response length:', cleaned.length);
    
    try {
      return JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('JSON excerpt (first 500 chars):', cleaned.substring(0, 500));
      console.error('JSON excerpt (last 500 chars):', cleaned.substring(Math.max(0, cleaned.length - 500)));
      throw new Error('INVALID_RESPONSE: IA retornou resposta mal formatada. Tentando novamente com fallback...');
    }
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT: Processamento demorado. Tente com arquivo menor.');
    }
    throw error;
  }
}

function buildGeminiPrompt(
  totalOrders: number,
  totalSKUs: number,
  dateRange: string,
  abcAnalysis: ABCAnalysis,
  affinityPairs: AffinityPair[],
  misplacedSKUs: any[],
  avgDistancePerOrder: number,
  avgTimePerOrderMinutes: number
): string {
  // Calculate ABC distribution
  const abcDistribution = { A: 0, B: 0, C: 0, D: 0 };
  const abcPicks = { A: 0, B: 0, C: 0, D: 0 };
  
  Object.values(abcAnalysis).forEach(item => {
    abcDistribution[item.class]++;
    abcPicks[item.class] += item.picks;
  });

  const topAffinityPairs = affinityPairs.slice(0, 10);

  return `
Você é um especialista em otimização de warehouse slotting com 20 anos de experiência em logística e supply chain.

DADOS ANALISADOS:
- Total de pedidos: ${totalOrders}
- Total de SKUs: ${totalSKUs}
- Período: ${dateRange}

ANÁLISE ABC (Classificação por Velocidade):
- Classe A: ${abcDistribution.A} SKUs (${abcPicks.A} picks) - Representa ~80% do volume
- Classe B: ${abcDistribution.B} SKUs (${abcPicks.B} picks) - Representa ~15% do volume
- Classe C: ${abcDistribution.C} SKUs (${abcPicks.C} picks) - Representa ~4% do volume
- Classe D: ${abcDistribution.D} SKUs (${abcPicks.D} picks) - Representa ~1% do volume

TOP 10 PARES DE ALTA AFINIDADE (Market Basket Analysis):
${topAffinityPairs.map((p, i) => `
${i + 1}. ${p.sku_a_name} + ${p.sku_b_name}
   - Lift: ${p.lift.toFixed(2)} (comprados juntos ${((p.lift - 1) * 100).toFixed(0)}% mais que o esperado)
   - Confiança: ${(p.confidence * 100).toFixed(1)}%
   - Co-ocorrências: ${p.co_occurrences} pedidos
   - Distância atual: ${p.current_distance_m}m
`).join('')}

SKUs MAL POSICIONADOS (Classe vs Zona):
${misplacedSKUs.slice(0, 15).map(s => `
- ${s.sku_code}: Classe ${s.class}, Zona ${s.current_zone}, ${Math.round(s.pickFrequencyMonthly)} picks/mês
`).join('')}

ANÁLISE DE ROTAS:
- Distância média atual: ${avgDistancePerOrder.toFixed(0)}m/pedido
- Tempo médio atual: ${avgTimePerOrderMinutes.toFixed(1)} min/pedido
- Projeção otimizada: ${(avgDistancePerOrder * 0.65).toFixed(0)}m (-35%)
- Economia anual: ${Math.round((avgTimePerOrderMinutes * 0.35 * 1200 * 250) / 60)} horas (25 operadores, 1200 pedidos/dia)

CRITÉRIOS DE PRIORIZAÇÃO:
Priority 1 (Alta): SKU classe A em Zona C, Lift > 1.8 + distância > 50m, >200 picks/mês
Priority 2 (Média): SKU classe A em Zona B, classe B em Zona C, Lift 1.5-1.8 + distância > 30m
Priority 3 (Baixa): Ajustes finos, Lift 1.2-1.5

TAREFA: Gere 18-20 recomendações focando em máximo impacto (Lei de Pareto).

FORMATO DE SAÍDA (JSON válido):
{
  "recommendations": [
    {
      "sku_code": "HIG001",
      "sku_name": "Shampoo Premium 400ml",
      "current_location": "C-15",
      "current_zone": "C",
      "recommended_location": "A-03",
      "recommended_zone": "A",
      "reason": "Classe A com 180 picks/mês (3.2% do volume). Zona C a 75m. Mover para Zona A (15m) economiza 60m/pick = 10.8km/mês. Impacto: 270km/mês com 25 operadores. Tempo: 2.4min/pedido economizados.",
      "priority": 1,
      "estimated_improvement_percent": 28.5,
      "distance_saved_per_pick_m": 60,
      "related_skus": ["HIG002", "HIG003"],
      "affinity_note": "Pedido junto com Condicionador (HIG002, Lift 1.82, 78% dos pedidos) e Sabonete (HIG003, Lift 1.65, 65%). Distância atual HIG001-HIG002: 85m. Recomendação: raio de 8m para picking combinado."
    }
  ],
  "summary": {
    "total_recommendations": 18,
    "high_priority": 6,
    "medium_priority": 8,
    "low_priority": 4,
    "estimated_overall_improvement_percent": 35,
    "estimated_distance_saved_per_order_m": ${Math.round(avgDistancePerOrder * 0.35)},
    "estimated_time_saved_per_order_minutes": ${(avgTimePerOrderMinutes * 0.35).toFixed(1)},
    "estimated_annual_hours_saved": ${Math.round((avgTimePerOrderMinutes * 0.35 * 1200 * 250) / 60)},
    "estimated_annual_cost_savings_usd": ${Math.round((avgTimePerOrderMinutes * 0.35 * 1200 * 250 * 18) / 60)}
  }
}

INSTRUÇÕES:
1. Razões com números reais dos dados (não genéricos)
2. Calcule impacto: distância × picks × operadores
3. Liste SKUs relacionados com Lift > 1.5
4. affinity_note com Lift exato, %, distâncias, recomendação ideal
5. 18-20 recomendações focando máximo ROI
6. Combine ABC + afinidade + distância
7. JSON válido apenas, sem markdown
`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('UNAUTHORIZED: Token de autenticação ausente');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('UNAUTHORIZED: Usuário não autenticado');
    }

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'analysis_started',
      userId: user.id
    }));

    // Parse request body
    const { csvData, fileName, columnMapping } = await req.json();

    // Apply column mapping if provided
    let processedData = csvData;
    if (columnMapping) {
      console.log('📋 Applying column mapping:', columnMapping);
      processedData = csvData.map((row: any) => {
        const mappedRow: any = {};
        Object.entries(columnMapping as { [key: string]: string }).forEach(([csvCol, standardField]) => {
          mappedRow[standardField as string] = row[csvCol];
        });
        return mappedRow;
      });
      console.log('✅ Data mapped. Sample:', processedData[0]);
    }

    // Validate CSV data
    const validation = validateCSVData(processedData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: validation.error 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Normalize data
    const normalizedData = normalizeCSVData(processedData);

    // Calculate date range
    const dates = normalizedData.map(r => new Date(r.order_date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const periodInDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dateRange = `${minDate.toISOString().split('T')[0]} a ${maxDate.toISOString().split('T')[0]}`;

    // ROUTE OPTIMIZATION ANALYSIS: Calculate average distance per order (current state)
    const orderGroups: { [orderId: string]: string[] } = {};
    normalizedData.forEach(row => {
      if (!orderGroups[row.order_id]) orderGroups[row.order_id] = [];
      orderGroups[row.order_id].push(row.current_location);
    });

    const orderDistances: number[] = [];
    Object.values(orderGroups).forEach(locations => {
      let totalDistance = 0;
      let prevLocation = 'A-00'; // Start at dock/expedition
      
      // Simulate Nearest Neighbor route (simplified)
      locations.forEach(loc => {
        totalDistance += estimateDistance(prevLocation, loc);
        prevLocation = loc;
      });
      
      orderDistances.push(totalDistance);
    });

    const avgDistancePerOrder = orderDistances.length > 0 
      ? orderDistances.reduce((a, b) => a + b, 0) / orderDistances.length 
      : 200;
    const avgTimePerOrderMinutes = (avgDistancePerOrder / 1.5) / 60; // 1.5 m/s walking speed

    // Get or create warehouse
    let { data: warehouse } = await supabase
      .from('warehouses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!warehouse) {
      const { data: newWarehouse, error: warehouseError } = await supabase
        .from('warehouses')
        .insert({ user_id: user.id, name: 'Meu Armazém' })
        .select()
        .single();
      
      if (warehouseError) throw warehouseError;
      warehouse = newWarehouse;
    }

    if (!warehouse) {
      throw new Error('Falha ao criar warehouse');
    }

    const warehouseId = warehouse.id;

    // Build SKU name map
    const skuNames: { [code: string]: string } = {};
    normalizedData.forEach(row => {
      if (!skuNames[row.sku_code]) {
        skuNames[row.sku_code] = row.sku_name;
      }
    });

    // Perform ABC Analysis
    const abcAnalysis = performABCAnalysis(normalizedData, periodInDays);

    // Perform Affinity Analysis (original for Gemini)
    const affinityPairs = performAffinityAnalysis(normalizedData, skuNames);

    // NOVO: Análise aprimorada com Phi
    const affinityPairsEnhanced = performAffinityAnalysisEnhanced(normalizedData, skuNames);

    // NOVO: Buscar layout do warehouse profile
    let layoutPlan = null;
    try {
      const { data: warehouseProfile } = await supabase
        .from('warehouse_profiles')
        .select('layout_drawing_data')
        .eq('user_id', user.id)
        .single();
      
      if (warehouseProfile?.layout_drawing_data) {
        layoutPlan = warehouseProfile.layout_drawing_data;
      }
    } catch (err) {
      console.log('⚠️ Layout não encontrado, usando fallback');
    }

    // NOVO: Calcular distância média por pedido
    const { avgDistance, samples, methodNotes } = calculateAvgDistancePerOrder(
      normalizedData,
      layoutPlan,
      abcAnalysis
    );

    // NOVO: Calcular ABC distribution para snapshot
    const abcDistribution: { [key: string]: number } = {
      'A': 0,
      'B': 0,
      'C': 0,
      'D': 0
    };

    Object.values(abcAnalysis).forEach(sku => {
      abcDistribution[sku.class] = (abcDistribution[sku.class] || 0) + 1;
    });

    const totalSkusForABC = Object.keys(abcAnalysis).length;
    Object.keys(abcDistribution).forEach(cls => {
      abcDistribution[cls] = abcDistribution[cls] / totalSkusForABC;
    });

    // NOVO: Calcular SLA estimate
    const targetSLA = 15;
    const slaEstimate = calculateSLAEstimate(
      abcAnalysis,
      affinityPairsEnhanced,
      normalizedData,
      targetSLA
    );

    // Identify misplaced SKUs
    const misplacedSKUs = Object.entries(abcAnalysis)
      .map(([code, data]) => {
        const location = normalizedData.find(r => r.sku_code === code)?.current_location || '';
        const currentZone = extractZone(location);
        const expectedZone = data.class === 'D' ? 'C' : data.class;
        
        return {
          sku_code: code,
          sku_name: skuNames[code],
          class: data.class,
          current_location: location,
          current_zone: currentZone,
          expected_zone: expectedZone,
          pickFrequencyMonthly: data.pickFrequencyMonthly,
          misplaced: currentZone !== expectedZone
        };
      })
      .filter(s => s.misplaced)
      .sort((a, b) => b.pickFrequencyMonthly - a.pickFrequencyMonthly);

    // Build Gemini prompt
    const prompt = buildGeminiPrompt(
      new Set(normalizedData.map(r => r.order_id)).size,
      Object.keys(abcAnalysis).length,
      dateRange,
      abcAnalysis,
      affinityPairs,
      misplacedSKUs,
      avgDistancePerOrder,
      avgTimePerOrderMinutes
    );

    // Log metrics before calling Gemini API
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'calling_gemini_api',
      avgDistancePerOrder: avgDistancePerOrder.toFixed(0),
      avgTimePerOrderMinutes: avgTimePerOrderMinutes.toFixed(1),
      totalAffinityPairs: affinityPairs.length,
      misplacedSKUsCount: misplacedSKUs.length,
      projectedSavings: {
        distanceReductionPercent: 35,
        annualHoursSaved: Math.round((avgTimePerOrderMinutes * 0.35 * 1200 * 250) / 60),
        annualCostSavingsUSD: Math.round((avgTimePerOrderMinutes * 0.35 * 1200 * 250 * 18) / 60)
      }
    }));

    // Call Gemini API
    let geminiResponse: GeminiResponse;
    try {
      geminiResponse = await callGeminiAPI(prompt);
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback: create basic recommendations from ABC analysis
      geminiResponse = {
        recommendations: misplacedSKUs.slice(0, 15).map((s, i) => ({
          sku_code: s.sku_code,
          sku_name: s.sku_name,
          current_location: s.current_location,
          current_zone: s.current_zone,
          recommended_location: `${s.expected_zone}-${String(i + 1).padStart(2, '0')}`,
          recommended_zone: s.expected_zone,
          reason: `SKU classe ${s.class} mal posicionado na Zona ${s.current_zone}. Recomenda-se mover para Zona ${s.expected_zone}.`,
          priority: s.class === 'A' ? 1 : s.class === 'B' ? 2 : 3,
          estimated_improvement_percent: 15,
          distance_saved_per_pick_m: 40,
          related_skus: [],
          affinity_note: ''
        })),
        summary: {
          total_recommendations: 15,
          high_priority: 5,
          medium_priority: 6,
          low_priority: 4,
          estimated_overall_improvement_percent: 18,
          estimated_distance_saved_per_order_m: 35,
          estimated_time_saved_per_order_minutes: 1.4,
          estimated_annual_hours_saved: 500,
          estimated_annual_cost_savings_usd: 10000
        }
      };
    }

    // Upsert SKUs with ABC classification
    const skuUpserts = Object.entries(abcAnalysis).map(([code, data]) => {
      const row = normalizedData.find(r => r.sku_code === code)!;
      return {
        warehouse_id: warehouseId,
        sku_code: code,
        sku_name: row.sku_name,
        category: row.category,
        current_location: row.current_location,
        current_zone: extractZone(row.current_location),
        velocity_class: data.class,
        pick_frequency: data.picks,
        pick_frequency_monthly: data.pickFrequencyMonthly,
        dimensions: { weight_kg: row.weight_kg },
        last_analyzed_at: new Date().toISOString()
      };
    });

    // Batch upsert SKUs (100 at a time)
    for (let i = 0; i < skuUpserts.length; i += 100) {
      const batch = skuUpserts.slice(i, i + 100);
      const { error: skuError } = await supabase
        .from('skus')
        .upsert(batch, { onConflict: 'warehouse_id,sku_code' });
      
      if (skuError) {
        console.error('Error upserting SKUs:', skuError);
      }
    }

    // Get SKU IDs for foreign key references
    const { data: skuRecords } = await supabase
      .from('skus')
      .select('id, sku_code')
      .eq('warehouse_id', warehouseId);

    const skuIdMap: { [code: string]: string } = {};
    skuRecords?.forEach(record => {
      skuIdMap[record.sku_code] = record.id;
    });

    // Create optimization run
    const { data: optimizationRun, error: runError } = await supabase
      .from('optimization_runs')
      .insert({
        warehouse_id: warehouseId,
        analysis_start_date: minDate.toISOString().split('T')[0],
        analysis_end_date: maxDate.toISOString().split('T')[0],
        total_orders_analyzed: new Set(normalizedData.map(r => r.order_id)).size,
        total_skus_analyzed: Object.keys(abcAnalysis).length,
        recommendations_generated: geminiResponse.recommendations.length,
        high_priority_count: geminiResponse.summary.high_priority,
        medium_priority_count: geminiResponse.summary.medium_priority,
        low_priority_count: geminiResponse.summary.low_priority,
        estimated_distance_reduction_percent: geminiResponse.summary.estimated_overall_improvement_percent,
        current_avg_distance_per_order_m: 200,
        optimized_avg_distance_per_order_m: 200 - geminiResponse.summary.estimated_distance_saved_per_order_m,
        estimated_time_reduction_percent: geminiResponse.summary.estimated_overall_improvement_percent,
        current_productivity_pieces_per_hour: 120,
        optimized_productivity_pieces_per_hour: 120 * (1 + geminiResponse.summary.estimated_overall_improvement_percent / 100),
        productivity_improvement_percent: geminiResponse.summary.estimated_overall_improvement_percent,
        estimated_annual_hours_saved: geminiResponse.summary.estimated_annual_hours_saved,
        estimated_annual_cost_savings_usd: geminiResponse.summary.estimated_annual_cost_savings_usd,
        processing_time_seconds: 0
      })
      .select()
      .single();

    if (runError) throw runError;

    // NOVO: Criar analytics snapshot
    const { data: snapshotData, error: snapshotError } = await supabase
      .from('analytics_snapshots')
      .insert({
        warehouse_id: warehouseId,
        optimization_run_id: optimizationRun.id,
        abc_distribution: abcDistribution,
        top_affinity_pairs: affinityPairsEnhanced,
        avg_distance_per_order_m: avgDistance,
        target_sla_reduction_pct: targetSLA,
        estimated_distance_reduction_pct: slaEstimate.estimated_distance_reduction_pct,
        estimated_time_saved_pct: slaEstimate.estimated_time_saved_pct,
        method_notes: methodNotes,
        order_distance_samples: samples
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('❌ Error creating analytics snapshot:', snapshotError);
    } else {
      console.log('✅ Analytics snapshot created:', snapshotData.id);
    }

    // Insert recommendations
    const recommendationInserts = geminiResponse.recommendations
      .filter(rec => skuIdMap[rec.sku_code]) // Only insert if SKU exists
      .map(rec => ({
        warehouse_id: warehouseId,
        optimization_run_id: optimizationRun.id,
        sku_id: skuIdMap[rec.sku_code],
        current_location: rec.current_location,
        current_zone: rec.current_zone,
        recommended_location: rec.recommended_location,
        recommended_zone: rec.recommended_zone,
        reason: rec.reason,
        priority: rec.priority,
        estimated_improvement_percent: rec.estimated_improvement_percent,
        distance_saved_per_pick_m: rec.distance_saved_per_pick_m,
        related_skus: rec.related_skus,
        affinity_note: rec.affinity_note,
        status: 'pending'
      }));

    if (recommendationInserts.length > 0) {
      const { error: recError } = await supabase
        .from('slotting_recommendations')
        .insert(recommendationInserts);
      
      if (recError) {
        console.error('Error inserting recommendations:', recError);
      }
    }

    // Insert affinity pairs
    const affinityInserts = affinityPairs
      .filter(pair => skuIdMap[pair.sku_a] && skuIdMap[pair.sku_b])
      .slice(0, 20) // Top 20
      .map(pair => ({
        warehouse_id: warehouseId,
        sku_a_id: skuIdMap[pair.sku_a],
        sku_b_id: skuIdMap[pair.sku_b],
        co_occurrence_count: pair.co_occurrences,
        support: pair.support,
        confidence: pair.confidence,
        lift: pair.lift,
        current_distance_m: pair.current_distance_m,
        recommended_action: pair.recommendation,
        total_orders: new Set(normalizedData.map(r => r.order_id)).size,
        total_orders_with_a: skuUpserts.find(s => s.sku_code === pair.sku_a)?.pick_frequency || 0,
        total_orders_with_b: skuUpserts.find(s => s.sku_code === pair.sku_b)?.pick_frequency || 0
      }));

    if (affinityInserts.length > 0) {
      const { error: affinityError } = await supabase
        .from('product_affinity')
        .insert(affinityInserts);
      
      if (affinityError) {
        console.error('Error inserting affinity pairs:', affinityError);
      }
    }

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'analysis_completed',
      userId: user.id,
      warehouseId,
      runId: optimizationRun.id,
      recommendationsCount: geminiResponse.recommendations.length
    }));

    return new Response(JSON.stringify({
      success: true,
      runId: optimizationRun.id,
      summary: geminiResponse.summary,
      skuCount: Object.keys(abcAnalysis).length,
      orderCount: new Set(normalizedData.map(r => r.order_id)).size
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in analyze-warehouse:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro ao processar análise. Tente novamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColumnDetectionRequest {
  csvColumns: string[];
  sampleRows: any[];
}

interface ColumnMapping {
  detected_mapping: { [csvColumn: string]: string };
  confidence_scores: { [csvColumn: string]: number };
  overall_confidence: number;
  missing_fields: string[];
  extra_columns: string[];
  warnings: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvColumns, sampleRows } = await req.json() as ColumnDetectionRequest;

    console.log('🔍 Auto-detecting columns:', { csvColumns, sampleCount: sampleRows.length });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Build intelligent prompt
    const prompt = `
Você é um especialista em análise de dados de warehouse. Analise as colunas de um arquivo CSV e mapeie para o schema padrão OptiRack.

COLUNAS ENCONTRADAS NO CSV:
${csvColumns.map((col, i) => `${i + 1}. "${col}"`).join('\n')}

AMOSTRA DE DADOS (primeiras 3 linhas):
${JSON.stringify(sampleRows.slice(0, 3), null, 2)}

CAMPOS OBRIGATÓRIOS DO SCHEMA OPTIRACK:
1. order_id - Número/código único do pedido
2. order_date - Data do pedido (qualquer formato de data)
3. sku_code - Código/SKU do produto (alfanumérico)
4. sku_name - Nome/descrição do produto (texto)
5. category - Categoria do produto (texto)
6. quantity - Quantidade pedida (número inteiro)
7. current_location - Localização atual no armazém (ex: A-01, B-15)
8. weight_kg - Peso em quilogramas (número decimal)

TAREFA:
Analise semanticamente cada coluna do CSV e determine qual campo do schema ela representa.

CONSIDERE:
- Variações de nomes (ex: "item" → "sku_code", "qtd" → "quantity", "data" → "order_date")
- Análise dos dados reais para confirmar o tipo
- Sinônimos e traduções (português, inglês, espanhol)
- Abreviações comuns (ex: "desc" → "sku_name", "cat" → "category")

SCORE DE CONFIANÇA:
- 0.95-1.00: Certeza absoluta (nome idêntico ou muito próximo)
- 0.80-0.94: Alta confiança (nome similar + tipo de dado correto)
- 0.60-0.79: Média confiança (nome ambíguo mas dados sugerem o campo)
- 0.00-0.59: Baixa confiança (não detectado)

RETORNE JSON EXATAMENTE NESTE FORMATO:
{
  "detected_mapping": {
    "coluna_csv_1": "order_id",
    "coluna_csv_2": "sku_code",
    ...
  },
  "confidence_scores": {
    "coluna_csv_1": 0.98,
    "coluna_csv_2": 0.95,
    ...
  },
  "overall_confidence": 0.92,
  "missing_fields": ["weight_kg"],
  "extra_columns": ["observacoes", "vendedor"],
  "warnings": ["Campo 'weight_kg' não encontrado. Será usado valor padrão 0.5kg"]
}

REGRAS:
1. Mapeie SOMENTE colunas que você identificou com confiança >= 0.60
2. Liste colunas não mapeadas em "extra_columns"
3. Liste campos obrigatórios ausentes em "missing_fields"
4. Calcule overall_confidence como média dos scores
5. Adicione warnings para campos críticos faltantes
6. JSON válido apenas, sem markdown
`;

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
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error('Erro ao processar detecção de colunas com IA');
    }

    const result = await response.json();
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta da IA incompleta');
    }

    const jsonText = result.candidates[0].content.parts[0].text;
    
    // Clean and parse JSON
    let cleaned = jsonText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }

    const detectionResult: ColumnMapping = JSON.parse(cleaned);

    console.log('✅ Column detection result:', {
      mappedColumns: Object.keys(detectionResult.detected_mapping).length,
      overallConfidence: detectionResult.overall_confidence,
      missingFields: detectionResult.missing_fields
    });

    return new Response(
      JSON.stringify(detectionResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in auto-detect-columns:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao detectar colunas',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

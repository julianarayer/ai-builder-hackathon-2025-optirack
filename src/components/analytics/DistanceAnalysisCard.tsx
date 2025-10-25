import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Ruler, AlertCircle } from "lucide-react";
import { AnalyticsSnapshot } from "@/types/analytics";

interface Props {
  snapshot: AnalyticsSnapshot;
}

export function DistanceAnalysisCard({ snapshot }: Props) {
  const methodNotes = snapshot.method_notes;
  const hasGeometry = methodNotes.distance_mode === 'profile_informed_no_layout';
  const hasLayout = methodNotes.distance_mode === 'layout_based';
  const isFallback = methodNotes.distance_mode === 'ordinal_fallback';
  
  const getModeLabel = () => {
    if (hasLayout) return { label: 'Layout Real', color: 'bg-green-100 text-green-800' };
    if (hasGeometry) return { label: 'Geometria Estimada', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Fallback Ordinal', color: 'bg-yellow-100 text-yellow-800' };
  };
  
  const mode = getModeLabel();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary-500" />
            Análise de Distância
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-2">Métodos de Cálculo:</p>
                <p className="text-xs">
                  <strong>Layout Real:</strong> Usa coordenadas reais do desenho<br/>
                  <strong>Geometria Estimada:</strong> Usa área e largura de corredor do perfil<br/>
                  <strong>Fallback Ordinal:</strong> Estimativa simples baseada em classes ABC
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Badge className={mode.color}>{mode.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distância Média */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-lg">
          <div>
            <div className="text-sm text-neutral-600">Distância Média por Pedido</div>
            <div className="text-3xl font-bold text-primary-600 mt-1">
              {snapshot.avg_distance_per_order_m.toFixed(1)} m
            </div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <div>Métrica: {methodNotes.distance_metric}</div>
            <div>Heurística: {methodNotes.path_heuristic}</div>
          </div>
        </div>
        
        {/* Parâmetros de Geometria */}
        {hasGeometry && methodNotes.N_aisles && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-700">Geometria Estimada:</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-neutral-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{methodNotes.N_aisles}</div>
                <div className="text-xs text-neutral-600">Corredores</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{methodNotes.aisle_width_m?.toFixed(1)}</div>
                <div className="text-xs text-neutral-600">Largura (m)</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{methodNotes.aisle_length_m?.toFixed(0)}</div>
                <div className="text-xs text-neutral-600">Comprimento (m)</div>
              </div>
            </div>
            <div className="text-xs text-neutral-500 italic">
              Calculado a partir da área do armazém e largura de corredor configurada
            </div>
          </div>
        )}
        
        {/* Aviso de Fallback */}
        {isFallback && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <strong>Estimativa simplificada:</strong> Complete o perfil do armazém (área e largura de corredor) 
              para obter cálculos mais precisos, ou desenhe o layout para usar coordenadas reais.
            </div>
          </div>
        )}
        
        {/* Nota sobre Layout */}
        {hasLayout && (
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <InfoIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-green-800">
              <strong>Alta precisão:</strong> Usando coordenadas reais do layout desenhado para cálculo de distâncias.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InfoIcon, Ruler, AlertCircle, MousePointerClick } from "lucide-react";
import { AnalyticsSnapshot } from "@/types/analytics";
import { useState } from "react";

interface Props {
  snapshot: AnalyticsSnapshot;
}

export function DistanceAnalysisCard({ snapshot }: Props) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
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

  const handleCardClick = () => {
    console.log('Card clicked! Opening dialog...');
    setShowDetailsDialog(true);
  };
  
  console.log('DistanceAnalysisCard render - showDetailsDialog:', showDetailsDialog);
  
  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary-500" />
              Análise de Distância
              <Tooltip>
                <TooltipTrigger onClick={(e) => e.stopPropagation()}>
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
              <MousePointerClick className="h-4 w-4 text-muted-foreground ml-auto" />
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
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Button clicked!');
                  setShowDetailsDialog(true);
                }}
                className="text-xs text-primary-500 hover:text-primary-600 underline mt-1"
              >
                Clique aqui para ver como calculamos
              </button>
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Como Calculamos {snapshot.avg_distance_per_order_m.toFixed(1)}m por Pedido?</DialogTitle>
            <DialogDescription>
              Detalhamento completo do método de cálculo e amostras de rotas analisadas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Método de Cálculo */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Badge className={mode.color}>{mode.label}</Badge>
              </h3>
              
              {/* Explicação do Método */}
              {isFallback && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 space-y-2">
                  <h4 className="font-semibold text-yellow-900">Método Ordinal (Fallback)</h4>
                  <p className="text-sm text-yellow-800">
                    Como não há informações sobre o layout ou perfil do armazém, usamos uma estimativa baseada nas classes ABC:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                    <li>• <strong>Classe A:</strong> 10m (ida) + 10m (volta) = 20m por item</li>
                    <li>• <strong>Classe B:</strong> 30m (ida) + 30m (volta) = 60m por item</li>
                    <li>• <strong>Classe C:</strong> 50m (ida) + 50m (volta) = 100m por item</li>
                    <li>• <strong>Classe D:</strong> 70m (ida) + 70m (volta) = 140m por item</li>
                  </ul>
                  <p className="text-sm text-yellow-800 mt-2">
                    A distância por pedido é a soma das distâncias de todos os itens do pedido.
                  </p>
                </div>
              )}

              {hasGeometry && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                  <h4 className="font-semibold text-blue-900">Método de Geometria Estimada</h4>
                  <p className="text-sm text-blue-800">
                    Usando as informações do perfil do armazém, estimamos a geometria dos corredores:
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{methodNotes.N_aisles}</div>
                      <div className="text-xs text-blue-700">Corredores estimados</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{methodNotes.aisle_width_m?.toFixed(1)}m</div>
                      <div className="text-xs text-blue-700">Largura do corredor</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{methodNotes.aisle_length_m?.toFixed(1)}m</div>
                      <div className="text-xs text-blue-700">Comprimento do corredor</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-blue-800">
                    <p><strong>Heurística de Rota (S-Shape):</strong></p>
                    <ol className="ml-4 space-y-1">
                      <li>1. SKUs são posicionados nos corredores por classe ABC (A mais próximo da origem)</li>
                      <li>2. O picker inicia no ponto de packing (0,0)</li>
                      <li>3. Visita os corredores em ordem de proximidade</li>
                      <li>4. Dentro de cada corredor, percorre até o item mais distante (forma de S)</li>
                      <li>5. Retorna ao ponto de packing ao final</li>
                      <li>6. Distância calculada usando métrica Manhattan (|Δx| + |Δy|)</li>
                    </ol>
                    <p className="mt-2">
                      <strong>Otimização por Afinidade:</strong> Pares de SKUs com Lift ≥ 1.5 são aproximados 
                      no mesmo corredor, reduzindo a distância Y em 25%.
                    </p>
                  </div>
                </div>
              )}

              {hasLayout && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
                  <h4 className="font-semibold text-green-900">Método de Layout Real</h4>
                  <p className="text-sm text-green-800">
                    Usando as coordenadas reais do layout desenhado para calcular distâncias precisas:
                  </p>
                  <ul className="text-sm text-green-800 space-y-1 ml-4">
                    <li>• Cada SKU tem uma posição (x, y) no layout</li>
                    <li>• A rota é otimizada visitando SKUs por proximidade</li>
                    <li>• Distância calculada usando métrica Manhattan entre pontos</li>
                    <li>• Heurística S-Shape para minimizar backtracking</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Amostras de Rotas */}
            {snapshot.order_distance_samples && snapshot.order_distance_samples.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Amostras de Pedidos Analisados</h3>
                <p className="text-sm text-neutral-600">
                  Exemplos de rotas calculadas para validar o método (mostrando até 10 de {snapshot.order_distance_samples.length} amostras):
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {snapshot.order_distance_samples.slice(0, 10).map((sample: any, idx: number) => (
                    <div key={idx} className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">Pedido #{idx + 1}</div>
                        <div className="text-lg font-bold text-primary-600">{sample.distance_m.toFixed(1)}m</div>
                      </div>
                      <div className="text-xs text-neutral-600">
                        <div><strong>Itens:</strong> {sample.items_count} SKUs</div>
                        {sample.sku_codes && sample.sku_codes.length > 0 && (
                          <div className="mt-1">
                            <strong>SKUs:</strong> {sample.sku_codes.slice(0, 5).join(', ')}
                            {sample.sku_codes.length > 5 && ` +${sample.sku_codes.length - 5} mais`}
                          </div>
                        )}
                        {sample.route_points && sample.route_points.length > 0 && (
                          <div className="mt-1 text-neutral-500">
                            <strong>Rota:</strong> {sample.route_points[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo Estatístico */}
            <div className="bg-gradient-to-r from-primary-50 to-transparent p-4 rounded-lg border border-primary-200">
              <h3 className="font-semibold text-lg mb-3">Resumo Estatístico</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Distância Média</div>
                  <div className="text-2xl font-bold text-primary-600">{snapshot.avg_distance_per_order_m.toFixed(1)}m</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Métrica Usada</div>
                  <div className="text-lg font-semibold text-neutral-700 capitalize">{methodNotes.distance_metric}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Heurística de Rota</div>
                  <div className="text-lg font-semibold text-neutral-700 capitalize">{methodNotes.path_heuristic.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Amostras Analisadas</div>
                  <div className="text-lg font-semibold text-neutral-700">{snapshot.order_distance_samples?.length || 0} pedidos</div>
                </div>
              </div>
            </div>

            {/* Nota de Melhoria */}
            {isFallback && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Como Melhorar a Precisão?</h4>
                <p className="text-sm text-blue-800">
                  Para obter cálculos mais precisos, você pode:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 mt-2">
                  <li>• Completar o perfil do armazém com área total e largura dos corredores</li>
                  <li>• Desenhar o layout do armazém para usar coordenadas reais</li>
                  <li>• Isso permitirá simulações mais realistas das rotas de picking</li>
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

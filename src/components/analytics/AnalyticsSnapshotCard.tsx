import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { AnalyticsSnapshot } from "@/types/analytics";

interface Props {
  snapshot: AnalyticsSnapshot;
}

export function AnalyticsSnapshotCard({ snapshot }: Props) {
  return (
    <div className="space-y-4">
      {/* ABC Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Distribuição ABC
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Classificação por frequência de picking</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(snapshot.abc_distribution).map(([cls, pct]) => (
              <div key={cls} className="text-center">
                <div className="text-2xl font-bold">{(pct * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Classe {cls}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distância Média */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Distância Média por Pedido
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Métrica: {snapshot.method_notes.distance_metric}<br/>
                  Heurística: {snapshot.method_notes.path_heuristic}<br/>
                  {snapshot.method_notes.fallback_sem_layout && 
                    <span className="text-yellow-500">⚠️ Sem layout calibrado</span>
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {snapshot.avg_distance_per_order_m.toFixed(1)} m
          </div>
          {snapshot.method_notes.fallback_sem_layout && (
            <Badge variant="outline" className="mt-2">
              Estimativa (sem layout)
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* SLA e Ganhos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Potencial de Melhoria
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-2">Como é calculado:</p>
                <p className="text-xs">
                  Impact = 0.5 × (picks_classe_A / total_picks) + 
                  0.5 × (picks_top_pairs / total_picks)
                </p>
                <p className="text-xs mt-2">
                  Redução = min(meta_SLA, 100 × impact)
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meta SLA:</span>
              <span className="font-semibold">{snapshot.target_sla_reduction_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Redução de Distância:</span>
              <span className="font-semibold text-green-600">
                {snapshot.estimated_distance_reduction_pct.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo Economizado:</span>
              <span className="font-semibold text-green-600">
                {snapshot.estimated_time_saved_pct.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Affinity Pairs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Top Pares de Afinidade
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-2">Métricas:</p>
                <p className="text-xs">
                  <strong>Lift:</strong> suporte(i,j) / (suporte(i) × suporte(j))<br/>
                  <strong>Phi (φ):</strong> Coeficiente de Matthews<br/>
                  φ = (TP×TN - FP×FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))
                </p>
                <p className="text-xs mt-2">
                  Filtro: suporte mínimo de {snapshot.method_notes.min_pair_support * 100}%
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {snapshot.top_affinity_pairs.slice(0, 10).map((pair, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {pair.sku_i} + {pair.sku_j}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Lift: {pair.lift.toFixed(2)} | φ: {pair.phi.toFixed(2)}
                  </div>
                </div>
                <Badge variant={pair.lift > 2 ? "default" : "secondary"}>
                  {(pair.support_ij * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

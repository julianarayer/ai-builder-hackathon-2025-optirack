import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Navigation, Package, Clock } from "lucide-react";

interface ImpactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: any;
}

export const ImpactDetailModal = ({ isOpen, onClose, recommendation }: ImpactDetailModalProps) => {
  if (!recommendation) return null;

  const estimatedImprovement = recommendation.estimated_improvement_percent || 0;
  const distanceSaved = recommendation.distance_saved_per_pick_m || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <TrendingUp className="h-6 w-6 text-primary-500" />
            Detalhes do Impacto
          </DialogTitle>
          <DialogDescription>
            Análise detalhada dos benefícios desta recomendação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* SKU Info */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-neutral-600">SKU</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {recommendation.sku_code || "N/A"}
                </p>
              </div>
              <Badge className="bg-primary-100 text-primary-700 border-primary-300">
                Prioridade {recommendation.priority || "N/A"}
              </Badge>
            </div>
            <p className="text-sm text-neutral-700">{recommendation.reason}</p>
          </div>

          {/* Before / After */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-medium text-red-600 mb-2">ANTES</p>
              <p className="text-sm text-neutral-700 mb-1">
                <span className="font-medium">Zona:</span> {recommendation.current_zone || "N/A"}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Local:</span> {recommendation.current_location || "N/A"}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-medium text-green-600 mb-2">DEPOIS</p>
              <p className="text-sm text-neutral-700 mb-1">
                <span className="font-medium">Zona:</span> {recommendation.recommended_zone || "N/A"}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Local:</span> {recommendation.recommended_location || "N/A"}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <p className="text-xs font-medium text-neutral-700">Melhoria Estimada</p>
              </div>
              <p className="text-2xl font-bold text-primary-600">
                +{estimatedImprovement.toFixed(1)}%
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <p className="text-xs font-medium text-neutral-700">Distância Economizada</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {distanceSaved.toFixed(1)}m
              </p>
              <p className="text-xs text-neutral-600">por pick</p>
            </div>
          </div>

          {/* Affinity Note */}
          {recommendation.affinity_note && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-yellow-600" />
                <p className="text-sm font-medium text-neutral-900">Afinidade de Produtos</p>
              </div>
              <p className="text-sm text-neutral-700">{recommendation.affinity_note}</p>
            </div>
          )}

          {/* Related SKUs */}
          {recommendation.related_skus && recommendation.related_skus.length > 0 && (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm font-medium text-neutral-900 mb-2">SKUs Relacionados:</p>
              <div className="flex flex-wrap gap-2">
                {recommendation.related_skus.map((sku: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {sku}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Implementation Timeline */}
          <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <p className="text-sm font-medium text-neutral-900">Timeline de Implementação</p>
            </div>
            <div className="space-y-2 text-sm text-neutral-700">
              <p>• Semana 1: Movimentação física do SKU</p>
              <p>• Semana 2: Atualização no sistema WMS</p>
              <p>• Semana 3-4: Monitoramento e ajustes</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

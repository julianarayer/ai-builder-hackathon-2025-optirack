import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Package, Lightbulb, Eye } from "lucide-react";

interface AnalysisListProps {
  selectedDate: Date;
  analyses: any[];
  onViewAnalysis: (id: string) => void;
}

export function AnalysisList({ selectedDate, analyses, onViewAnalysis }: AnalysisListProps) {
  const filteredAnalyses = analyses.filter((analysis) =>
    isSameDay(new Date(analysis.run_date), selectedDate)
  );

  if (filteredAnalyses.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-neutral-500">
          Nenhuma análise encontrada para {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold text-neutral-900 mb-4">
        Análises de {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })} ({filteredAnalyses.length})
      </h3>

      <div className="space-y-3">
        {filteredAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-smooth"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">
                    {format(new Date(analysis.run_date), 'HH:mm')}
                  </span>
                  <Badge className="bg-success text-white">Completo</Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>{analysis.total_skus_analyzed} SKUs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>{analysis.recommendations_generated} recomendações</span>
                  </div>
                  {analysis.estimated_distance_reduction_percent && (
                    <div className="text-success font-medium">
                      -{analysis.estimated_distance_reduction_percent.toFixed(1)}% distância
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewAnalysis(analysis.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

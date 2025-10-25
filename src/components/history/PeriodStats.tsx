import { GlassCard } from "@/components/ui/glass-card";
import { BarChart3, TrendingUp, Package, Lightbulb } from "lucide-react";

interface PeriodStatsProps {
  analyses: any[];
  monthName: string;
  isLoading: boolean;
}

export function PeriodStats({ analyses, monthName, isLoading }: PeriodStatsProps) {
  if (isLoading) {
    return null;
  }

  if (analyses.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-neutral-500">Nenhuma análise realizada em {monthName}</p>
      </GlassCard>
    );
  }

  const totalAnalyses = analyses.length;
  const avgSkus = Math.round(
    analyses.reduce((sum, a) => sum + (a.total_skus_analyzed || 0), 0) / totalAnalyses
  );
  const avgImprovement =
    analyses.reduce((sum, a) => sum + (a.estimated_distance_reduction_percent || 0), 0) /
    totalAnalyses;
  const totalRecommendations = analyses.reduce(
    (sum, a) => sum + (a.recommendations_generated || 0),
    0
  );

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary-400" />
        <h2 className="text-2xl font-semibold text-neutral-900">
          Resumo de {monthName}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 mb-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Total de Análises</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{totalAnalyses}</p>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 mb-2">
            <Package className="h-4 w-4" />
            <span className="text-sm font-medium">Média de SKUs</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{avgSkus}</p>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Melhoria Média</span>
          </div>
          <p className="text-3xl font-bold text-success">{avgImprovement.toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 mb-2">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Total Recomendações</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{totalRecommendations}</p>
        </div>
      </div>
    </GlassCard>
  );
}

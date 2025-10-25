import { DollarSign, Clock, TrendingUp, Navigation } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface ImpactSectionProps {
  latestRun: any;
}

export const ImpactSection = ({ latestRun }: ImpactSectionProps) => {
  if (!latestRun) return null;

  // Calculate impact metrics
  const annualSavings = latestRun.estimated_annual_cost_savings_usd || 0;
  const hoursSaved = latestRun.estimated_annual_hours_saved || 0;
  const productivityGain = latestRun.productivity_improvement_percent || 0;
  const distanceReduction = latestRun.estimated_distance_reduction_percent || 0;

  return (
    <GlassCard className="p-8 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 border-2 border-primary-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary-500">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-neutral-900">
            🎯 Impacto Potencial
          </h2>
          <p className="text-sm text-subtle">
            Economia estimada ao implementar as recomendações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Annual Savings */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700">
              Economia Anual
            </h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1 kpi-value">
            R$ {Math.round(annualSavings).toLocaleString()}
          </p>
          <p className="text-xs text-subtle">
            {Math.round(annualSavings / 12).toLocaleString()}/mês
          </p>
        </div>

        {/* Hours Saved */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700">
              Horas Economizadas
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-1 kpi-value">
            {Math.round(hoursSaved).toLocaleString()}h
          </p>
          <p className="text-xs text-subtle">por ano</p>
        </div>

        {/* Productivity */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-pink-100">
              <TrendingUp className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700">
              Ganho de Produtividade
            </h3>
          </div>
          <p className="text-3xl font-bold text-pink-600 mb-1 kpi-value">
            +{productivityGain.toFixed(1)}%
          </p>
          <p className="text-xs text-subtle">picks por hora</p>
        </div>

        {/* Distance Reduced */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Navigation className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700">
              Distância Reduzida
            </h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-1 kpi-value">
            -{distanceReduction.toFixed(1)}%
          </p>
          <p className="text-xs text-subtle">menos km caminhados</p>
        </div>
      </div>

      {/* ROI Timeline */}
      <div className="mt-6 p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-neutral-200">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">
          📅 Timeline de Implementação Sugerida
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-subtle mb-1">Semana 1-2</p>
            <p className="text-sm font-medium text-neutral-900">
              Movimentações prioritárias
            </p>
          </div>
          <div>
            <p className="text-xs text-subtle mb-1">Semana 3-4</p>
            <p className="text-sm font-medium text-neutral-900">
              Ajustes secundários
            </p>
          </div>
          <div>
            <p className="text-xs text-subtle mb-1">Mês 2+</p>
            <p className="text-sm font-medium text-neutral-900">
              Monitoramento contínuo
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

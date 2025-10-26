import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExecutiveSummaryCardsProps {
  latestRun: any;
  criticalSKUsCount: number;
  inventoryValue: number;
  implementationRate: number;
}

export const ExecutiveSummaryCards = ({ 
  latestRun, 
  criticalSKUsCount, 
  inventoryValue, 
  implementationRate 
}: ExecutiveSummaryCardsProps) => {
  const navigate = useNavigate();
  const recommendationsCount = latestRun?.high_priority_count || 0;

  return (
    <GlassCard className="p-8 bg-gradient-to-br from-primary-50/80 to-secondary-50/80 border-2 border-primary-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-neutral-900">
            Resumo Executivo
          </h2>
          <p className="text-sm text-subtle">
            Visão geral das oportunidades de otimização identificadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Critical SKUs */}
        <div className="bg-gradient-to-br from-red-50 to-white backdrop-blur-sm rounded-2xl p-5 border border-red-300/60 hover:border-red-400 hover:shadow-lg hover:shadow-red-100 transition-all group">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-red-500 shadow-md shadow-red-200">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-700">SKUs Críticos</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-1">{criticalSKUsCount}</p>
          <p className="text-xs text-neutral-600">Requerem atenção imediata</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-gradient-to-br from-blue-50 to-white backdrop-blur-sm rounded-2xl p-5 border border-blue-300/60 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all group">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 shadow-md shadow-blue-200">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-700">Valor Retido</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-1">
            R$ {(inventoryValue / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-neutral-600">Em estoque atual</p>
        </div>

        {/* Implementation Rate */}
        <div className="bg-gradient-to-br from-green-50 to-white backdrop-blur-sm rounded-2xl p-5 border border-green-300/60 hover:border-green-400 hover:shadow-lg hover:shadow-green-100 transition-all group">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-500 shadow-md shadow-green-200">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-700">Taxa de Implementação</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">{implementationRate.toFixed(0)}%</p>
          <p className="text-xs text-neutral-600">Recomendações aplicadas</p>
        </div>

        {/* High Priority Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 to-white backdrop-blur-sm rounded-2xl p-5 border border-purple-300/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 transition-all group">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 shadow-md shadow-purple-200">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-700">Recomendações Alta Prioridade</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-1">{recommendationsCount}</p>
          <p className="text-xs text-neutral-600">Prontas para implementar</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-100/60 to-primary-200/60 border border-primary-300">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            Pronto para Implementar?
          </h3>
          <p className="text-sm text-neutral-700">
            Implemente as {recommendationsCount} recomendações prioritárias e economize{" "}
            <span className="font-semibold text-primary-700">
              R$ {Math.round((latestRun?.estimated_annual_cost_savings_usd || 0) / 1000)}k/ano
            </span>
          </p>
        </div>
        <Button 
          size="lg" 
          className="group bg-primary-500 hover:bg-primary-600 shadow-lg"
          onClick={() => navigate('/skus?priority=high')}
        >
          Implementar Agora
          <TrendingUp className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
      </div>

      {/* Timeline */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        <Badge className="bg-gradient-to-r from-green-400 to-green-500 text-white border-0 shadow-md shadow-green-200 px-4 py-1.5">
          Semana 1-2: Implementar prioritários
        </Badge>
        <Badge className="bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0 shadow-md shadow-blue-200 px-4 py-1.5">
          Semana 3-4: Ajustes secundários
        </Badge>
        <Badge className="bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 shadow-md shadow-purple-200 px-4 py-1.5">
          Mês 2+: Monitoramento contínuo
        </Badge>
      </div>
    </GlassCard>
  );
};

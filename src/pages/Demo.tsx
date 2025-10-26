/**
 * Demo Page - Read-only public demo mode
 * Allows visitors to explore OptiRack without authentication
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ImpactSection } from "@/components/dashboard/ImpactSection";
import { ExecutiveSummaryCards } from "@/components/dashboard/ExecutiveSummaryCards";
import { Package, Clock, Navigation, Lightbulb, Eye, ArrowLeft } from "lucide-react";
import optirackLogo from "@/assets/optirack-logo.png";
import { getLatestOptimizationRun, getABCDistribution, getTopSKUs } from "@/services/warehouseAnalysis";

export default function Demo() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [latestRun, setLatestRun] = useState<any>(null);
  const [abcDistribution, setAbcDistribution] = useState<any[]>([]);
  const [topSKUs, setTopSKUs] = useState<any[]>([]);

  // Demo warehouse ID - this should be a pre-seeded public warehouse
  const DEMO_WAREHOUSE_ID = "00000000-0000-0000-0000-000000000001";

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setIsLoading(true);

      // Load demo data without authentication
      const run = await getLatestOptimizationRun(DEMO_WAREHOUSE_ID);
      setLatestRun(run);

      const abc = await getABCDistribution(DEMO_WAREHOUSE_ID);
      setAbcDistribution(abc);

      const skus = await getTopSKUs(DEMO_WAREHOUSE_ID, 10);
      setTopSKUs(skus);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading demo data:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50 flex items-center justify-center">
        <div className="shimmer h-12 w-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
        <AppSidebar />

        {/* Demo Mode Watermark */}
        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2 text-sm font-semibold shadow-lg">
            <Eye className="h-4 w-4 mr-1" />
            MODO DEMO
          </Badge>
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-neutral-200/50">
          <div className="container mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={optirackLogo} alt="OptiRack" className="h-8 w-8" />
                <span className="text-lg font-medium text-neutral-900">OptiRack</span>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={() => navigate('/login')}>
                  Criar Conta Grátis
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="h-[56px]" />

          <main className="container mx-auto px-4 py-8 space-y-8">
            {/* Welcome */}
            <div className="space-y-2">
              <h2 className="text-3xl font-medium text-neutral-900">
                Demonstração Interativa do OptiRack
              </h2>
              <p className="text-lg text-subtle">
                Explore os recursos de análise e otimização com dados reais de exemplo
              </p>
            </div>

            {/* Executive Summary */}
            {latestRun && (
              <ExecutiveSummaryCards
                latestRun={latestRun}
                criticalSKUsCount={8}
                inventoryValue={450000}
                implementationRate={0}
              />
            )}

            {/* KPI Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Package}
                title="Total SKUs"
                value={latestRun?.total_skus_analyzed?.toString() || "--"}
              />
              <MetricCard
                icon={Clock}
                title="Tempo Economizado"
                value={latestRun ? `${latestRun.estimated_time_reduction_percent?.toFixed(1) || 0}%` : "--"}
              />
              <MetricCard
                icon={Navigation}
                title="Distância Reduzida"
                value={
                  latestRun
                    ? `${((latestRun.current_avg_distance_per_order_m || 0) - (latestRun.optimized_avg_distance_per_order_m || 0)).toFixed(0)}m/pedido`
                    : "--"
                }
              />
              <MetricCard
                icon={Lightbulb}
                title="Recomendações"
                value={latestRun ? `${latestRun.recommendations_generated || 0} geradas` : "--"}
              />
            </div>

            {/* Impact Section */}
            {latestRun && <ImpactSection latestRun={latestRun} />}

            {/* Quick Stats */}
            {latestRun && (
              <div className="grid gap-6 md:grid-cols-2">
                <GlassCard className="space-y-4 p-6">
                  <h3 className="text-lg font-medium text-neutral-900">Distribuição ABC</h3>
                  <div className="flex items-center justify-center h-64">
                    {abcDistribution.length > 0 ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-64 h-64">
                          <svg viewBox="0 0 200 200" className="w-full h-full">
                            {(() => {
                              const colors = {
                                A: "hsl(330, 81%, 60%)",
                                B: "hsl(217, 91%, 60%)",
                                C: "hsl(45, 93%, 58%)",
                                D: "hsl(215, 16%, 47%)",
                              };

                              let currentAngle = -90;

                              return abcDistribution.map((item) => {
                                const percentage = item.percentage || 0;
                                const angle = (percentage / 100) * 360;
                                const startAngle = currentAngle;
                                const endAngle = currentAngle + angle;

                                const startRad = (startAngle * Math.PI) / 180;
                                const endRad = (endAngle * Math.PI) / 180;

                                const x1 = 100 + 80 * Math.cos(startRad);
                                const y1 = 100 + 80 * Math.sin(startRad);
                                const x2 = 100 + 80 * Math.cos(endRad);
                                const y2 = 100 + 80 * Math.sin(endRad);

                                const largeArc = angle > 180 ? 1 : 0;

                                const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                const midAngle = startAngle + angle / 2;
                                const midRad = (midAngle * Math.PI) / 180;
                                const labelX = 100 + 60 * Math.cos(midRad);
                                const labelY = 100 + 60 * Math.sin(midRad);

                                currentAngle = endAngle;

                                return (
                                  <g key={item.velocity_class}>
                                    <path
                                      d={path}
                                      fill={colors[item.velocity_class as keyof typeof colors]}
                                      className="transition-opacity hover:opacity-80"
                                    />
                                    <text
                                      x={labelX}
                                      y={labelY}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                      className="fill-white font-bold text-sm pointer-events-none"
                                    >
                                      {item.velocity_class}: {percentage.toFixed(0)}%
                                    </text>
                                  </g>
                                );
                              });
                            })()}
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <p className="text-neutral-500">Nenhum dado disponível</p>
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="space-y-4 p-6">
                  <h3 className="text-lg font-medium text-neutral-900">Top 10 SKUs</h3>
                  <div className="space-y-2">
                    {topSKUs.slice(0, 10).map((sku, index) => (
                      <div
                        key={sku.id}
                        className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary-400">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-neutral-900">{sku.sku_code}</p>
                            <p className="text-xs text-neutral-600">{sku.sku_name || "N/A"}</p>
                          </div>
                        </div>
                        <Badge className="bg-primary-100 text-primary-700 border-primary-300">
                          {sku.pick_frequency} picks
                        </Badge>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* CTA */}
            <GlassCard className="p-8 text-center bg-gradient-to-br from-primary-100/50 to-primary-200/30">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                Gostou do que viu?
              </h3>
              <p className="text-neutral-700 mb-6">
                Crie sua conta gratuita e comece a otimizar seu armazém hoje mesmo
              </p>
              <Button size="lg" onClick={() => navigate('/login')}>
                Começar Gratuitamente
              </Button>
            </GlassCard>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

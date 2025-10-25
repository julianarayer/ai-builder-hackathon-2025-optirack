import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChevronLeft, Network, TrendingUp, Package, Zap } from "lucide-react";
import { toast } from "sonner";

interface AffinityPair {
  sku_a_id: string;
  sku_b_id: string;
  co_occurrence_count: number;
  support: number;
  confidence: number;
  lift: number;
  current_distance_m: number | null;
  recommended_action: string | null;
  sku_a?: { sku_code: string; sku_name: string | null };
  sku_b?: { sku_code: string; sku_name: string | null };
}

export default function Affinity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [affinityPairs, setAffinityPairs] = useState<AffinityPair[]>([]);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: warehouse } = await supabase
        .from("warehouses")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!warehouse) {
        toast.error("Armazém não encontrado");
        return;
      }

      setWarehouseId(warehouse.id);

      // Load affinity pairs with SKU details
      const { data: pairs, error } = await supabase
        .from("product_affinity")
        .select(`
          *,
          sku_a:skus!product_affinity_sku_a_id_fkey(sku_code, sku_name),
          sku_b:skus!product_affinity_sku_b_id_fkey(sku_code, sku_name)
        `)
        .eq("warehouse_id", warehouse.id)
        .order("lift", { ascending: false })
        .limit(50);

      if (error) throw error;

      setAffinityPairs(pairs as any || []);
    } catch (error) {
      console.error("Error loading affinity data:", error);
      toast.error("Erro ao carregar dados de afinidade");
    } finally {
      setLoading(false);
    }
  };

  const getLiftColor = (lift: number) => {
    if (lift >= 2.5) return "text-pink-600";
    if (lift >= 1.8) return "text-blue-600";
    return "text-yellow-600";
  };

  const getLiftBadge = (lift: number) => {
    if (lift >= 2.5) return { variant: "default" as const, text: "Alta" };
    if (lift >= 1.8) return { variant: "secondary" as const, text: "Média" };
    return { variant: "outline" as const, text: "Baixa" };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-50">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <div className="flex items-center gap-3">
                  <Network className="h-8 w-8 text-primary-500" />
                  <div>
                    <h1 className="text-2xl font-medium text-neutral-900">
                      Pares de Afinidade
                    </h1>
                    <p className="text-sm text-subtle">
                      Produtos frequentemente comprados juntos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-subtle">Pares Analisados</p>
                    <p className="text-3xl font-medium text-neutral-900 kpi-value">
                      {affinityPairs.length}
                    </p>
                  </div>
                  <Network className="h-12 w-12 text-primary-500" />
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-subtle">Alta Afinidade</p>
                    <p className="text-3xl font-medium text-neutral-900 kpi-value">
                      {affinityPairs.filter((p) => p.lift >= 2.5).length}
                    </p>
                    <p className="text-xs text-subtle">Lift ≥ 2.5</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-pink-500" />
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-subtle">Com Recomendação</p>
                    <p className="text-3xl font-medium text-neutral-900 kpi-value">
                      {
                        affinityPairs.filter((p) => p.recommended_action)
                          .length
                      }
                    </p>
                  </div>
                  <Zap className="h-12 w-12 text-blue-500" />
                </div>
              </GlassCard>
            </div>

            {/* Explanation */}
            <GlassCard className="bg-gradient-to-br from-primary-100/50 to-primary-200/30">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-500">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    🤖 O que é Afinidade de Produtos?
                  </h3>
                  <p className="text-sm text-neutral-700 mb-3">
                    Nossa IA analisa padrões de co-ocorrência em pedidos para
                    identificar produtos frequentemente comprados juntos. O{" "}
                    <strong>Lift</strong> mede o quão mais provável é dois
                    produtos aparecerem juntos do que por acaso.
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                      <strong>Lift ≥ 2.5:</strong> Alta afinidade - aproximar
                      urgentemente
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <strong>Lift 1.8-2.5:</strong> Média afinidade -
                      considerar proximidade
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                      <strong>Lift {"<"} 1.8:</strong> Baixa afinidade -
                      manter como está
                    </li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Affinity Pairs List */}
            <GlassCard>
              <h3 className="text-xl font-medium text-neutral-900 mb-4">
                Top Pares de Afinidade
              </h3>
              {loading ? (
                <div className="text-center py-12 text-neutral-600">
                  Carregando...
                </div>
              ) : affinityPairs.length === 0 ? (
                <div className="text-center py-12">
                  <Network className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-neutral-900 mb-2">
                    Nenhum par de afinidade encontrado
                  </h4>
                  <p className="text-neutral-600 mb-4">
                    Execute uma análise primeiro para identificar produtos com
                    afinidade
                  </p>
                  <Button onClick={() => navigate("/dashboard")}>
                    Ir para Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {affinityPairs.map((pair, idx) => {
                    const liftBadge = getLiftBadge(pair.lift);
                    return (
                      <div
                        key={`${pair.sku_a_id}-${pair.sku_b_id}`}
                        className="p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                #{idx + 1}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-900">
                                  {pair.sku_a?.sku_code || "SKU A"}
                                </span>
                                <span className="text-neutral-400">+</span>
                                <span className="font-medium text-neutral-900">
                                  {pair.sku_b?.sku_code || "SKU B"}
                                </span>
                              </div>
                              <Badge variant={liftBadge.variant}>
                                {liftBadge.text}
                              </Badge>
                            </div>
                            {(pair.sku_a?.sku_name || pair.sku_b?.sku_name) && (
                              <p className="text-sm text-neutral-600 mb-2">
                                {pair.sku_a?.sku_name || "—"} +{" "}
                                {pair.sku_b?.sku_name || "—"}
                              </p>
                            )}
                            {pair.recommended_action && (
                              <p className="text-sm text-primary-600 font-medium flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                {pair.recommended_action}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <div>
                              <p className="text-xs text-subtle">Lift</p>
                              <p
                                className={`text-lg font-bold ${getLiftColor(pair.lift)}`}
                              >
                                {pair.lift.toFixed(2)}x
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-subtle">
                                Co-ocorrência
                              </p>
                              <p className="text-sm font-medium text-neutral-900">
                                {pair.co_occurrence_count} pedidos
                              </p>
                            </div>
                            {pair.current_distance_m && (
                              <div>
                                <p className="text-xs text-subtle">
                                  Distância atual
                                </p>
                                <p className="text-sm font-medium text-neutral-900">
                                  {pair.current_distance_m.toFixed(0)}m
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Metrics */}
                        <div className="mt-3 pt-3 border-t border-neutral-200 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-subtle">Suporte</p>
                            <p className="text-sm font-medium text-neutral-900">
                              {(pair.support * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-subtle">Confiança</p>
                            <p className="text-sm font-medium text-neutral-900">
                              {(pair.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-subtle">
                              Economia potencial
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              {pair.current_distance_m
                                ? `${Math.round(pair.current_distance_m * 0.4)}m/dia`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

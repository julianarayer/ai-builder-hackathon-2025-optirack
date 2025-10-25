import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TrendingUp, Package, Box, Archive, Boxes, Sparkles, MapPin, ArrowRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface SKUData {
  id: string;
  sku_code: string;
  sku_name: string | null;
  category: string | null;
  velocity_class: string;
  pick_frequency: number;
  pick_frequency_monthly: number;
  current_location: string | null;
  current_zone: string | null;
  recommended_location: string | null;
  recommended_zone: string | null;
}

interface Recommendation {
  id: string;
  sku_id: string;
  reason: string;
  affinity_note: string | null;
  related_skus: string[] | null;
  distance_saved_per_pick_m: number | null;
  estimated_improvement_percent: number | null;
  recommended_location: string;
  recommended_zone: string | null;
  status: string;
}

interface EnrichedSKU extends SKUData {
  recommendation: Recommendation | null;
  hasRecommendation: boolean;
  estimatedImpact: number;
  distanceSaved: number;
}

const classColors = {
  A: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-300", light: "bg-pink-50" },
  B: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-300", light: "bg-blue-50" },
  C: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-300", light: "bg-yellow-50" },
  D: { bg: "bg-gray-500", text: "text-gray-600", border: "border-gray-300", light: "bg-gray-50" },
};

const classIcons = {
  A: Package,
  B: Box,
  C: Archive,
  D: Boxes,
};

const classStrategies = {
  A: [
    "Posicionar até 30m da expedição para minimizar tempo de deslocamento",
    "Revisar alocação semanalmente para ajustes rápidos",
    "Considerar afinidades entre produtos para otimizar rotas",
    "Priorizar picking em horários de pico",
  ],
  B: [
    "Manter na zona intermediária (30-60m da expedição)",
    "Revisar alocação mensalmente para ajustes",
    "Balancear espaço com produtos classe A",
    "Monitorar mudanças de frequência",
  ],
  C: [
    "Posicionar em zona distante (60-90m da expedição)",
    "Revisar alocação trimestralmente",
    "Consolidar picking com outros itens",
    "Considerar redução de estoque",
  ],
  D: [
    "Manter em zona mais distante (>90m da expedição)",
    "Revisar alocação semestralmente",
    "Avaliar necessidade de manter em estoque",
    "Considerar picking sob demanda",
  ],
};

const ABCDistribution = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialClass = (searchParams.get("classe") || "A").toUpperCase();
  
  const [activeClass, setActiveClass] = useState<"A" | "B" | "C" | "D">(initialClass as "A" | "B" | "C" | "D");
  const [skus, setSkus] = useState<EnrichedSKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSKU, setSelectedSKU] = useState<EnrichedSKU | null>(null);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [classCounts, setClassCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });

  useEffect(() => {
    loadWarehouseId();
  }, []);

  useEffect(() => {
    if (warehouseId) {
      loadClassCounts();
      loadSKUsData();
    }
  }, [activeClass, warehouseId]);

  const loadWarehouseId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: warehouses } = await supabase
        .from("warehouses")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (warehouses) {
        setWarehouseId(warehouses.id);
      }
    } catch (error) {
      console.error("Error loading warehouse:", error);
      toast.error("Erro ao carregar dados do armazém");
    }
  };

  const loadClassCounts = async () => {
    if (!warehouseId) return;

    try {
      const { data } = await supabase
        .from("skus")
        .select("velocity_class")
        .eq("warehouse_id", warehouseId);

      if (data) {
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        data.forEach((sku) => {
          if (sku.velocity_class in counts) {
            counts[sku.velocity_class as keyof typeof counts]++;
          }
        });
        setClassCounts(counts);
      }
    } catch (error) {
      console.error("Error loading class counts:", error);
    }
  };

  const loadSKUsData = async () => {
    if (!warehouseId) return;
    
    setLoading(true);
    try {
      const { data: skusData, error: skusError } = await supabase
        .from("skus")
        .select("*")
        .eq("warehouse_id", warehouseId)
        .eq("velocity_class", activeClass)
        .order("pick_frequency", { ascending: false });

      if (skusError) throw skusError;

      if (skusData && skusData.length > 0) {
        const skuIds = skusData.map((s) => s.id);

        const { data: recommendations, error: recError } = await supabase
          .from("slotting_recommendations")
          .select("*")
          .eq("warehouse_id", warehouseId)
          .in("sku_id", skuIds)
          .eq("status", "pending");

        if (recError) throw recError;

        const enrichedSKUs: EnrichedSKU[] = skusData.map((sku) => {
          const recommendation = recommendations?.find((r) => r.sku_id === sku.id) || null;
          return {
            ...sku,
            recommendation,
            hasRecommendation: !!recommendation,
            estimatedImpact: recommendation?.estimated_improvement_percent || 0,
            distanceSaved: recommendation?.distance_saved_per_pick_m || 0,
          };
        });

        setSkus(enrichedSKUs);
      } else {
        setSkus([]);
      }
    } catch (error) {
      console.error("Error loading SKUs:", error);
      toast.error("Erro ao carregar dados dos SKUs");
    } finally {
      setLoading(false);
    }
  };

  const totalSKUs = skus.length;
  const totalPicks = skus.reduce((sum, sku) => sum + (sku.pick_frequency_monthly || 0), 0);
  const totalSavings = skus.reduce((sum, sku) => sum + (sku.distanceSaved * (sku.pick_frequency_monthly || 0)), 0);

  const ClassIcon = classIcons[activeClass];
  const colors = classColors[activeClass];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-50">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          <div className="h-[72px]" />
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Distribuição ABC</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Classe {activeClass}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary-500" />
          <div>
            <h1 className="text-3xl font-medium text-neutral-900">Distribuição ABC</h1>
            <p className="text-sm text-subtle">Análise de velocidade e otimização de slotting</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeClass} onValueChange={(value) => setActiveClass(value as "A" | "B" | "C" | "D")}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            {(["A", "B", "C", "D"] as const).map((cls) => {
              const Icon = classIcons[cls];
              return (
                <TabsTrigger key={cls} value={cls} className="flex items-center gap-2 py-3">
                  <Icon className="h-4 w-4" />
                  <span>Classe {cls}</span>
                  <Badge variant="secondary" size="sm">{classCounts[cls]}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeClass} className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-subtle">Total de SKUs</p>
                    <p className="text-3xl font-medium text-neutral-900 kpi-value">{totalSKUs}</p>
                  </div>
                  <ClassIcon className={`h-12 w-12 ${colors.text}`} />
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-subtle">Picks mensais</p>
                    <p className="text-3xl font-medium text-neutral-900 kpi-value">{totalPicks.toLocaleString()}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-500" />
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-subtle">Economia potencial</p>
                    <p className="text-3xl font-medium text-neutral-900 kpi-value">{Math.round(totalSavings)}m</p>
                    <p className="text-xs text-subtle">por mês</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-500" />
                </div>
              </GlassCard>
            </div>

            {/* AI Strategies */}
            <GlassCard className={colors.light}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    🤖 Estratégias inteligentes para classe {activeClass}
                  </h3>
                  <ul className="space-y-2">
                    {classStrategies[activeClass].map((strategy, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                        <ArrowRight className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* SKUs Table */}
            <GlassCard>
              <h3 className="text-xl font-medium text-neutral-900 mb-4">
                SKUs da classe {activeClass}
              </h3>
              {loading ? (
                <div className="text-center py-12 text-neutral-600">Carregando...</div>
              ) : skus.length === 0 ? (
                <div className="text-center py-12 text-neutral-600">
                  Nenhum SKU encontrado na classe {activeClass}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código SKU</TableHead>
                        <TableHead>Nome do Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Picks/Mês</TableHead>
                        <TableHead>Localização Atual</TableHead>
                        <TableHead>Zona Atual</TableHead>
                        <TableHead>Recomendação da IA</TableHead>
                        <TableHead className="text-right">Impacto</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skus.map((sku) => (
                        <TableRow key={sku.id}>
                          <TableCell className="font-medium">{sku.sku_code}</TableCell>
                          <TableCell>{sku.sku_name || "-"}</TableCell>
                          <TableCell>{sku.category || "-"}</TableCell>
                          <TableCell className="text-right">
                            {Math.round(sku.pick_frequency_monthly || 0)}
                          </TableCell>
                          <TableCell>{sku.current_location || "-"}</TableCell>
                          <TableCell>
                            {sku.current_zone ? (
                              <Badge variant="outline" size="sm">
                                Zona {sku.current_zone}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {sku.hasRecommendation && sku.recommendation ? (
                              <Badge variant="info" size="sm">
                                Mover para {sku.recommendation.recommended_location}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">
                                Manter posição
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {sku.estimatedImpact > 0 ? (
                              <span className="text-sm font-semibold text-green-600">
                                +{sku.estimatedImpact.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-sm text-neutral-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSKU(sku)}
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GlassCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* SKU Details Modal */}
        <Dialog open={!!selectedSKU} onOpenChange={() => setSelectedSKU(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-500" />
              Detalhes do SKU: {selectedSKU?.sku_code}
            </DialogTitle>
            <DialogDescription>
              {selectedSKU?.sku_name || "Produto sem nome"}
            </DialogDescription>
          </DialogHeader>

          {selectedSKU && (
            <div className="space-y-6">
              {/* SKU Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-subtle">Classe de velocidade</p>
                  <Badge variant="default" size="lg" className="mt-1">
                    Classe {selectedSKU.velocity_class}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-subtle">Categoria</p>
                  <p className="text-base font-normal">{selectedSKU.category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-subtle">Picks mensais</p>
                  <p className="text-base font-medium kpi-value">
                    {Math.round(selectedSKU.pick_frequency_monthly || 0)} picks
                  </p>
                </div>
                <div>
                  <p className="text-sm text-subtle">Frequência total</p>
                  <p className="text-base font-medium kpi-value">{selectedSKU.pick_frequency} picks</p>
                </div>
              </div>

              {/* Current vs Recommended */}
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="bg-red-50">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">📍 Posição atual</p>
                    <div className="space-y-1">
                      <p className="text-lg font-medium">{selectedSKU.current_location || "-"}</p>
                      <Badge variant="outline" size="sm">
                        Zona {selectedSKU.current_zone || "?"}
                      </Badge>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="bg-green-50">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">✅ Posição recomendada</p>
                    <div className="space-y-1">
                      <p className="text-lg font-medium">
                        {selectedSKU.recommendation?.recommended_location || selectedSKU.current_location || "-"}
                      </p>
                      <Badge variant="success" size="sm">
                        Zona {selectedSKU.recommendation?.recommended_zone || selectedSKU.current_zone || "?"}
                      </Badge>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* AI Recommendation Details */}
              {selectedSKU.recommendation && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Razão da recomendação
                    </h4>
                    <p className="text-sm text-neutral-700 bg-purple-50 p-4 rounded-lg">
                      {selectedSKU.recommendation.reason}
                    </p>
                  </div>

                  {selectedSKU.recommendation.affinity_note && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        Nota de afinidade
                      </h4>
                      <p className="text-sm text-neutral-700 bg-blue-50 p-4 rounded-lg">
                        {selectedSKU.recommendation.affinity_note}
                      </p>
                    </div>
                  )}

                  {selectedSKU.recommendation.related_skus && selectedSKU.recommendation.related_skus.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900">SKUs relacionados</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSKU.recommendation.related_skus.map((relatedId) => (
                          <Badge key={relatedId} variant="secondary" size="sm">
                            {relatedId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="bg-green-50">
                      <p className="text-sm text-subtle">Distância economizada por pick</p>
                      <p className="text-2xl font-medium text-green-600 kpi-value">
                        {selectedSKU.distanceSaved.toFixed(1)}m
                      </p>
                    </GlassCard>

                    <GlassCard className="bg-blue-50">
                      <p className="text-sm text-subtle">Melhoria estimada</p>
                      <p className="text-2xl font-medium text-blue-600 kpi-value">
                        {selectedSKU.estimatedImpact.toFixed(1)}%
                      </p>
                    </GlassCard>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
        </Dialog>
      </div>
    </div>
    </SidebarProvider>
  );
};

export default ABCDistribution;

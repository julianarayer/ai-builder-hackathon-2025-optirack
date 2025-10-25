import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Clock, Package, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { getAnalysisById } from "@/services/warehouseAnalysis";
import { MetricCard } from "@/components/ui/metric-card";

export default function AnalysisDetails() {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      if (analysisId) {
        loadAnalysis();
      }
    };

    checkAuth();
  }, [navigate, analysisId]);

  const loadAnalysis = async () => {
    if (!analysisId) return;

    setIsLoading(true);
    const data = await getAnalysisById(analysisId);
    
    if (data) {
      setAnalysis(data);
    } else {
      toast.error('Análise não encontrada');
      navigate('/historico');
    }
    
    setIsLoading(false);
  };

  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Carregando análise...</p>
        </div>
      </div>
    );
  }

  const analysisDate = new Date(analysis.run_date);
  const recommendations = analysis.slotting_recommendations || [];
  
  const filteredRecommendations = filterStatus === "all" 
    ? recommendations 
    : recommendations.filter((r: any) => r.status === filterStatus);

  const statusCounts = {
    pending: recommendations.filter((r: any) => r.status === 'pending').length,
    applied: recommendations.filter((r: any) => r.status === 'applied').length,
    rejected: recommendations.filter((r: any) => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/historico')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Análise de {analysisDate.toLocaleDateString('pt-BR')}
              </h1>
              <p className="text-neutral-500 mt-1">
                às {analysisDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Status Badge */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-success text-white">Análise Completa</Badge>
              <span className="text-sm text-neutral-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Processamento: {analysis.processing_time_seconds || 0}s
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="SKUs Analisados"
            value={analysis.total_skus_analyzed || 0}
            icon={Package}
          />
          <MetricCard
            title="Redução de Distância"
            value={`${(analysis.estimated_distance_reduction_percent || 0).toFixed(1)}%`}
            icon={TrendingUp}
          />
          <MetricCard
            title="Tempo Economizado"
            value={`${(analysis.estimated_time_reduction_percent || 0).toFixed(1)}%`}
            icon={Clock}
          />
          <MetricCard
            title="Recomendações"
            value={analysis.recommendations_generated || 0}
            icon={Lightbulb}
          />
        </div>

        {/* Recommendations */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Recomendações ({recommendations.length})
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Todas ({recommendations.length})
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                >
                  Pendentes ({statusCounts.pending})
                </Button>
                <Button
                  variant={filterStatus === "applied" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("applied")}
                >
                  Aplicadas ({statusCounts.applied})
                </Button>
                <Button
                  variant={filterStatus === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("rejected")}
                >
                  Rejeitadas ({statusCounts.rejected})
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-smooth"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={
                              rec.priority === 1
                                ? "destructive"
                                : rec.priority === 2
                                ? "default"
                                : "secondary"
                            }
                          >
                            Prioridade {rec.priority}
                          </Badge>
                          <Badge
                            variant={
                              rec.status === "applied"
                                ? "default"
                                : rec.status === "rejected"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {rec.status === "applied" ? "Aplicada" : rec.status === "rejected" ? "Rejeitada" : "Pendente"}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-900 font-medium mb-1">
                          {rec.current_location} → {rec.recommended_location}
                        </p>
                        <p className="text-sm text-neutral-600">{rec.reason}</p>
                        {rec.affinity_note && (
                          <p className="text-xs text-primary-500 mt-2">
                            💡 {rec.affinity_note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-success">
                          +{rec.estimated_improvement_percent?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-neutral-500">melhoria</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  Nenhuma recomendação encontrada para este filtro
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

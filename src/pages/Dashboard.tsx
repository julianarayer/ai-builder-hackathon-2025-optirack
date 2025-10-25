/**
 * Dashboard Page
 * Main analytics and KPI overview
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileUploader } from "@/components/upload/FileUploader";
import { DataPreview } from "@/components/upload/DataPreview";
import { ColumnMappingModal } from "@/components/upload/ColumnMappingModal";
import { Progress } from "@/components/ui/progress";
import { ABCExplanationDialog } from "@/components/ui/abc-explanation-dialog";
import {
  Package,
  Clock,
  Navigation,
  Lightbulb,
  Upload,
  BarChart3,
  LogOut,
  Warehouse,
  User as UserIcon,
  History,
  Info as InfoIcon,
} from "lucide-react";
import { toast } from "sonner";
import optirackLogo from "@/assets/optirack-logo.png";
import type { User } from "@supabase/supabase-js";
import { 
  processWarehouseData, 
  getLatestOptimizationRun, 
  getABCDistribution, 
  getTopSKUs, 
  type AnalysisProgress 
} from "@/services/warehouseAnalysis";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({ stage: '', percent: 0 });
  const [latestRun, setLatestRun] = useState<any>(null);
  const [abcDistribution, setAbcDistribution] = useState<any[]>([]);
  const [topSKUs, setTopSKUs] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<any>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [pendingMappingData, setPendingMappingData] = useState<any>(null);
  const [showABCExplanation, setShowABCExplanation] = useState(false);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate('/login');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleFileSelect = (data: any[], filename: string, mappingData?: any) => {
    setUploadedData(data);
    setFileName(filename);

    // If mapping data available, show confirmation modal
    if (mappingData && mappingData.detected_mapping) {
      setPendingMappingData(mappingData);
      setShowMappingModal(true);
    } else {
      // No detection: proceed with default mapping (fallback)
      setColumnMapping(null);
    }
  };

  const handleConfirmMapping = (finalMapping: { [key: string]: string }) => {
    setColumnMapping(finalMapping);
    setShowMappingModal(false);
    setPendingMappingData(null);
  };

  const handleCancelMapping = () => {
    setShowMappingModal(false);
    setPendingMappingData(null);
    setUploadedData(null);
    setFileName("");
  };

  const handleProcessData = async () => {
    if (!uploadedData || uploadedData.length === 0) {
      toast.error("Nenhum dado para processar");
      return;
    }

    setIsProcessing(true);
    setAnalysisProgress({ stage: 'Iniciando análise...', percent: 0 });

    try {
      const result = await processWarehouseData(
        uploadedData,
        fileName,
        (progress) => {
          setAnalysisProgress(progress);
        },
        columnMapping // Pass column mapping to backend
      );

      if (result.success) {
        console.log('✅ Dashboard: Analysis result received', result);
        
        toast.success(`✅ Análise concluída! ${result.summary?.total_recommendations || 0} recomendações geradas.`, {
          description: `Economia estimada: ${result.summary?.estimated_overall_improvement_percent?.toFixed(1) || 0}% no tempo de picking`
        });

        // Clear upload data
        setUploadedData(null);
        setFileName("");
        setColumnMapping(null);
        setShowUploadDialog(false);
        setIsProcessing(false);

        // Reload dashboard data
        console.log('🔄 Reloading dashboard data...');
        await loadDashboardData();
      } else {
        console.error('❌ Dashboard: Analysis failed', result);
        toast.error('Análise falhou. Tente novamente.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error processing data:', error);
      toast.error("Erro ao processar análise", {
        description: error.message || "Tente novamente ou contate o suporte"
      });
      setIsProcessing(false);
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;

    // Get user's warehouse
    const { data: warehouse } = await supabase
      .from('warehouses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!warehouse) return;

    // Load latest optimization run
    const run = await getLatestOptimizationRun(warehouse.id);
    setLatestRun(run);

    // Load ABC distribution
    const abc = await getABCDistribution(warehouse.id);
    setAbcDistribution(abc);

    // Load top SKUs
    const skus = await getTopSKUs(warehouse.id, 10);
    setTopSKUs(skus);
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50 flex items-center justify-center">
        <div className="shimmer h-12 w-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-primary-300/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
                <img src={optirackLogo} alt="OptiRack Logo" className="h-8 w-8 object-contain" />
              </div>
              <h1 className="text-xl font-bold gradient-text">OptiRack AI</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/historico')}
                className="hidden md:flex"
              >
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Button>
              <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-200">
                  <UserIcon className="h-4 w-4 text-neutral-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-600">Olá,</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-neutral-900">
            Bem-vindo ao OptiRack
          </h2>
          <p className="text-lg text-neutral-600">
            {latestRun 
              ? 'Acompanhe o desempenho das suas análises e otimizações' 
              : 'Comece fazendo o upload dos seus dados de pedidos para receber recomendações inteligentes'}
          </p>
        </div>

        {/* KPI Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div onClick={() => latestRun && navigate('/skus')} className={latestRun ? 'cursor-pointer' : ''}>
            <MetricCard
              icon={Package}
              title="Total SKUs"
              value={latestRun?.total_skus_analyzed?.toString() || "--"}
            />
          </div>
          <MetricCard
            icon={Clock}
            title="Tempo Economizado"
            value={latestRun ? `${latestRun.estimated_time_reduction_percent?.toFixed(1) || 0}%` : "--"}
          />
          <MetricCard
            icon={Navigation}
            title="Distância Reduzida"
            value={latestRun 
              ? `${((latestRun.current_avg_distance_per_order_m || 0) - (latestRun.optimized_avg_distance_per_order_m || 0)).toFixed(0)}m/pedido`
              : "--"}
          />
          <MetricCard
            icon={Lightbulb}
            title="Recomendações"
            value={latestRun ? `${latestRun.recommendations_generated || 0} geradas` : "--"}
          />
        </div>

        {/* Getting Started Section */}
        {!latestRun && (
          <GlassCard className="p-8 bg-gradient-to-br from-primary-100/50 to-primary-200/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold text-neutral-900">
                  Começe Sua Primeira Análise
                </h3>
                <p className="text-neutral-600">
                  Faça upload do seu histórico de pedidos em formato CSV para que nossa IA possa 
                  analisar padrões e gerar recomendações personalizadas de slotting.
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                    Análise ABC automática de velocidade
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                    Identificação de produtos com afinidade
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                    Cálculo de ROI e produtividade
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="group" onClick={() => setShowUploadDialog(true)}>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload de Dados
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/historico')}>
                  <History className="mr-2 h-5 w-5" />
                  Ver Histórico
                </Button>
                <Button size="lg" variant="outline">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Ver Tutorial
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Quick Stats */}
        {latestRun && (
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Distribuição ABC
                </h3>
                <button
                  onClick={() => setShowABCExplanation(true)}
                  className="text-xs font-light text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1"
                >
                  O que é isso?
                  <InfoIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center justify-center h-64">
                {abcDistribution.length > 0 ? (
                  <div className="space-y-3 w-full">
                    {abcDistribution.map(item => (
                      <div key={item.velocity_class} className="flex items-center justify-between">
                        <span className="text-sm font-medium">Classe {item.velocity_class}</span>
                        <span className="text-sm text-neutral-600">{item.sku_count} SKUs ({item.percentage?.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-16 w-16 text-primary-300 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm text-neutral-600">
                      Dados aparecerão aqui após o upload
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Top 10 SKUs Mais Frequentes
              </h3>
              <div className="flex items-center justify-center h-64">
                {topSKUs.length > 0 ? (
                  <div className="space-y-2 w-full">
                    {topSKUs.slice(0, 10).map((sku, index) => (
                      <div key={sku.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{index + 1}. {sku.sku_code}</span>
                        <span className="text-neutral-600">{sku.pick_frequency} picks</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Package className="h-16 w-16 text-primary-300 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm text-neutral-600">
                      Dados aparecerão aqui após o upload
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Upload Button for existing runs */}
        {latestRun && (
          <div className="flex justify-center">
            <Button size="lg" onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-5 w-5" />
              Nova Análise
            </Button>
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload de Dados</DialogTitle>
            <DialogDescription>
              Faça upload do seu histórico de pedidos em formato CSV ou Excel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <FileUploader 
              onFileSelect={handleFileSelect}
              acceptedFormats={['.csv', '.xlsx', '.xls']}
              maxSizeMB={50}
            />
            
            {uploadedData && (
              <>
                <DataPreview data={uploadedData} fileName={fileName} />
                
                {isProcessing && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 font-medium">{analysisProgress.stage}</span>
                      <span className="text-primary-500 font-semibold">{analysisProgress.percent}%</span>
                    </div>
                    <Progress value={analysisProgress.percent} className="h-3" />
                    <p className="text-xs text-neutral-500 text-center">
                      Processando análise completa com IA... Isso pode levar até 60 segundos.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowUploadDialog(false);
                      setUploadedData(null);
                      setFileName("");
                    }}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleProcessData}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processando...' : 'Processar Análise'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Column Mapping Modal */}
      {pendingMappingData && (
        <ColumnMappingModal
          isOpen={showMappingModal}
          detectedMapping={pendingMappingData.detected_mapping}
          confidenceScores={pendingMappingData.confidence_scores}
          overallConfidence={pendingMappingData.overall_confidence}
          missingFields={pendingMappingData.missing_fields || []}
          extraColumns={pendingMappingData.extra_columns || []}
          warnings={pendingMappingData.warnings || []}
          onConfirm={handleConfirmMapping}
          onCancel={handleCancelMapping}
        />
      )}

      {/* ABC Explanation Dialog */}
      <ABCExplanationDialog 
        isOpen={showABCExplanation} 
        onClose={() => setShowABCExplanation(false)} 
      />
    </div>
  );
}

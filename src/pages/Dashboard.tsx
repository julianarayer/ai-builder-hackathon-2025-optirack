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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileUploader } from "@/components/upload/FileUploader";
import { DataPreview } from "@/components/upload/DataPreview";
import { ColumnMappingModal } from "@/components/upload/ColumnMappingModal";
import { Progress } from "@/components/ui/progress";
import { ABCExplanationDialog } from "@/components/ui/abc-explanation-dialog";
import { DistanceAnalysisCard } from "@/components/analytics/DistanceAnalysisCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ImpactSection } from "@/components/dashboard/ImpactSection";
import { ExecutiveSummaryCards } from "@/components/dashboard/ExecutiveSummaryCards";
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
  Download,
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
import { exportDashboardToPDF } from "@/services/pdfExportService";

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
  const [affinityPairs, setAffinityPairs] = useState<any[]>([]);
  const [showAffinityExplanation, setShowAffinityExplanation] = useState(false);
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState<any | null>(null);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);
      
      // Check if onboarding is completed
      const { data: profile } = await supabase
        .from('warehouse_profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();
      
      if (!profile?.onboarding_completed) {
        navigate('/onboarding');
        return;
      }
      
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

  const handleExportPDF = async () => {
    if (!latestRun) {
      toast.error('Nenhuma análise disponível para exportar');
      return;
    }

    toast.loading('Gerando PDF...', { id: 'pdf-export' });
    
    try {
      await exportDashboardToPDF('dashboard-content', {
        user: {
          email: user?.email,
          full_name: user?.user_metadata?.full_name
        },
        latestRun
      });
      
      toast.success('PDF exportado com sucesso!', { id: 'pdf-export' });
    } catch (error) {
      toast.error('Erro ao exportar PDF', { id: 'pdf-export' });
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

    // Load full analytics snapshot
    if (run?.id) {
      const { data: snapshot } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('optimization_run_id', run.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (snapshot) {
        setAnalyticsSnapshot(snapshot);
      }
    }

    // Load affinity pairs from product_affinity table
    const { data: pairs } = await supabase
      .from('product_affinity')
      .select(`
        *,
        sku_a:skus!product_affinity_sku_a_id_fkey(sku_code, sku_name),
        sku_b:skus!product_affinity_sku_b_id_fkey(sku_code, sku_name)
      `)
      .eq('warehouse_id', warehouse.id)
      .order('lift', { ascending: false })
      .limit(10);

    if (pairs) {
      setAffinityPairs(pairs as any[]);
    }
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
        <AppSidebar />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/50">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <img src={optirackLogo} alt="OptiRack" className="h-8 w-8" />
              <span className="text-lg font-medium text-neutral-900">OptiRack</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Botão de Exportação PDF */}
              {latestRun && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  title="Exportar Relatório para PDF"
                  className="hover:bg-primary-50 border-primary-200 text-primary-700 font-medium gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Exportar PDF</span>
                </Button>
              )}
              
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-100/80 hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={() => navigate('/perfil')}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-200">
                  <UserIcon className="h-4 w-4 text-neutral-900" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs text-neutral-500">Olá,</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
                className="hover:bg-neutral-100"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="flex-1 overflow-auto">
      {/* Spacer for fixed header */}
      <div className="h-[56px]" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-3">
          <h2 className="text-4xl font-bold text-neutral-900">
            Bem-vindo ao OptiRack
          </h2>
          <p className="text-lg text-neutral-600">
            {latestRun 
              ? 'Acompanhe o desempenho das suas análises e otimizações' 
              : 'Comece fazendo o upload dos seus dados de pedidos para receber recomendações inteligentes'}
          </p>
        </div>

        {/* Executive Summary - MOVED TO TOP */}
        {latestRun && (
          <ExecutiveSummaryCards
            latestRun={latestRun}
            criticalSKUsCount={latestRun.high_priority_count || 0}
            inventoryValue={latestRun.total_skus_analyzed * 1500 || 0}
            implementationRate={0}
          />
        )}

        {/* KPI Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div onClick={() => latestRun && navigate('/skus')} className={latestRun ? 'cursor-pointer' : ''}>
            <MetricCard
              icon={Package}
              title="Total SKUs Analisados"
              value={latestRun?.total_skus_analyzed?.toString() || "--"}
              variant="pink"
            />
          </div>
          <MetricCard
            icon={Clock}
            title="Tempo Economizado"
            value={latestRun ? `${latestRun.estimated_time_reduction_percent?.toFixed(1) || 0}%` : "--"}
            variant="blue"
          />
          <MetricCard
            icon={Navigation}
            title="Distância Reduzida"
            value={latestRun 
              ? `${((latestRun.current_avg_distance_per_order_m || 0) - (latestRun.optimized_avg_distance_per_order_m || 0)).toFixed(0)}m/pedido`
              : "--"}
            variant="purple"
          />
          <MetricCard
            icon={Lightbulb}
            title="Recomendações Geradas"
            value={latestRun ? `${latestRun.recommendations_generated || 0}` : "--"}
            variant="green"
          />
        </div>

        {/* Getting Started Section */}
        {!latestRun && (
          <GlassCard className="p-8 bg-gradient-to-br from-primary-100/50 to-primary-200/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-medium text-neutral-900">
                  Começe sua primeira análise
                </h3>
                <p className="text-subtle">
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

        {/* Impact Section - NOW BELOW EXECUTIVE SUMMARY */}
        {latestRun && <ImpactSection latestRun={latestRun} />}

        {/* Quick Stats */}
        {latestRun && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl p-6 bg-gradient-to-br from-pink-50 via-pink-50/30 to-white border border-pink-200/50 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 shadow-lg shadow-pink-200">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Distribuição ABC
                  </h3>
                </div>
                <button
                  onClick={() => setShowABCExplanation(true)}
                  className="text-xs font-medium text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-100/60 hover:bg-pink-100"
                >
                  O que é isso?
                  <InfoIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-center h-64 overflow-y-auto">
                {abcDistribution.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-64 h-64">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {(() => {
                          const colors = {
                            A: 'hsl(330, 81%, 60%)',
                            B: 'hsl(217, 91%, 60%)',
                            C: 'hsl(45, 93%, 58%)',
                            D: 'hsl(215, 16%, 47%)'
                          };
                          
                          let currentAngle = -90;
                          
                          return abcDistribution.map((item, index) => {
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
                                  className="transition-opacity hover:opacity-80 cursor-pointer"
                                  onClick={() => navigate(`/distribuicao-abc?classe=${item.velocity_class}`)}
                                />
                                 <text
                                   x={labelX}
                                   y={labelY}
                                   textAnchor="middle"
                                   dominantBaseline="middle"
                                   className="text-[10px] font-medium fill-white"
                                   style={{ pointerEvents: 'none' }}
                                 >
                                   {item.velocity_class}
                                 </text>
                                 <text
                                   x={labelX}
                                   y={labelY + 10}
                                   textAnchor="middle"
                                   dominantBaseline="middle"
                                   className="text-[8px] font-normal fill-white"
                                   style={{ pointerEvents: 'none' }}
                                 >
                                  {percentage.toFixed(0)}%
                                </text>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="ml-6 space-y-3">
                      {abcDistribution.map(item => {
                        const badgeStyles = {
                          A: 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md shadow-pink-200',
                          B: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md shadow-blue-200',
                          C: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md shadow-yellow-200',
                          D: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md shadow-gray-200'
                        };
                        return (
                          <div 
                            key={item.velocity_class} 
                            className="flex items-center justify-between cursor-pointer hover:bg-pink-50 p-3 rounded-xl transition-all hover:shadow-sm border border-transparent hover:border-pink-200"
                            onClick={() => navigate(`/distribuicao-abc?classe=${item.velocity_class}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${badgeStyles[item.velocity_class as keyof typeof badgeStyles]}`}>
                                {item.velocity_class}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-neutral-900">Classe {item.velocity_class}</span>
                                <span className="text-xs text-neutral-500">{item.sku_count} SKUs</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs font-medium">
                              {item.percentage.toFixed(0)}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
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
            </div>

            <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-50 via-blue-50/30 to-white border border-blue-200/50 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-200">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Pares de Afinidade
                  </h3>
                </div>
                <button
                  onClick={() => setShowAffinityExplanation(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-100/60 hover:bg-blue-100"
                >
                  Como funciona?
                  <InfoIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-center h-64 overflow-y-auto">
                {affinityPairs.length > 0 ? (
                  <div className="space-y-3 w-full pr-2">
                    {affinityPairs.map((pair: any, index) => (
                      <div 
                        key={pair.id || index} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100/40 via-blue-50/30 to-white rounded-xl hover:from-blue-100/60 hover:shadow-md transition-all border border-blue-200/40 cursor-pointer group"
                        onClick={() => navigate('/afinidade')}
                      >
                        {/* Lado esquerdo: SKUs e posição */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 shadow-md shadow-blue-200">
                            <span className="text-xs font-bold text-white">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="font-semibold text-sm text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
                              {pair.sku_a?.sku_code || 'N/A'} + {pair.sku_b?.sku_code || 'N/A'}
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                {(pair.support * 100).toFixed(1)}%
                              </Badge>
                              <span>{pair.co_occurrence_count} vezes</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Lado direito: Métricas */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-center px-3 py-2 rounded-lg bg-blue-50 border border-blue-200/50">
                            <div className="text-[10px] font-medium text-neutral-500 uppercase">Lift</div>
                            <div className="text-base font-bold text-blue-600">
                              {pair.lift.toFixed(2)}×
                            </div>
                          </div>
                          <div className="text-center px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200/50">
                            <div className="text-[10px] font-medium text-neutral-500 uppercase">Conf.</div>
                            <div className="text-base font-bold text-neutral-700">
                              {(pair.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Lightbulb className="h-16 w-16 text-primary-300 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm text-neutral-600">
                      Pares de afinidade aparecerão aqui após a análise
                    </p>
                    <p className="text-xs text-neutral-500">
                      Mostra SKUs que aparecem juntos com frequência acima do esperado
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Distance Analysis Card */}
            {analyticsSnapshot && (
              <DistanceAnalysisCard snapshot={analyticsSnapshot} />
            )}
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
      </div>

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

      {/* Affinity Explanation Dialog */}
      <Dialog open={showAffinityExplanation} onOpenChange={setShowAffinityExplanation}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Como funciona a Análise de Afinidade?</DialogTitle>
            <DialogDescription>
              Descobrimos pares de SKUs que aparecem juntos com frequência acima do esperado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">📊 Métricas Calculadas:</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <strong>Support(i,j):</strong> Percentual de pedidos que contêm ambos os SKUs
                  <br/>
                  <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">
                    = pedidos_com_i_e_j / total_pedidos
                  </code>
                </li>
                <li>
                  <strong>Lift:</strong> Força da associação (quanto maior, mais forte a relação)
                  <br/>
                  <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">
                    = support(i,j) / (support(i) × support(j))
                  </code>
                  <br/>
                  <span className="text-xs">• Lift &gt; 1 = associação positiva</span>
                </li>
                <li>
                  <strong>Phi (φ):</strong> Coeficiente de correlação de Matthews [-1, 1]
                  <br/>
                  <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">
                    = (TP×TN - FP×FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))
                  </code>
                  <br/>
                  <span className="text-xs">• φ &gt; 0 = correlação positiva</span>
                </li>
                <li>
                  <strong>Confidence:</strong> Probabilidade de j estar no pedido dado que i está
                  <br/>
                  <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">
                    = support(i,j) / support(i)
                  </code>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🎯 Critérios de Filtragem:</h4>
              <ul className="space-y-1 text-neutral-600">
                <li>✓ Support(i,j) ≥ 2% (aparecem juntos em pelo menos 2% dos pedidos)</li>
                <li>✓ Support(i) ≥ 1% e Support(j) ≥ 1% (SKUs individuais relevantes)</li>
                <li>✓ Ordenação: Lift (desc) → |Phi| (desc)</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900">💡 Como Usar:</h4>
              <p className="text-blue-800 text-xs">
                Produtos com alta afinidade devem ser posicionados próximos no armazém para reduzir 
                a distância de picking. Por exemplo, se "Camiseta Branca M" e "Calça Jeans 42" 
                aparecem juntos em 15% dos pedidos com Lift de 2.5×, posicioná-los próximos 
                pode economizar tempo significativo.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </SidebarProvider>
  );
}

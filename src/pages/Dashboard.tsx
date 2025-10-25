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
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleFileSelect = (data: any[], filename: string) => {
    setUploadedData(data);
    setFileName(filename);
  };

  const handleProcessData = async () => {
    if (!uploadedData || !user) return;

    setIsProcessing(true);
    try {
      // TODO: Implement data processing logic with Supabase
      // This will be implemented in the next phase with Edge Functions
      toast.success(`${uploadedData.length} linhas processadas com sucesso!`);
      setShowUploadDialog(false);
      setUploadedData(null);
      setFileName("");
    } catch (error) {
      toast.error('Erro ao processar dados');
      console.error(error);
    } finally {
      setIsProcessing(false);
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-primary-300/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100">
                <Warehouse className="h-6 w-6 text-primary-400" strokeWidth={1.5} />
              </div>
              <h1 className="text-xl font-bold gradient-text">OptiRack AI</h1>
            </div>

            <div className="flex items-center gap-4">
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
            Comece fazendo o upload dos seus dados de pedidos para receber recomendações inteligentes
          </p>
        </div>

        {/* KPI Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Package}
            title="Total SKUs"
            value="--"
            changePercent={0}
            trend="up"
          />
          <MetricCard
            icon={Clock}
            title="Tempo Economizado"
            value="--"
          />
          <MetricCard
            icon={Navigation}
            title="Distância Reduzida"
            value="--"
          />
          <MetricCard
            icon={Lightbulb}
            title="Recomendações"
            value="--"
          />
        </div>

        {/* Getting Started Section */}
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
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Tutorial
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Distribuição ABC
            </h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <BarChart3 className="h-16 w-16 text-primary-300 mx-auto" strokeWidth={1.5} />
                <p className="text-sm text-neutral-600">
                  Dados aparecerão aqui após o upload
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Top 10 SKUs Mais Frequentes
            </h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <Package className="h-16 w-16 text-primary-300 mx-auto" strokeWidth={1.5} />
                <p className="text-sm text-neutral-600">
                  Dados aparecerão aqui após o upload
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
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
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUploadedData(null);
                      setFileName("");
                    }}
                  >
                    Limpar
                  </Button>
                  <Button 
                    onClick={handleProcessData}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Processar Análise
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

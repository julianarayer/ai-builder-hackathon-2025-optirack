import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { OnboardingStep1 } from "@/components/onboarding/OnboardingStep1";
import { OnboardingStep2 } from "@/components/onboarding/OnboardingStep2";
import { OnboardingStep3 } from "@/components/onboarding/OnboardingStep3";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import optirackLogo from "@/assets/optirack-logo.png";
import type { OperationType, Zone, Policies } from "@/types/warehouse-profile";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1 data
  const [operationType, setOperationType] = useState<OperationType | null>(null);

  // Step 2 data
  const [totalAreaSqm, setTotalAreaSqm] = useState<number>(0);
  const [usefulHeightM, setUsefulHeightM] = useState<number>(0);
  const [approximatePositions, setApproximatePositions] = useState<number>(0);
  const [numSectors, setNumSectors] = useState<number>(0);
  const [zones, setZones] = useState<Zone[]>([]);
  const [policies, setPolicies] = useState<Policies>({
    prioritize_fast_movers: true,
    separate_by_families: false,
  });

  // Step 3 data
  const [layoutImageUrl, setLayoutImageUrl] = useState<string>();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      // Load existing profile if any
      const { data: profile } = await supabase
        .from('warehouse_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Resume from saved step
        setCurrentStep(location.state?.resumeStep || profile.onboarding_step || 1);
        
        // Load saved data
        if (profile.operation_type) setOperationType(profile.operation_type as OperationType);
        if (profile.total_area_sqm) setTotalAreaSqm(profile.total_area_sqm);
        if (profile.useful_height_m) setUsefulHeightM(profile.useful_height_m);
        if (profile.approximate_positions) setApproximatePositions(profile.approximate_positions);
        if (profile.num_sectors) setNumSectors(profile.num_sectors);
        if (profile.zones) setZones(profile.zones as unknown as Zone[]);
        if (profile.layout_image_url) setLayoutImageUrl(profile.layout_image_url);
        
        setPolicies({
          max_picking_to_packing_distance_m: profile.max_picking_to_packing_distance_m || undefined,
          prioritize_fast_movers: profile.prioritize_fast_movers,
          separate_by_families: profile.separate_by_families,
          family_separation_rules: profile.family_separation_rules || undefined,
          blocking_rules: profile.blocking_rules || undefined,
        });
      }
    };

    checkUser();
  }, [navigate, location]);

  const saveProgress = async (step: number, completed: boolean = false) => {
    if (!userId) return;

    const profileData = {
      user_id: userId,
      operation_type: operationType || null,
      total_area_sqm: totalAreaSqm || null,
      useful_height_m: usefulHeightM || null,
      approximate_positions: approximatePositions || null,
      num_sectors: numSectors || null,
      zones: zones as any,
      max_picking_to_packing_distance_m: policies.max_picking_to_packing_distance_m || null,
      prioritize_fast_movers: policies.prioritize_fast_movers,
      separate_by_families: policies.separate_by_families,
      family_separation_rules: policies.family_separation_rules || null,
      blocking_rules: policies.blocking_rules || null,
      layout_image_url: layoutImageUrl || null,
      onboarding_step: step,
      onboarding_completed: completed,
    };

    const { error } = await supabase
      .from('warehouse_profiles')
      .upsert([profileData], { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving progress:', error);
      toast.error('Erro ao salvar progresso');
      return false;
    }

    return true;
  };

  const validateStep1 = () => {
    if (!operationType) {
      toast.error('Por favor, selecione o tipo de operação');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!totalAreaSqm || totalAreaSqm <= 0) {
      toast.error('Por favor, informe a metragem total');
      return false;
    }
    if (!usefulHeightM || usefulHeightM <= 0) {
      toast.error('Por favor, informe a altura útil');
      return false;
    }
    if (!approximatePositions || approximatePositions <= 0) {
      toast.error('Por favor, informe a capacidade de posições');
      return false;
    }
    if (!numSectors || numSectors <= 0) {
      toast.error('Por favor, informe o número de setores');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setIsLoading(true);

    // Validate current step
    if (currentStep === 1 && !validateStep1()) {
      setIsLoading(false);
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      setIsLoading(false);
      return;
    }

    // Save progress
    const nextStep = currentStep + 1;
    const saved = await saveProgress(nextStep);
    
    if (!saved) {
      setIsLoading(false);
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(nextStep);
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    // Save final data and mark as completed
    const saved = await saveProgress(3, true);
    
    if (!saved) {
      setIsLoading(false);
      return;
    }

    toast.success('Configuração concluída! Criando dados de exemplo...');
    
    // Auto-seed demo data after onboarding
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        method: 'POST',
      });
      
      if (error) {
        console.error('Seed error:', error);
        toast.error('Erro ao criar dados de exemplo');
      } else {
        toast.success('🎉 Dados de exemplo criados! Redirecionando para o dashboard...');
      }
    } catch (error) {
      console.error('Seed failed:', error);
    }
    
    navigate('/dashboard');
  };

  const handleSkipAndComplete = async () => {
    setIsLoading(true);
    const saved = await saveProgress(3, true);
    
    if (!saved) {
      setIsLoading(false);
      return;
    }

    toast.success('Configuração concluída! Você pode adicionar o layout depois.');
    navigate('/dashboard');
  };

  const handleStep2Change = (field: string, value: any) => {
    switch (field) {
      case 'totalAreaSqm':
        setTotalAreaSqm(value);
        break;
      case 'usefulHeightM':
        setUsefulHeightM(value);
        break;
      case 'approximatePositions':
        setApproximatePositions(value);
        break;
      case 'numSectors':
        setNumSectors(value);
        break;
      case 'zones':
        setZones(value);
        break;
      case 'policies':
        setPolicies(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <img src={optirackLogo} alt="OptiRack" className="h-8 w-8" />
            <span className="text-lg font-medium text-neutral-900">OptiRack</span>
          </div>
        </div>
      </header>

      <div className="h-[72px]" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <ProgressStepper 
          currentStep={currentStep} 
          totalSteps={3}
          stepLabels={["Tipo de Operação", "Dimensões", "Layout"]}
        />

        <div className="mt-8 glass-card p-8 md:p-12 rounded-3xl">
          {currentStep === 1 && (
            <OnboardingStep1
              operationType={operationType}
              onChange={setOperationType}
            />
          )}

          {currentStep === 2 && (
            <OnboardingStep2
              totalAreaSqm={totalAreaSqm}
              usefulHeightM={usefulHeightM}
              approximatePositions={approximatePositions}
              numSectors={numSectors}
              zones={zones}
              policies={policies}
              onChange={handleStep2Change}
            />
          )}

          {currentStep === 3 && (
            <OnboardingStep3
              layoutImageUrl={layoutImageUrl}
              onChange={(field, value) => setLayoutImageUrl(value)}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-neutral-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              {currentStep === 3 && (
                <Button
                  variant="outline"
                  onClick={handleSkipAndComplete}
                  disabled={isLoading}
                >
                  Pular e concluir
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Concluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;

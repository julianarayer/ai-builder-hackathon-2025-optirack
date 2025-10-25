/**
 * Profile Page
 * User profile and warehouse configuration management
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { User as UserIcon, Warehouse, Save } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { WarehouseProfile } from "@/types/warehouse-profile";
import { OnboardingStep1 } from "@/components/onboarding/OnboardingStep1";
import { OnboardingStep2 } from "@/components/onboarding/OnboardingStep2";
import { OnboardingStep3 } from "@/components/onboarding/OnboardingStep3";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [warehouseProfile, setWarehouseProfile] = useState<WarehouseProfile | null>(null);

  // Personal info state
  const [fullName, setFullName] = useState("");

  // Warehouse profile state
  const [step1Data, setStep1Data] = useState<any>({ operationType: null });
  const [step2Data, setStep2Data] = useState<any>({
    totalAreaSqm: 0,
    usefulHeightM: 0,
    approximatePositions: 0,
    numSectors: 0,
    zones: [],
    policies: {
      prioritize_fast_movers: false,
      separate_by_families: false,
    },
  });
  const [step3Data, setStep3Data] = useState<any>({
    layoutImageUrl: undefined,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      setFullName(session.user.user_metadata?.full_name || "");

      // Load warehouse profile
      const { data: profile } = await supabase
        .from("warehouse_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        setWarehouseProfile(profile as any);

        // Populate form data
        setStep1Data({ operationType: profile.operation_type });
        setStep2Data({
          totalAreaSqm: profile.total_area_sqm || 0,
          usefulHeightM: profile.useful_height_m || 0,
          approximatePositions: profile.approximate_positions || 0,
          numSectors: profile.num_sectors || 0,
          zones: (profile.zones as any) || [],
          policies: {
            max_picking_to_packing_distance_m: profile.max_picking_to_packing_distance_m,
            prioritize_fast_movers: profile.prioritize_fast_movers || false,
            separate_by_families: profile.separate_by_families || false,
            family_separation_rules: profile.family_separation_rules,
            blocking_rules: profile.blocking_rules,
          },
        });
        setStep3Data({
          layoutImageUrl: profile.layout_image_url,
        });
      }

      setIsLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSavePersonalInfo = async () => {
    if (!user) return;

    if (!fullName || fullName.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      toast.success("Nome atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating name:", error);
      toast.error("Erro ao atualizar nome");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWarehouseProfile = async () => {
    if (!user) return;

    // Validation
    if (!step1Data.operationType) {
      toast.error("Selecione o tipo de operação");
      return;
    }

    if (
      step2Data.totalAreaSqm <= 0 ||
      step2Data.usefulHeightM <= 0 ||
      step2Data.approximatePositions <= 0 ||
      step2Data.numSectors <= 0
    ) {
      toast.error("Preencha todos os campos de dimensões com valores válidos");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("warehouse_profiles")
        .update({
          operation_type: step1Data.operationType,
          total_area_sqm: step2Data.totalAreaSqm,
          useful_height_m: step2Data.usefulHeightM,
          approximate_positions: step2Data.approximatePositions,
          num_sectors: step2Data.numSectors,
          zones: step2Data.zones as any,
          max_picking_to_packing_distance_m:
            step2Data.policies.max_picking_to_packing_distance_m,
          prioritize_fast_movers: step2Data.policies.prioritize_fast_movers,
          separate_by_families: step2Data.policies.separate_by_families,
          family_separation_rules: step2Data.policies.family_separation_rules,
          blocking_rules: step2Data.policies.blocking_rules,
          layout_image_url: step3Data.layoutImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Perfil do armazém atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating warehouse profile:", error);
      toast.error("Erro ao atualizar perfil do armazém");
    } finally {
      setIsSaving(false);
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

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-medium text-neutral-900">Meu Perfil</h1>
                <p className="text-lg text-neutral-600">
                  Gerencie suas informações pessoais e configurações do armazém
                </p>
              </div>

              {/* Personal Information */}
              <ProfileSection title="Informações Pessoais" icon={UserIcon}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-neutral-700">
                      Nome Completo
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={isSaving}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-neutral-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-neutral-500">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <Button
                    onClick={handleSavePersonalInfo}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Informações Pessoais
                  </Button>
                </div>
              </ProfileSection>

              {/* Warehouse Profile */}
              <ProfileSection title="Perfil do Armazém" icon={Warehouse}>
                <div className="space-y-6">
                  {/* Step 1: Operation Type */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-900">Tipo de Operação</h4>
                    <OnboardingStep1
                      operationType={step1Data.operationType}
                      onChange={(type) =>
                        setStep1Data({ operationType: type })
                      }
                    />
                  </div>

                  {/* Step 2: Dimensions, Zones, Policies */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-neutral-900">
                      Dimensões e Configurações
                    </h4>
                    <OnboardingStep2
                      totalAreaSqm={step2Data.totalAreaSqm}
                      usefulHeightM={step2Data.usefulHeightM}
                      approximatePositions={step2Data.approximatePositions}
                      numSectors={step2Data.numSectors}
                      zones={step2Data.zones}
                      policies={step2Data.policies}
                      onChange={(field, value) => setStep2Data({ ...step2Data, [field]: value })}
                    />
                  </div>

                  {/* Step 3: Layout */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-900">
                      Layout do Armazém (Opcional)
                    </h4>
                    <OnboardingStep3
                      layoutImageUrl={step3Data.layoutImageUrl}
                      onChange={(field, value) => setStep3Data({ ...step3Data, [field]: value })}
                    />
                  </div>

                  <Button
                    onClick={handleSaveWarehouseProfile}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Perfil do Armazém
                  </Button>
                </div>
              </ProfileSection>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

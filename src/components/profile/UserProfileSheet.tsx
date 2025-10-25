import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { UserIcon, Warehouse, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProfileSection } from "./ProfileSection";
import { OnboardingStep1 } from "../onboarding/OnboardingStep1";
import { OnboardingStep2 } from "../onboarding/OnboardingStep2";
import { OnboardingStep3 } from "../onboarding/OnboardingStep3";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  WarehouseProfile, 
  OperationType, 
  Zone, 
  Policies,
  Step2Data 
} from "@/types/warehouse-profile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface UserProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  warehouseProfile: WarehouseProfile | null;
  onUpdate: () => void;
}

export const UserProfileSheet = ({ 
  open, 
  onOpenChange, 
  user, 
  warehouseProfile,
  onUpdate 
}: UserProfileSheetProps) => {
  const [loading, setLoading] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  
  // Personal info state
  const [fullName, setFullName] = useState("");
  
  // Warehouse profile state
  const [operationType, setOperationType] = useState<OperationType | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data>({
    totalAreaSqm: 0,
    usefulHeightM: 0,
    approximatePositions: 0,
    numSectors: 0,
    zones: [],
    policies: {
      prioritize_fast_movers: true,
      separate_by_families: false,
    }
  });
  const [layoutImageUrl, setLayoutImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open && user) {
      loadUserData();
    }
  }, [open, user, warehouseProfile]);

  const loadUserData = () => {
    // Load personal info
    setFullName(user.user_metadata?.full_name || "");
    
    // Load warehouse profile
    if (warehouseProfile) {
      setOperationType(warehouseProfile.operation_type as OperationType || null);
      
      setStep2Data({
        totalAreaSqm: warehouseProfile.total_area_sqm || 0,
        usefulHeightM: warehouseProfile.useful_height_m || 0,
        approximatePositions: warehouseProfile.approximate_positions || 0,
        numSectors: warehouseProfile.num_sectors || 0,
        zones: (warehouseProfile.zones as Zone[]) || [],
        policies: {
          max_picking_to_packing_distance_m: warehouseProfile.max_picking_to_packing_distance_m,
          prioritize_fast_movers: warehouseProfile.prioritize_fast_movers,
          separate_by_families: warehouseProfile.separate_by_families,
          family_separation_rules: warehouseProfile.family_separation_rules,
          blocking_rules: warehouseProfile.blocking_rules,
        }
      });
      
      setLayoutImageUrl(warehouseProfile.layout_image_url || undefined);
    }
  };

  const handleUpdatePersonalInfo = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    setSavingPersonal(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });

      if (error) throw error;

      toast.success("Nome atualizado com sucesso!");
      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      toast.error("Erro ao atualizar nome");
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleUpdateWarehouseProfile = async () => {
    // Validations
    if (!operationType) {
      toast.error("Selecione o tipo de operação");
      return;
    }

    if (step2Data.totalAreaSqm <= 0) {
      toast.error("Metragem deve ser maior que zero");
      return;
    }

    if (step2Data.usefulHeightM <= 0) {
      toast.error("Altura útil deve ser maior que zero");
      return;
    }

    if (step2Data.approximatePositions <= 0) {
      toast.error("Número de posições deve ser maior que zero");
      return;
    }

    if (step2Data.numSectors <= 0) {
      toast.error("Número de setores deve ser maior que zero");
      return;
    }

    setSavingWarehouse(true);
    try {
      const { error } = await supabase
        .from('warehouse_profiles')
        .update({
          operation_type: operationType,
          total_area_sqm: step2Data.totalAreaSqm,
          useful_height_m: step2Data.usefulHeightM,
          approximate_positions: step2Data.approximatePositions,
          num_sectors: step2Data.numSectors,
          zones: step2Data.zones as any,
          max_picking_to_packing_distance_m: step2Data.policies.max_picking_to_packing_distance_m,
          prioritize_fast_movers: step2Data.policies.prioritize_fast_movers,
          separate_by_families: step2Data.policies.separate_by_families,
          family_separation_rules: step2Data.policies.family_separation_rules,
          blocking_rules: step2Data.policies.blocking_rules,
          layout_image_url: layoutImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Perfil do armazém atualizado com sucesso!");
      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil do armazém");
    } finally {
      setSavingWarehouse(false);
    }
  };

  const handleStep2Change = (field: keyof Step2Data, value: any) => {
    setStep2Data(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Meu Perfil</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Personal Information */}
          <ProfileSection title="Informações Pessoais" icon={UserIcon}>
            <div className="space-y-3">
              <div>
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Digite seu nome"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-neutral-100"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <Button 
                onClick={handleUpdatePersonalInfo}
                disabled={savingPersonal}
                className="w-full"
              >
                {savingPersonal && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Informações Pessoais
              </Button>
            </div>
          </ProfileSection>

          {/* Warehouse Profile */}
          <ProfileSection title="Perfil do Armazém" icon={Warehouse}>
            <Accordion type="multiple" className="space-y-2">
              <AccordionItem value="operation-type" className="border-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  Tipo de Operação
                </AccordionTrigger>
                <AccordionContent>
                  <OnboardingStep1 
                    operationType={operationType}
                    onChange={setOperationType}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dimensions" className="border-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  Dimensões e Configurações
                </AccordionTrigger>
                <AccordionContent>
                  <OnboardingStep2
                    totalAreaSqm={step2Data.totalAreaSqm}
                    usefulHeightM={step2Data.usefulHeightM}
                    approximatePositions={step2Data.approximatePositions}
                    numSectors={step2Data.numSectors}
                    zones={step2Data.zones}
                    policies={step2Data.policies}
                    onChange={handleStep2Change}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="layout" className="border-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  Layout do Armazém
                </AccordionTrigger>
                <AccordionContent>
                  <OnboardingStep3
                    layoutImageUrl={layoutImageUrl}
                    onChange={setLayoutImageUrl}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button 
              onClick={handleUpdateWarehouseProfile}
              disabled={savingWarehouse}
              className="w-full mt-4"
            >
              {savingWarehouse && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Perfil do Armazém
            </Button>
          </ProfileSection>
        </div>
      </SheetContent>
    </Sheet>
  );
};

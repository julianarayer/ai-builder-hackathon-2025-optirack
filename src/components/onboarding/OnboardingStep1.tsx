import { Warehouse, Store } from "lucide-react";
import { RadioCard } from "@/components/ui/radio-card";
import { OperationType } from "@/types/warehouse-profile";

interface OnboardingStep1Props {
  operationType: OperationType | null;
  onChange: (type: OperationType) => void;
}

export const OnboardingStep1 = ({ operationType, onChange }: OnboardingStep1Props) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-3">
          Qual tipo de operação você gerencia?
        </h2>
        <p className="text-neutral-600">
          Escolha o tipo que melhor representa sua operação
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <RadioCard
          icon={Warehouse}
          title="Centro de Distribuição (CD)"
          description="Armazém com foco em distribuição e expedição"
          selected={operationType === 'cd'}
          onClick={() => onChange('cd')}
        />
        
        <RadioCard
          icon={Store}
          title="Loja/Varejo"
          description="Ponto de venda com estoque para atendimento direto"
          selected={operationType === 'retail'}
          onClick={() => onChange('retail')}
        />
      </div>
    </div>
  );
};

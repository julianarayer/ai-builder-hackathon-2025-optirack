import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Zone, Policies } from "@/types/warehouse-profile";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OnboardingStep2Props {
  totalAreaSqm: number;
  usefulHeightM: number;
  approximatePositions: number;
  numSectors: number;
  zones: Zone[];
  policies: Policies;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep2 = ({
  totalAreaSqm,
  usefulHeightM,
  approximatePositions,
  numSectors,
  zones,
  policies,
  onChange
}: OnboardingStep2Props) => {
  
  const getZone = (type: Zone['type']) => zones.find(z => z.type === type);
  
  const updateZone = (type: Zone['type'], updates: Partial<Zone>) => {
    const newZones = zones.map(z => 
      z.type === type ? { ...z, ...updates } : z
    );
    if (!zones.find(z => z.type === type)) {
      newZones.push({ type, enabled: true, ...updates } as Zone);
    }
    onChange('zones', newZones);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-3">
          Dimensões e Restrições
        </h2>
        <p className="text-neutral-600">
          Nos conte mais sobre seu armazém
        </p>
      </div>

      {/* Dimensões Básicas */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Dimensões Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalArea">Metragem total (m²) *</Label>
            <Input
              id="totalArea"
              type="number"
              min="0"
              value={totalAreaSqm || ''}
              onChange={(e) => onChange('totalAreaSqm', parseFloat(e.target.value))}
              placeholder="Ex: 5000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Altura útil (m) *</Label>
            <Input
              id="height"
              type="number"
              min="0"
              step="0.1"
              value={usefulHeightM || ''}
              onChange={(e) => onChange('usefulHeightM', parseFloat(e.target.value))}
              placeholder="Ex: 8.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="positions">Capacidade aproximada de posições *</Label>
            <Input
              id="positions"
              type="number"
              min="0"
              value={approximatePositions || ''}
              onChange={(e) => onChange('approximatePositions', parseInt(e.target.value))}
              placeholder="Ex: 2000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectors">Número de setores/áreas *</Label>
            <Input
              id="sectors"
              type="number"
              min="1"
              value={numSectors || ''}
              onChange={(e) => onChange('numSectors', parseInt(e.target.value))}
              placeholder="Ex: 5"
              required
            />
          </div>
        </div>
      </div>

      {/* Zonas e Equipamentos */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Zonas e Equipamentos</h3>
        
        <div className="space-y-4">
          {/* Manual handling */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="zone-manual"
              checked={getZone('manual')?.enabled || false}
              onCheckedChange={(checked) => 
                updateZone('manual', { enabled: checked as boolean })
              }
            />
            <Label htmlFor="zone-manual" className="cursor-pointer">
              Manuseio manual
            </Label>
          </div>

          {/* Forklift */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="zone-forklift"
                checked={getZone('forklift')?.enabled || false}
                onCheckedChange={(checked) => 
                  updateZone('forklift', { enabled: checked as boolean })
                }
              />
              <Label htmlFor="zone-forklift" className="cursor-pointer">
                Empilhadeira
              </Label>
            </div>
            
            {getZone('forklift')?.enabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="corridor-width">Largura mínima do corredor (m)</Label>
                <Input
                  id="corridor-width"
                  type="number"
                  min="0"
                  step="0.1"
                  value={getZone('forklift')?.min_corridor_width_m || ''}
                  onChange={(e) => 
                    updateZone('forklift', { 
                      enabled: true,
                      min_corridor_width_m: parseFloat(e.target.value) 
                    })
                  }
                  placeholder="Ex: 3.5"
                />
              </div>
            )}
          </div>

          {/* Temperature controlled */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="zone-temp"
                checked={getZone('temperature_controlled')?.enabled || false}
                onCheckedChange={(checked) => 
                  updateZone('temperature_controlled', { enabled: checked as boolean })
                }
              />
              <Label htmlFor="zone-temp" className="cursor-pointer">
                Temperatura controlada
              </Label>
            </div>
            
            {getZone('temperature_controlled')?.enabled && (
              <div className="ml-6 space-y-2">
                <Label>Tipo</Label>
                <RadioGroup
                  value={getZone('temperature_controlled')?.temp_type || 'freezer'}
                  onValueChange={(value) => 
                    updateZone('temperature_controlled', { 
                      enabled: true,
                      temp_type: value as 'freezer' | 'cooler'
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="freezer" id="freezer" />
                    <Label htmlFor="freezer" className="cursor-pointer">Freezer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cooler" id="cooler" />
                    <Label htmlFor="cooler" className="cursor-pointer">Câmara fria</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Políticas Operacionais */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Políticas Operacionais</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-distance">Distância máxima picking → packing (m)</Label>
            <Input
              id="max-distance"
              type="number"
              min="0"
              value={policies.max_picking_to_packing_distance_m || ''}
              onChange={(e) => onChange('policies', {
                ...policies,
                max_picking_to_packing_distance_m: parseFloat(e.target.value)
              })}
              placeholder="Ex: 50 (opcional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fast-movers"
              checked={policies.prioritize_fast_movers}
              onCheckedChange={(checked) => onChange('policies', {
                ...policies,
                prioritize_fast_movers: checked as boolean
              })}
            />
            <Label htmlFor="fast-movers" className="cursor-pointer">
              Priorizar fast-movers
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="separate-families"
                checked={policies.separate_by_families}
                onCheckedChange={(checked) => onChange('policies', {
                  ...policies,
                  separate_by_families: checked as boolean
                })}
              />
              <Label htmlFor="separate-families" className="cursor-pointer">
                Separar produtos por famílias
              </Label>
            </div>
            
            {policies.separate_by_families && (
              <Textarea
                placeholder="Ex: Limpeza longe de alimentos, produtos químicos em área isolada..."
                value={policies.family_separation_rules || ''}
                onChange={(e) => onChange('policies', {
                  ...policies,
                  family_separation_rules: e.target.value
                })}
                rows={3}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blocking-rules">Regras de bloqueio (opcional)</Label>
            <Textarea
              id="blocking-rules"
              placeholder="Ex: Produtos perigosos longe do caixa, inflamáveis em área específica..."
              value={policies.blocking_rules || ''}
              onChange={(e) => onChange('policies', {
                ...policies,
                blocking_rules: e.target.value
              })}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

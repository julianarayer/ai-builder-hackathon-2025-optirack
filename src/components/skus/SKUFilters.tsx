import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";

export interface SKUFiltersState {
  categories: string[];
  velocityClasses: string[];
  velocities: string[];
  hasRecommendation: boolean | null;
}

interface SKUFiltersProps {
  filters: SKUFiltersState;
  onFiltersChange: (filters: SKUFiltersState) => void;
  availableCategories: string[];
}

export const SKUFilters = ({ filters, onFiltersChange, availableCategories }: SKUFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const velocityClasses = ["A", "B", "C", "D"];
  const velocities = ["Fast", "Medium", "Slow"];

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleVelocityClassToggle = (velocityClass: string) => {
    const newClasses = filters.velocityClasses.includes(velocityClass)
      ? filters.velocityClasses.filter((c) => c !== velocityClass)
      : [...filters.velocityClasses, velocityClass];
    onFiltersChange({ ...filters, velocityClasses: newClasses });
  };

  const handleVelocityToggle = (velocity: string) => {
    const newVelocities = filters.velocities.includes(velocity)
      ? filters.velocities.filter((v) => v !== velocity)
      : [...filters.velocities, velocity];
    onFiltersChange({ ...filters, velocities: newVelocities });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      categories: [],
      velocityClasses: [],
      velocities: [],
      hasRecommendation: null,
    });
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.velocityClasses.length +
    filters.velocities.length +
    (filters.hasRecommendation !== null ? 1 : 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-2">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="gap-2">
            <X className="h-4 w-4" />
            Resetar Filtros
          </Button>
        )}
      </div>

      <CollapsibleContent className="space-y-4">
        <div className="grid gap-6 md:grid-cols-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200">
          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-neutral-900">Categorias</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <Label
                    htmlFor={`cat-${category}`}
                    className="text-sm text-neutral-700 cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity Classes (ABC) */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-neutral-900">Classe ABC</Label>
            <div className="space-y-2">
              {velocityClasses.map((vc) => (
                <div key={vc} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vc-${vc}`}
                    checked={filters.velocityClasses.includes(vc)}
                    onCheckedChange={() => handleVelocityClassToggle(vc)}
                  />
                  <Label htmlFor={`vc-${vc}`} className="text-sm text-neutral-700 cursor-pointer">
                    Classe {vc}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-neutral-900">Velocidade</Label>
            <div className="space-y-2">
              {velocities.map((v) => (
                <div key={v} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vel-${v}`}
                    checked={filters.velocities.includes(v)}
                    onCheckedChange={() => handleVelocityToggle(v)}
                  />
                  <Label htmlFor={`vel-${v}`} className="text-sm text-neutral-700 cursor-pointer">
                    {v}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface WarehouseHeatmapProps {
  activeClass: "A" | "B" | "C" | "D";
}

export const WarehouseHeatmap = ({ activeClass }: WarehouseHeatmapProps) => {
  const navigate = useNavigate();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const classColors = {
    A: { bg: "bg-pink-500", light: "bg-pink-100", border: "border-pink-300" },
    B: { bg: "bg-blue-500", light: "bg-blue-100", border: "border-blue-300" },
    C: { bg: "bg-yellow-500", light: "bg-yellow-100", border: "border-yellow-300" },
    D: { bg: "bg-gray-500", light: "bg-gray-100", border: "border-gray-300" },
  };

  const zones = [
    { name: "A", distance: "0-30m", items: "Fast movers", class: "A", x: 20, y: 20, skuCount: 42, picksPerMonth: 8450 },
    { name: "B", distance: "30-60m", items: "Medium", class: "B", x: 50, y: 20, skuCount: 58, picksPerMonth: 4200 },
    { name: "C", distance: "60-90m", items: "Slow movers", class: "C", x: 80, y: 20, skuCount: 35, picksPerMonth: 1850 },
    { name: "D", distance: ">90m", items: "Very slow", class: "D", x: 20, y: 60, skuCount: 22, picksPerMonth: 420 },
    { name: "E", distance: "Backup", items: "Reserve", class: "C", x: 80, y: 60, skuCount: 18, picksPerMonth: 380 },
  ];

  const handleZoneClick = (zone: any) => {
    navigate(`/distribuicao-abc?zona=${zone.name}&classe=${zone.class}`);
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border-2 border-neutral-200">
        <h4 className="text-sm font-medium text-neutral-700 mb-4 flex items-center gap-2">
          🗺️ Mapa de Calor do Armazém
          <Badge variant="outline" size="sm">
            Visualização
          </Badge>
        </h4>

        {/* Warehouse Layout */}
        <div className="relative h-96 bg-white rounded-xl border-2 border-neutral-200 overflow-hidden">
          {/* Dock Area */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-green-100 border-t-2 border-green-300 flex items-center justify-center">
            <span className="text-sm font-medium text-green-700">
              📦 Área de Expedição/Dock
            </span>
          </div>

          {/* Zones - NOW CLICKABLE WITH TOOLTIPS */}
          <TooltipProvider>
            {zones.map((zone) => {
              const colors = classColors[zone.class as keyof typeof classColors];
              const isActive = zone.class === activeClass;
              const isHovered = hoveredZone === zone.name;

              return (
                <Tooltip key={zone.name}>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute rounded-lg border-2 transition-all cursor-pointer ${
                        isActive
                          ? `${colors.bg} ${colors.border} opacity-90 scale-105 shadow-lg`
                          : `${colors.light} ${colors.border} opacity-60 hover:opacity-80 hover:scale-102`
                      }`}
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: "25%",
                        height: "30%",
                      }}
                      onClick={() => handleZoneClick(zone)}
                      onMouseEnter={() => setHoveredZone(zone.name)}
                      onMouseLeave={() => setHoveredZone(null)}
                    >
                      <div className="p-3 h-full flex flex-col items-center justify-center text-center relative">
                        {/* SKU Count Badge */}
                        <Badge 
                          className={`absolute top-1 right-1 text-xs ${
                            isActive ? "bg-white/20 text-white border-white/40" : "bg-neutral-100 text-neutral-700 border-neutral-300"
                          }`}
                        >
                          {zone.skuCount} SKUs
                        </Badge>
                        
                        <div
                          className={`text-2xl font-bold mb-1 ${
                            isActive ? "text-white" : "text-neutral-700"
                          }`}
                        >
                          Zona {zone.name}
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? "text-white/90" : "text-neutral-600"
                          }`}
                        >
                          {zone.distance}
                        </div>
                        <div
                          className={`text-xs font-medium mt-1 ${
                            isActive ? "text-white" : "text-neutral-700"
                          }`}
                        >
                          {zone.items}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white p-3 shadow-lg">
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900">Zona {zone.name}</p>
                      <p className="text-xs text-neutral-600">{zone.skuCount} SKUs</p>
                      <p className="text-xs text-neutral-600">{zone.picksPerMonth.toLocaleString()} picks/mês</p>
                      <p className="text-xs text-primary-600 font-medium">Click para ver detalhes</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Arrows showing movement */}
          {activeClass === "C" && (
            <div className="absolute" style={{ left: "85%", top: "35%" }}>
              <div className="animate-bounce">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  className="text-yellow-500"
                >
                  <path
                    d="M20 5 L20 25 M15 20 L20 25 L25 20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-pink-500" />
            <span>Classe A (0-30m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Classe B (30-60m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Classe C (60-90m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span>Classe D ({">"}90m)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs text-neutral-600 mb-1">Antes</p>
            <p className="text-lg font-bold text-neutral-900">100%</p>
            <p className="text-xs text-neutral-500">distância base</p>
          </div>
          <div className="p-3 rounded-lg bg-primary-50 border border-primary-200">
            <p className="text-xs text-neutral-600 mb-1">Depois</p>
            <p className="text-lg font-bold text-primary-600">-28%</p>
            <p className="text-xs text-neutral-500">distância reduzida</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-xs text-neutral-600 mb-1">Economia</p>
            <p className="text-lg font-bold text-yellow-600">45m/dia</p>
            <p className="text-xs text-neutral-500">tempo economizado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SlotHealth } from "@/types/inventory";
import { AlertTriangle } from "lucide-react";

interface Props {
  data: SlotHealth[];
}

export function SlotCapacityTable({ data }: Props) {
  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600";
    if (health >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (health: number) => {
    if (health >= 80) return <Badge variant="default">Saudável</Badge>;
    if (health >= 50) return <Badge variant="secondary">Atenção</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhum dado de capacidade de slots disponível.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slot</TableHead>
            <TableHead>Zona</TableHead>
            <TableHead>SKU Atual</TableHead>
            <TableHead>ABC</TableHead>
            <TableHead className="text-right">Capacidade</TableHead>
            <TableHead className="text-right">Ocupação</TableHead>
            <TableHead className="text-right">Distância p/ packing (m)</TableHead>
            <TableHead>Saúde do slot</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.slot_id}>
              <TableCell className="font-medium">{item.slot_id}</TableCell>
              <TableCell>
                {item.zone ? (
                  <Badge variant="outline">Zona {item.zone}</Badge>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </TableCell>
              <TableCell className="text-xs">
                {item.sku_code || <span className="text-neutral-400">Vazio</span>}
              </TableCell>
              <TableCell>
                {item.sku_abc_class ? (
                  <Badge variant={item.sku_abc_class === 'A' ? 'default' : 'secondary'}>
                    {item.sku_abc_class}
                  </Badge>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">{item.capacity}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2">
                  <Progress value={item.occupied_pct} className="w-16" />
                  <span className="text-xs">{item.occupied_pct.toFixed(0)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {item.distance_to_pack?.toFixed(1) || '—'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getHealthColor(item.slot_health)}`}>
                    {item.slot_health.toFixed(0)}
                  </span>
                  {getHealthBadge(item.slot_health)}
                  {item.slot_health < 50 && item.distance_to_pack && item.distance_to_pack < 30 && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" aria-label="Slot premium mal utilizado" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

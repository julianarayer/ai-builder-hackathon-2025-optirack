import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ReplenishmentNeeds } from "@/types/inventory";
import { AlertCircle, ShoppingCart, Package } from "lucide-react";

interface Props {
  data: ReplenishmentNeeds[];
}

export function ReplenishmentNeedsTable({ data }: Props) {
  const getActionBadge = (action: ReplenishmentNeeds['action']) => {
    const config = {
      'comprar': { variant: 'destructive' as const, icon: ShoppingCart, label: 'Comprar' },
      'reabastecer': { variant: 'secondary' as const, icon: Package, label: 'Reabastecer' },
      'ok': { variant: 'default' as const, icon: null, label: 'OK' }
    };

    const { variant, icon: Icon, label } = config[action];

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhuma necessidade de reabastecimento identificada.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Demanda/dia</TableHead>
            <TableHead className="text-right">Lead time (dias)</TableHead>
            <TableHead className="text-right">σ demanda</TableHead>
            <TableHead className="text-right">ROP</TableHead>
            <TableHead className="text-right">Safety stock</TableHead>
            <TableHead className="text-right">On hand</TableHead>
            <TableHead className="text-right">Em trânsito</TableHead>
            <TableHead>Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.sku_id}>
              <TableCell className="font-medium">
                {item.sku_code}
                {item.sku_name && <div className="text-xs text-neutral-500">{item.sku_name}</div>}
              </TableCell>
              <TableCell className="text-right">{item.demand_per_day.toFixed(2)}</TableCell>
              <TableCell className="text-right">{item.lead_time_days}</TableCell>
              <TableCell className="text-right">{item.std_demand.toFixed(2)}</TableCell>
              <TableCell className="text-right font-semibold">{item.rop}</TableCell>
              <TableCell className="text-right">{item.safety_stock}</TableCell>
              <TableCell className="text-right">{item.on_hand}</TableCell>
              <TableCell className="text-right">{item.in_transit}</TableCell>
              <TableCell>{getActionBadge(item.action)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

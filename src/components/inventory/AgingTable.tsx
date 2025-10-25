import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AgingItem } from "@/types/inventory";
import { AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";

interface Props {
  data: AgingItem[];
}

export function AgingTable({ data }: Props) {
  const getRiskBadge = (risk: AgingItem['risk_level']) => {
    const config = {
      'alto': { variant: 'destructive' as const, label: 'Alto risco' },
      'médio': { variant: 'secondary' as const, label: 'Médio risco' },
      'baixo': { variant: 'default' as const, label: 'Baixo risco' }
    };

    const { variant, label } = config[risk];

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <AlertTriangle className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhum item em risco de aging ou validade identificado. Parabéns!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Dias sem movimento</TableHead>
            <TableHead>Última movimentação</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Nível de risco</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={`${item.sku_id}-${item.lot}`}>
              <TableCell className="font-medium">
                {item.sku_code}
                {item.sku_name && <div className="text-xs text-neutral-500">{item.sku_name}</div>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  {item.days_without_movement}
                </div>
              </TableCell>
              <TableCell>
                {item.last_movement 
                  ? format(new Date(item.last_movement), 'dd/MM/yyyy')
                  : <span className="text-neutral-400">Nunca</span>
                }
              </TableCell>
              <TableCell>{item.lot || <span className="text-neutral-400">—</span>}</TableCell>
              <TableCell>
                {item.expiry_date 
                  ? format(new Date(item.expiry_date), 'dd/MM/yyyy')
                  : <span className="text-neutral-400">—</span>
                }
              </TableCell>
              <TableCell>{getRiskBadge(item.risk_level)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

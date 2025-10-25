import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PickfaceHealth } from "@/types/inventory";
import { Package } from "lucide-react";

interface Props {
  data: PickfaceHealth[];
  onCreateTask: (skuId: string, qty: number) => void;
}

export function PickfaceHealthTable({ data, onCreateTask }: Props) {
  const getStatusBadge = (status: PickfaceHealth['status']) => {
    const variants = {
      'ok': 'default',
      'reabastecer': 'secondary',
      'crítico': 'destructive'
    };

    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const getAbcBadge = (abcClass: string) => {
    return (
      <Badge variant={abcClass === 'A' ? 'default' : 'secondary'}>
        {abcClass}
      </Badge>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhum dado de estoque disponível. Importe dados CSV ou aguarde sincronização.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>ABC</TableHead>
            <TableHead className="text-right">On hand</TableHead>
            <TableHead className="text-right">Alocado</TableHead>
            <TableHead className="text-right">Disponível</TableHead>
            <TableHead className="text-right">Min/Max pick-face</TableHead>
            <TableHead className="text-right">DoC (dias)</TableHead>
            <TableHead className="text-right">Reposição sugerida</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.sku_id}>
              <TableCell className="font-medium">
                {item.sku_code}
                {item.sku_name && <div className="text-xs text-neutral-500">{item.sku_name}</div>}
              </TableCell>
              <TableCell>{getAbcBadge(item.abc_class)}</TableCell>
              <TableCell className="text-right">{item.on_hand}</TableCell>
              <TableCell className="text-right">{item.allocated}</TableCell>
              <TableCell className="text-right">{item.available}</TableCell>
              <TableCell className="text-right">{item.pickface_min} / {item.pickface_max}</TableCell>
              <TableCell className="text-right">
                {item.doc !== null ? item.doc.toFixed(1) : '—'}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {item.replenishment_suggested > 0 ? item.replenishment_suggested : '—'}
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                {item.replenishment_suggested > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCreateTask(item.sku_id, item.replenishment_suggested)}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Gerar tarefa
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Package, ShoppingCart, Gauge, TrendingDown } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface Props {
  itemsToReplenish: number;
  itemsToPurchase: number;
  avgSlotUtilization: number;
  slowMovers: number;
}

export function InventoryKPICards({
  itemsToReplenish,
  itemsToPurchase,
  avgSlotUtilization,
  slowMovers
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={Package}
        title="Itens para reabastecer"
        value={itemsToReplenish.toString()}
      />
      <MetricCard
        icon={ShoppingCart}
        title="Itens para comprar"
        value={itemsToPurchase.toString()}
      />
      <MetricCard
        icon={Gauge}
        title="Utilização média dos slots"
        value={`${avgSlotUtilization.toFixed(0)}%`}
      />
      <MetricCard
        icon={TrendingDown}
        title="Slow/dead movers"
        value={slowMovers.toString()}
      />
    </div>
  );
}

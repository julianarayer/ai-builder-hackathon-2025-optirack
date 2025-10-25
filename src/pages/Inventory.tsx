import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InventoryKPICards } from "@/components/inventory/InventoryKPICards";
import { PickfaceHealthTable } from "@/components/inventory/PickfaceHealthTable";
import { ReplenishmentNeedsTable } from "@/components/inventory/ReplenishmentNeedsTable";
import { SlotCapacityTable } from "@/components/inventory/SlotCapacityTable";
import { AgingTable } from "@/components/inventory/AgingTable";
import { TasksQueueTable } from "@/components/inventory/TasksQueueTable";
import {
  getPickfaceHealth,
  getReplenishmentNeeds,
  getSlotHealth,
  getAgingItems,
  getTasks,
  createReplenishmentTask
} from "@/services/inventoryService";
import { seedDemoData } from "@/services/demoDataService";
import { Upload, AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Inventory() {
  const navigate = useNavigate();
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    itemsToReplenish: 0,
    itemsToPurchase: 0,
    avgSlotUtilization: 0,
    slowMovers: 0
  });

  const [pickfaceHealth, setPickfaceHealth] = useState([]);
  const [replenishmentNeeds, setReplenishmentNeeds] = useState([]);
  const [slotHealth, setSlotHealth] = useState([]);
  const [agingItems, setAgingItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: warehouse } = await supabase
        .from('warehouses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!warehouse) {
        toast.error('Armazém não encontrado');
        return;
      }

      setWarehouseId(warehouse.id);

      const [pickface, replenishment, slots, aging, tasksList] = await Promise.all([
        getPickfaceHealth(warehouse.id),
        getReplenishmentNeeds(warehouse.id),
        getSlotHealth(warehouse.id),
        getAgingItems(warehouse.id),
        getTasks(warehouse.id)
      ]);

      setPickfaceHealth(pickface as any);
      setReplenishmentNeeds(replenishment as any);
      setSlotHealth(slots as any);
      setAgingItems(aging as any);
      setTasks(tasksList as any);

      const itemsToReplenish = pickface.filter(p => p.status !== 'ok').length;
      const itemsToPurchase = replenishment.filter(r => r.action === 'comprar').length;
      const avgSlotUtilization = slots.length > 0
        ? slots.reduce((sum, s) => sum + s.occupied_pct, 0) / slots.length
        : 0;
      const slowMovers = aging.length;

      setKpis({
        itemsToReplenish,
        itemsToPurchase,
        avgSlotUtilization,
        slowMovers
      });

    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Erro ao carregar dados de estoque');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReplenishmentTask = async (skuId: string, qty: number) => {
    if (!warehouseId) return;

    try {
      await createReplenishmentTask(warehouseId, skuId, qty);
      toast.success('Tarefa de reabastecimento criada!');
      loadData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      await seedDemoData();
      toast.success('Dados de demonstração criados com sucesso!');
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      console.error('Error seeding demo data:', error);
      toast.error('Erro ao criar dados de demonstração');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-primary-50 via-white to-neutral-50">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-neutral-600">Carregando dados de estoque...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium text-neutral-900">Estoque (light)</h1>
              <p className="text-neutral-600 mt-1">
                Supervisão enxuta e decisões de reabastecimento
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSeedDemoData} disabled={seeding}>
                <Database className="h-4 w-4 mr-2" />
                {seeding ? 'Criando...' : 'Criar dados demo'}
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </div>
          </div>

          {pickfaceHealth.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum dado de estoque encontrado. Para começar, importe dados via CSV ou aguarde a sincronização automática.
              </AlertDescription>
            </Alert>
          )}

          <InventoryKPICards {...kpis} />

          <Tabs defaultValue="pickface" className="flex-1">
            <TabsList>
              <TabsTrigger value="pickface">Saúde do pick-face</TabsTrigger>
              <TabsTrigger value="replenishment">Reabastecer / Comprar</TabsTrigger>
              <TabsTrigger value="capacity">Capacidade & ocupação</TabsTrigger>
              <TabsTrigger value="aging">Aging & validade</TabsTrigger>
              <TabsTrigger value="tasks">Exceções & tarefas</TabsTrigger>
            </TabsList>

            <TabsContent value="pickface">
              <GlassCard className="p-6">
                <PickfaceHealthTable 
                  data={pickfaceHealth}
                  onCreateTask={handleCreateReplenishmentTask}
                />
              </GlassCard>
            </TabsContent>

            <TabsContent value="replenishment">
              <GlassCard className="p-6">
                <ReplenishmentNeedsTable data={replenishmentNeeds} />
              </GlassCard>
            </TabsContent>

            <TabsContent value="capacity">
              <GlassCard className="p-6">
                <SlotCapacityTable data={slotHealth} />
              </GlassCard>
            </TabsContent>

            <TabsContent value="aging">
              <GlassCard className="p-6">
                <AgingTable data={agingItems} />
              </GlassCard>
            </TabsContent>

            <TabsContent value="tasks">
              <GlassCard className="p-6">
                <TasksQueueTable data={tasks} onRefresh={loadData} />
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskQueue } from "@/types/inventory";
import { updateTaskStatus } from "@/services/inventoryService";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, Download } from "lucide-react";
import { format } from "date-fns";

interface Props {
  data: TaskQueue[];
  onRefresh: () => void;
}

export function TasksQueueTable({ data, onRefresh }: Props) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleStatusChange = async (taskId: string, newStatus: TaskQueue['status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Status da tarefa atualizado!');
      onRefresh();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status: TaskQueue['status']) => {
    const config = {
      'pendente': { variant: 'secondary' as const, label: 'Pendente' },
      'em_andamento': { variant: 'default' as const, label: 'Em andamento' },
      'concluído': { variant: 'default' as const, label: 'Concluído' },
      'cancelado': { variant: 'destructive' as const, label: 'Cancelado' }
    };

    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    const config = {
      1: { variant: 'destructive' as const, label: 'Alta' },
      2: { variant: 'secondary' as const, label: 'Média' },
      3: { variant: 'default' as const, label: 'Baixa' }
    };

    return <Badge variant={config[priority as keyof typeof config].variant}>
      {config[priority as keyof typeof config].label}
    </Badge>;
  };

  const filteredData = data.filter(task => {
    if (filterType !== 'all' && task.task_type !== filterType) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Tipo', 'SKU', 'Quantidade', 'Prioridade', 'Status', 'Responsável', 'Criado em'];
    const rows = filteredData.map(task => [
      task.id,
      task.task_type,
      (task as any).sku?.sku_code || '—',
      task.qty || '—',
      task.priority,
      task.status,
      task.assignee || '—',
      format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarefas_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="reabastecer">Reabastecer</SelectItem>
              <SelectItem value="reposicionar">Reposicionar</SelectItem>
              <SelectItem value="contar">Contar</SelectItem>
              <SelectItem value="comprar">Comprar</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluído">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          Nenhuma tarefa encontrada com os filtros aplicados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>De → Para</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium capitalize">{task.task_type}</TableCell>
                  <TableCell className="text-xs">
                    {(task as any).sku?.sku_code || <span className="text-neutral-400">—</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {task.from_slot && task.to_slot 
                      ? `${task.from_slot} → ${task.to_slot}`
                      : <span className="text-neutral-400">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">{task.qty || '—'}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell className="text-xs">{task.assignee || <span className="text-neutral-400">—</span>}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {task.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(task.id, 'em_andamento')}
                          title="Iniciar"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'em_andamento' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(task.id, 'concluído')}
                          title="Concluir"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {task.status !== 'concluído' && task.status !== 'cancelado' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(task.id, 'cancelado')}
                          title="Cancelar"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

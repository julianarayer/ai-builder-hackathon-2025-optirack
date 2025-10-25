/**
 * DataPreview Component
 * Shows a preview of uploaded data before processing
 */

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";

interface DataPreviewProps {
  data: any[];
  fileName: string;
}

export function DataPreview({ data, fileName }: DataPreviewProps) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const previewData = data.slice(0, 10);
  
  // Calculate stats
  const uniqueSKUs = new Set(data.map(row => row.sku_code || row.SKU || row.sku)).size;
  const totalOrders = new Set(data.map(row => row.order_id || row.pedido_id || row.order)).size;
  
  // Try to detect date range
  const dateField = columns.find(col => 
    col.toLowerCase().includes('date') || 
    col.toLowerCase().includes('data')
  );
  
  let dateRange = '';
  if (dateField && data.length > 0) {
    const dates = data.map(row => new Date(row[dateField])).sort();
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    if (!isNaN(firstDate.getTime()) && !isNaN(lastDate.getTime())) {
      dateRange = `${firstDate.toLocaleDateString('pt-BR')} - ${lastDate.toLocaleDateString('pt-BR')}`;
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Preview dos Dados
            </h3>
            <p className="text-sm text-neutral-600">
              Arquivo: {fileName}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">
              {data.length} linhas
            </Badge>
            <Badge variant="default">
              {uniqueSKUs} SKUs
            </Badge>
            {totalOrders > 0 && (
              <Badge variant="default">
                {totalOrders} pedidos
              </Badge>
            )}
          </div>
        </div>

        {dateRange && (
          <div className="glass-card bg-primary-50/50 border border-primary-300/20 p-3 rounded-xl">
            <p className="text-sm text-neutral-700">
              <span className="font-semibold">Período:</span> {dateRange}
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-primary-300/20">
          <table className="w-full">
            <thead className="glass-card bg-primary-100/50">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-300/10">
              {previewData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-primary-50/30 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-3 text-sm text-neutral-900 whitespace-nowrap"
                    >
                      {row[col]?.toString() || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length > 10 && (
          <p className="text-xs text-neutral-600 text-center">
            Mostrando 10 de {data.length} linhas
          </p>
        )}
      </GlassCard>
    </div>
  );
}

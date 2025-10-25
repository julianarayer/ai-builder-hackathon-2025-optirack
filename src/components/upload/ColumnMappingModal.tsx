/**
 * ColumnMappingModal Component
 * Displays AI-detected column mapping for user confirmation/editing
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnMappingModalProps {
  isOpen: boolean;
  detectedMapping: { [csvCol: string]: string };
  confidenceScores: { [csvCol: string]: number };
  overallConfidence: number;
  missingFields: string[];
  extraColumns: string[];
  warnings: string[];
  onConfirm: (finalMapping: { [csvCol: string]: string }) => void;
  onCancel: () => void;
}

const STANDARD_FIELDS = [
  { value: 'order_id', label: 'ID do Pedido' },
  { value: 'order_date', label: 'Data do Pedido' },
  { value: 'sku_code', label: 'Código SKU' },
  { value: 'sku_name', label: 'Nome do Produto' },
  { value: 'category', label: 'Categoria' },
  { value: 'quantity', label: 'Quantidade' },
  { value: 'current_location', label: 'Localização Atual' },
  { value: 'weight_kg', label: 'Peso (kg)' }
];

export function ColumnMappingModal({
  isOpen,
  detectedMapping,
  confidenceScores,
  overallConfidence,
  missingFields,
  extraColumns,
  warnings,
  onConfirm,
  onCancel
}: ColumnMappingModalProps) {
  const [editedMapping, setEditedMapping] = useState(detectedMapping);

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.9) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (score >= 0.7) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.9) return <Badge variant="default" className="bg-green-100 text-green-700">Alta</Badge>;
    if (score >= 0.7) return <Badge variant="default" className="bg-yellow-100 text-yellow-700">Média</Badge>;
    return <Badge variant="default" className="bg-red-100 text-red-700">Baixa</Badge>;
  };

  const getStarRating = (confidence: number) => {
    const stars = Math.round(confidence * 5);
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i < stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
            )}
          />
        ))}
      </div>
    );
  };

  const handleMappingChange = (csvColumn: string, newStandardField: string) => {
    setEditedMapping(prev => ({
      ...prev,
      [csvColumn]: newStandardField
    }));
  };

  const handleConfirm = () => {
    onConfirm(editedMapping);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirme o Mapeamento de Colunas</DialogTitle>
          <DialogDescription>
            A IA detectou automaticamente as colunas do seu CSV. Revise e confirme antes de processar.
          </DialogDescription>
        </DialogHeader>

        {/* Overall Confidence */}
        <div className="glass-card p-4 rounded-2xl border border-primary-300/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-neutral-700">Confiança Geral:</div>
              {getStarRating(overallConfidence)}
              <span className="text-lg font-bold text-primary-500">
                {(overallConfidence * 100).toFixed(0)}%
              </span>
            </div>
            {overallConfidence >= 0.9 && (
              <Badge variant="default" className="bg-green-100 text-green-700">
                Excelente Detecção
              </Badge>
            )}
          </div>
        </div>

        {/* Mapping Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700">Mapeamento Detectado</h3>
          
          <div className="space-y-2">
            {Object.entries(editedMapping).map(([csvCol, standardField]) => (
              <div
                key={csvCol}
                className="glass-card p-3 rounded-xl border border-neutral-200/50 hover:border-primary-300/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* CSV Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-neutral-100 px-2 py-1 rounded text-neutral-700 truncate">
                        {csvCol}
                      </code>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-neutral-400">→</div>

                  {/* Standard Field Selector */}
                  <div className="flex-1">
                    <Select
                      value={standardField}
                      onValueChange={(value) => handleMappingChange(csvCol, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STANDARD_FIELDS.map(field => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center gap-2 min-w-[100px]">
                    {getConfidenceIcon(confidenceScores[csvCol])}
                    <span className="text-xs font-semibold text-neutral-600">
                      {(confidenceScores[csvCol] * 100).toFixed(0)}%
                    </span>
                    {getConfidenceBadge(confidenceScores[csvCol])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Columns Warning */}
        {extraColumns.length > 0 && (
          <div className="glass-card border border-yellow-200 bg-yellow-50/50 p-3 rounded-2xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-yellow-700">
                  {extraColumns.length} coluna(s) não será(ão) usada(s):
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {extraColumns.map(col => (
                    <code key={col} className="text-xs bg-yellow-100 px-2 py-0.5 rounded text-yellow-800">
                      {col}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Missing Fields Warning */}
        {missingFields.length > 0 && (
          <div className="glass-card border border-red-200 bg-red-50/50 p-3 rounded-2xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-red-700">
                  Campos obrigatórios ausentes:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {missingFields.map(field => (
                    <code key={field} className="text-xs bg-red-100 px-2 py-0.5 rounded text-red-800">
                      {field}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, i) => (
              <div key={i} className="glass-card border border-blue-200 bg-blue-50/50 p-3 rounded-2xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">{warning}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} size="lg">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            size="lg"
            disabled={missingFields.length > 0}
          >
            Confirmar e Processar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

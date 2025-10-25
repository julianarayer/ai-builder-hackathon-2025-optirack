/**
 * FileUploader Component
 * Handles CSV and Excel file uploads with drag-and-drop
 */

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface FileUploaderProps {
  onFileSelect: (data: any[], fileName: string, mappingData?: any) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export function FileUploader({
  onFileSelect,
  acceptedFormats = ['.csv', '.xlsx', '.xls'],
  maxSizeMB = 50
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedFormats.includes(fileExtension)) {
      return `Formato não suportado. Use: ${acceptedFormats.join(', ')}`;
    }
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (err) {
          reject(new Error('Erro ao processar arquivo'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsBinaryString(file);
    });
  };

  const detectColumns = async (columns: string[], sampleRows: any[]) => {
    try {
      console.log('🔍 Calling auto-detect-columns with:', { columns, sampleCount: sampleRows.length });
      
      const { data, error } = await supabase.functions.invoke('auto-detect-columns', {
        body: { csvColumns: columns, sampleRows }
      });

      if (error) {
        console.error('Column detection error:', error);
        return null;
      }

      console.log('✅ Column detection result:', data);
      return data;
    } catch (err) {
      console.error('Error detecting columns:', err);
      return null;
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setError("");
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setSelectedFile(file);
      const parsedData = await parseFile(file);
      
      // Extract columns and samples for auto-detection
      if (parsedData.length > 0) {
        const columns = Object.keys(parsedData[0]);
        const sampleRows = parsedData.slice(0, 3);
        
        // Call auto-detection
        const mappingData = await detectColumns(columns, sampleRows);
        
        // Pass mapping data to callback
        onFileSelect(parsedData, file.name, mappingData);
      } else {
        onFileSelect(parsedData, file.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
      setSelectedFile(null);
    }
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "glass-card border-2 border-dashed rounded-3xl p-8 transition-all duration-300",
          isDragging 
            ? "border-primary-400 bg-primary-50/50 scale-[1.02]" 
            : "border-primary-300/30 hover:border-primary-300/50"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
            isDragging ? "bg-primary-200" : "bg-primary-100"
          )}>
            <Upload className="h-8 w-8 text-primary-400" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-semibold text-neutral-900">
              Arraste seu arquivo aqui
            </p>
            <p className="text-sm text-neutral-600">
              ou clique para selecionar
            </p>
            <p className="text-xs text-neutral-500">
              Formatos aceitos: {acceptedFormats.join(', ')} (máx. {maxSizeMB}MB)
            </p>
          </div>

          <label htmlFor="file-input">
            <Button type="button" variant="outline" size="lg" asChild>
              <span className="cursor-pointer">
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Selecionar Arquivo
              </span>
            </Button>
          </label>
          <input
            id="file-input"
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card border border-red-200 bg-red-50/50 p-4 rounded-2xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !error && (
        <div className="glass-card p-4 rounded-2xl border border-primary-300/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                <FileSpreadsheet className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-neutral-600">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

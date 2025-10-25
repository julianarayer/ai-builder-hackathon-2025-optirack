import { useState, useCallback } from "react";
import { Upload, ImageIcon, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep3Props {
  layoutImageUrl?: string;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep3 = ({
  layoutImageUrl,
  onChange
}: OnboardingStep3Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(layoutImageUrl || null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange('layoutImageUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange('layoutImageUrl', null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-3">
          Layout de Referência
        </h2>
        <p className="text-neutral-600">
          Este passo é opcional, mas ajuda a entender melhor sua operação
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center transition-smooth
              ${isDragging 
                ? 'border-primary-400 bg-primary-50/50' 
                : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-neutral-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Arraste ou clique para fazer upload
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  PNG, JPG ou PDF da planta do seu armazém
                </p>
              </div>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileInput}
              />
              
              <Button 
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Selecionar arquivo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-neutral-100 p-4">
              <img 
                src={preview} 
                alt="Layout preview" 
                className="w-full h-auto max-h-96 object-contain rounded-xl"
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={removeImage}
              >
                Remover
              </Button>
              <Button
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Trocar arquivo
              </Button>
            </div>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/png,image/jpeg,application/pdf"
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-neutral-500 flex items-center justify-center gap-2">
          <SkipForward className="w-4 h-4" />
          Você pode pular este passo e adicionar o layout depois nas configurações
        </p>
      </div>
    </div>
  );
};

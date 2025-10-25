import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Package, 
  Box, 
  Archive, 
  AlertTriangle, 
  CheckCircle2,
  Zap
} from "lucide-react";

interface ABCExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ABCExplanationDialog({ isOpen, onClose }: ABCExplanationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <TrendingUp className="h-7 w-7 text-primary-500" />
            <span className="gradient-text">Distribuição ABC</span>
          </DialogTitle>
          <p className="text-sm text-neutral-600 mt-2">
            Entenda como essa métrica pode ajudar a sua gestão de armazenamento!
          </p>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* O Conceito */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-500" />
              <h3 className="text-lg font-bold text-neutral-900">
                O Conceito (Princípio de Pareto 80-20)
              </h3>
            </div>
            <div className="bg-gradient-to-br from-primary-100/50 to-primary-200/30 p-6 rounded-2xl border border-primary-300/30">
              <p className="text-center text-lg font-semibold text-neutral-900">
                <span className="gradient-text text-xl">"Análise ABC"</span> é uma técnica que classifica produtos por{" "}
                <span className="font-bold text-primary-600">importância/frequência</span> usando a regra 80-20:
              </p>
              <p className="text-center mt-4 text-2xl font-bold gradient-text">
                20% dos produtos geram 80% do movimento
              </p>
            </div>
          </section>

          {/* As 4 Classes */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-500" />
              As 4 Classes
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Classe A */}
              <div className="glass-card p-5 space-y-3 border-2 border-pink-200 hover:border-pink-300 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <Badge className="bg-pink-500 text-white border-0 mb-1">Classe A</Badge>
                      <p className="text-xs text-neutral-600">Alta rotatividade</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pink-600">20%</p>
                    <p className="text-xs text-neutral-500">dos produtos</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200" />
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span>Representam <strong>80% dos pedidos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span>São os "queridinhos" - saem <strong>TODO DIA</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Devem estar perto da expedição</strong> (zona quente)</span>
                  </li>
                </ul>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-600">
                    <strong>Exemplo:</strong> Shampoo, sabonete, café
                  </p>
                </div>
              </div>

              {/* Classe B */}
              <div className="glass-card p-5 space-y-3 border-2 border-blue-200 hover:border-blue-300 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Badge className="bg-blue-500 text-white border-0 mb-1">Classe B</Badge>
                      <p className="text-xs text-neutral-600">Média rotatividade</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">30%</p>
                    <p className="text-xs text-neutral-500">dos produtos</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Representam <strong>15% dos pedidos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Saem com <strong>frequência regular</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Podem estar em <strong>zona intermediária</strong></span>
                  </li>
                </ul>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-600">
                    <strong>Exemplo:</strong> Biscoitos, papel higiênico
                  </p>
                </div>
              </div>

              {/* Classe C */}
              <div className="glass-card p-5 space-y-3 border-2 border-yellow-200 hover:border-yellow-300 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-3 rounded-xl">
                      <Box className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <Badge className="bg-yellow-500 text-white border-0 mb-1">Classe C</Badge>
                      <p className="text-xs text-neutral-600">Baixa rotatividade</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">40%</p>
                    <p className="text-xs text-neutral-500">dos produtos</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200" />
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Representam <strong>4% dos pedidos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Saem <strong>de vez em quando</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Podem ficar <strong>mais longe</strong></span>
                  </li>
                </ul>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-600">
                    <strong>Exemplo:</strong> Produtos de nicho, temporada
                  </p>
                </div>
              </div>

              {/* Classe D */}
              <div className="glass-card p-5 space-y-3 border-2 border-neutral-200 hover:border-neutral-300 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-100 p-3 rounded-xl">
                      <Archive className="h-6 w-6 text-neutral-600" />
                    </div>
                    <div>
                      <Badge className="bg-neutral-500 text-white border-0 mb-1">Classe D</Badge>
                      <p className="text-xs text-neutral-600">Muito baixa rotatividade</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-600">10%</p>
                    <p className="text-xs text-neutral-500">dos produtos</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200" />
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span>Representam <strong>1% dos pedidos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span>Quase <strong>não saem</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span>Ficam <strong>bem longe, no fundo</strong></span>
                  </li>
                </ul>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-600">
                    <strong>Exemplo:</strong> Itens raros, estoque parado
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Por Que Importa */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary-500" />
              Por Que Importa?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-bold text-red-900">Problema</h4>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Se produtos classe A estão <strong>LONGE</strong> → operador caminha quilômetros extras TODO DIA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Se produtos classe D estão <strong>PERTO</strong> → desperdício de espaço nobre</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-200 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-green-900">Solução</h4>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Colocar classe A na <strong>zona quente</strong> (0-30m da expedição) = economia gigante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Colocar classe D no <strong>fundo do armazém</strong> = libera espaço valioso</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exemplo Prático */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-500" />
              Exemplo Prático
            </h3>
            
            <div className="bg-gradient-to-br from-primary-100/50 to-primary-200/30 p-6 rounded-2xl border border-primary-300/30">
              <p className="text-lg font-semibold text-neutral-900 mb-4">
                Armazém com 100 produtos:
              </p>
              <ul className="space-y-3 text-sm text-neutral-700">
                <li className="flex items-start gap-3">
                  <div className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    A
                  </div>
                  <span><strong className="text-pink-600">20 produtos</strong> (classe A) geram <strong>80% dos picks</strong> → DEVEM estar perto</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-neutral-400 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    B-D
                  </div>
                  <span><strong className="text-neutral-600">80 produtos</strong> (B, C, D) geram <strong>20% dos picks</strong> → podem estar mais longe</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-white rounded-xl border-2 border-primary-400">
                <p className="text-center text-sm text-neutral-700">
                  Se você reorganiza apenas esses <strong className="text-primary-600 text-lg">20 produtos classe A</strong>, 
                  <span className="block mt-2 text-xl font-bold gradient-text">
                    economiza 30-40% do tempo total de picking
                  </span>
                  <span className="block mt-1 text-xs text-neutral-500">
                    porque são os que mais se movimentam!
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

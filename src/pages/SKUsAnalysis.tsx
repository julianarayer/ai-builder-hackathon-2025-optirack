/**
 * SKUs Analysis Page
 * Visual breakdown of analyzed SKUs by category
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Package, Grid3x3, Layers } from "lucide-react";
import { toast } from "sonner";
interface CategorySummary {
  category: string;
  count: number;
  percentage: number;
  velocity_breakdown: {
    A: number;
    B: number;
    C: number;
  };
}
interface SKUDetail {
  id: string;
  sku_code: string;
  sku_name: string | null;
  category: string | null;
  velocity_class: string | null;
  pick_frequency: number;
  current_location: string | null;
}
export default function SKUsAnalysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('runId');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<SKUDetail[]>([]);
  const [totalSKUs, setTotalSKUs] = useState(0);
  useEffect(() => {
    loadCategoriesData();
  }, [analysisId]);
  const loadCategoriesData = async () => {
    try {
      setIsLoading(true);

      // Get user's warehouse
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const {
        data: warehouse
      } = await supabase.from('warehouses').select('id').eq('user_id', user.id).single();
      if (!warehouse) {
        toast.error('Armazém não encontrado');
        return;
      }

      // Get SKUs with categories
      const {
        data: skus,
        error
      } = await supabase.from('skus').select('id, sku_code, sku_name, category, velocity_class, pick_frequency, current_location').eq('warehouse_id', warehouse.id).order('pick_frequency', {
        ascending: false
      });
      if (error) {
        console.error('Error loading SKUs:', error);
        toast.error('Erro ao carregar SKUs');
        return;
      }
      if (!skus || skus.length === 0) {
        toast.info('Nenhum SKU encontrado. Faça uma análise primeiro.');
        return;
      }
      setTotalSKUs(skus.length);

      // Group by category
      const categoryMap = new Map<string, SKUDetail[]>();
      skus.forEach(sku => {
        const cat = sku.category || 'Sem Categoria';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, []);
        }
        categoryMap.get(cat)!.push(sku as SKUDetail);
      });

      // Calculate summaries
      const summaries: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, items]) => {
        const velocityBreakdown = {
          A: items.filter(s => s.velocity_class === 'A').length,
          B: items.filter(s => s.velocity_class === 'B').length,
          C: items.filter(s => s.velocity_class === 'C').length
        };
        return {
          category,
          count: items.length,
          percentage: items.length / skus.length * 100,
          velocity_breakdown: velocityBreakdown
        };
      });

      // Sort by count descending
      summaries.sort((a, b) => b.count - a.count);
      setCategories(summaries);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao processar dados');
      setIsLoading(false);
    }
  };
  const handleCategoryClick = async (category: string) => {
    setSelectedCategory(category);

    // Get user's warehouse
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data: warehouse
    } = await supabase.from('warehouses').select('id').eq('user_id', user.id).single();
    if (!warehouse) return;

    // Load SKUs for this category
    const {
      data: skus
    } = await supabase.from('skus').select('id, sku_code, sku_name, category, velocity_class, pick_frequency, current_location').eq('warehouse_id', warehouse.id).eq('category', category === 'Sem Categoria' ? null : category).order('pick_frequency', {
      ascending: false
    });
    setCategoryDetails(skus as SKUDetail[] || []);
  };
  const getVelocityColor = (velocity: string | null) => {
    switch (velocity) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    }
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50 flex items-center justify-center">
        <div className="shimmer h-12 w-48 rounded-2xl" />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-neutral-900">Análise de SKUs por categoria</h1>
            <p className="text-lg text-neutral-600">
              {totalSKUs} SKUs analisados em {categories.length} categorias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary-400" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(cat => <GlassCard key={cat.category} hover onClick={() => handleCategoryClick(cat.category)} className="p-6 cursor-pointer transition-all hover:scale-105">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-5 w-5 text-primary-400" />
                      <h3 className="font-semibold text-lg text-neutral-900 line-clamp-1">
                        {cat.category}
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-primary-500 mb-1">
                      {cat.count}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {cat.percentage.toFixed(1)}% do total
                    </p>
                  </div>
                  <Badge className="bg-primary-100 text-primary-700 border-primary-300">
                    {cat.count} SKUs
                  </Badge>
                </div>

                {/* Velocity Breakdown */}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs font-medium text-neutral-600 mb-2">Distribuição ABC:</p>
                  <div className="flex gap-2">
                    {cat.velocity_breakdown.A > 0 && <Badge className={getVelocityColor('A')}>
                        A: {cat.velocity_breakdown.A}
                      </Badge>}
                    {cat.velocity_breakdown.B > 0 && <Badge className={getVelocityColor('B')}>
                        B: {cat.velocity_breakdown.B}
                      </Badge>}
                    {cat.velocity_breakdown.C > 0 && <Badge className={getVelocityColor('C')}>
                        C: {cat.velocity_breakdown.C}
                      </Badge>}
                  </div>
                </div>
              </div>
            </GlassCard>)}
        </div>

        {/* Category Details Modal */}
        <Dialog open={selectedCategory !== null} onOpenChange={open => !open && setSelectedCategory(null)}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-primary-500" />
                {selectedCategory}
              </DialogTitle>
              <DialogDescription>
                {categoryDetails.length} SKUs nesta categoria
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 sticky top-0 z-10">
                  <tr className="border-b-2 border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Código</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Nome</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Velocidade</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Frequência</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Localização</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryDetails.map((sku, index) => <tr key={sku.id} className={`border-b border-neutral-100 hover:bg-primary-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}>
                      <td className="py-4 px-4 text-sm font-medium text-neutral-900">{sku.sku_code}</td>
                      <td className="py-4 px-4 text-sm text-neutral-700">{sku.sku_name || '--'}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge className={getVelocityColor(sku.velocity_class)}>
                          {sku.velocity_class || '--'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-right text-neutral-900 font-semibold">
                        {sku.pick_frequency}
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-600">{sku.current_location || '--'}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            {categoryDetails.length > 0 && <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Total SKUs</p>
                    <p className="text-2xl font-bold text-primary-600">{categoryDetails.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Picks Totais</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {categoryDetails.reduce((sum, sku) => sum + sku.pick_frequency, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Picks Médios</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {Math.round(categoryDetails.reduce((sum, sku) => sum + sku.pick_frequency, 0) / categoryDetails.length)}
                    </p>
                  </div>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {!isLoading && categories.length === 0 && <GlassCard className="p-12 text-center">
            <Grid3x3 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Nenhum SKU Encontrado
            </h3>
            <p className="text-neutral-600 mb-6">
              Faça uma análise primeiro para visualizar seus SKUs por categoria.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Ir para Dashboard
            </Button>
          </GlassCard>}
      </div>
    </div>;
}
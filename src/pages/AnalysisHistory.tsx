import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { getAnalysesByMonth, getCalendarData } from "@/services/warehouseAnalysis";
import { AnalysisCalendar } from "@/components/history/AnalysisCalendar";
import { AnalysisList } from "@/components/history/AnalysisList";
import { PeriodStats } from "@/components/history/PeriodStats";

export default function AnalysisHistory() {
  const navigate = useNavigate();
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Get user's warehouse
      const { data: warehouse } = await supabase
        .from('warehouses')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (warehouse) {
        setWarehouseId(warehouse.id);
      } else {
        toast.error('Nenhum armazém encontrado');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (warehouseId) {
      loadMonthData();
    }
  }, [warehouseId, currentDate]);

  const loadMonthData = async () => {
    if (!warehouseId) return;

    setIsLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const [monthAnalyses, calendar] = await Promise.all([
      getAnalysesByMonth(warehouseId, year, month),
      getCalendarData(warehouseId, year, month)
    ]);

    setAnalyses(monthAnalyses);
    setCalendarData(calendar);
    setIsLoading(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null);
  };

  const handleMonthChange = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    setSelectedDate(null);
  };

  const handleViewAnalysis = (analysisId: string) => {
    navigate(`/historico/${analysisId}`);
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
                <CalendarIcon className="h-8 w-8 text-primary-400" />
                Histórico de Análises
              </h1>
              <p className="text-neutral-500 mt-1">
                Navegue pelas análises anteriores e acompanhe a evolução
              </p>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => handleMonthChange(-1)}
            >
              ← Mês Anterior
            </Button>
            <h2 className="text-2xl font-semibold text-neutral-900 capitalize">
              {monthName}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => handleMonthChange(1)}
              disabled={currentDate.getMonth() === new Date().getMonth()}
            >
              Próximo Mês →
            </Button>
          </div>

          {/* Calendar */}
          <AnalysisCalendar
            currentDate={currentDate}
            calendarData={calendarData}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            isLoading={isLoading}
          />
        </GlassCard>

        {/* Analyses List */}
        {selectedDate && (
          <AnalysisList
            selectedDate={selectedDate}
            analyses={analyses}
            onViewAnalysis={handleViewAnalysis}
          />
        )}

        {/* Period Stats */}
        <PeriodStats
          analyses={analyses}
          monthName={monthName}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalysisCalendarProps {
  currentDate: Date;
  calendarData: any[];
  selectedDate: Date | null;
  onDateSelect: (date: Date | undefined) => void;
  isLoading: boolean;
}

export function AnalysisCalendar({
  currentDate,
  calendarData,
  selectedDate,
  onDateSelect,
  isLoading,
}: AnalysisCalendarProps) {
  // Group analyses by date
  const analysesByDate = calendarData.reduce((acc: any, analysis: any) => {
    const date = format(new Date(analysis.run_date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(analysis);
    return acc;
  }, {});

  const datesWithAnalyses = Object.keys(analysesByDate).map(dateStr => new Date(dateStr));

  const modifiers = {
    hasAnalysis: datesWithAnalyses,
  };

  const modifiersStyles = {
    hasAnalysis: {
      backgroundColor: 'hsl(var(--primary-200))',
      color: 'hsl(var(--neutral-900))',
      fontWeight: 'bold',
      borderRadius: '8px',
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={onDateSelect}
        month={currentDate}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        locale={ptBR}
        className="mx-auto"
      />

      <div className="mt-4 flex items-center gap-4 justify-center text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary-200"></div>
          <span>Dias com análise</span>
        </div>
      </div>

      {/* Show count for each date with analyses */}
      <div className="mt-4 space-y-2">
        {selectedDate && analysesByDate[format(selectedDate, 'yyyy-MM-dd')] && (
          <div className="text-center">
            <Badge variant="outline">
              {analysesByDate[format(selectedDate, 'yyyy-MM-dd')].length} análise(s) em{' '}
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

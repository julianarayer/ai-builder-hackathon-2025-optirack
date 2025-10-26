import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, Bookmark, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationActionsProps {
  recommendationId: string;
  currentStatus: string;
  onStatusChange?: () => void;
  onViewImpact?: () => void;
}

export const RecommendationActions = ({
  recommendationId,
  currentStatus,
  onStatusChange,
  onViewImpact,
}: RecommendationActionsProps) => {
  const handleMarkAsImplemented = async () => {
    try {
      const { error } = await supabase
        .from("slotting_recommendations")
        .update({ 
          status: "applied",
          applied_at: new Date().toISOString()
        })
        .eq("id", recommendationId);

      if (error) throw error;

      toast.success("Recomendação marcada como implementada!");
      onStatusChange?.();
    } catch (error) {
      console.error("Error updating recommendation:", error);
      toast.error("Erro ao atualizar recomendação");
    }
  };

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from("slotting_recommendations")
        .update({ 
          status: "rejected",
          rejected_at: new Date().toISOString(),
          rejection_reason: "Rejeitado pelo usuário"
        })
        .eq("id", recommendationId);

      if (error) throw error;

      toast.info("Recomendação rejeitada");
      onStatusChange?.();
    } catch (error) {
      console.error("Error rejecting recommendation:", error);
      toast.error("Erro ao rejeitar recomendação");
    }
  };

  if (currentStatus === "applied") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Implementada</span>
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="flex items-center gap-2 text-neutral-500">
        <X className="h-5 w-5" />
        <span className="text-sm font-medium">Rejeitada</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={handleMarkAsImplemented}
        className="gap-1"
      >
        <CheckCircle className="h-4 w-4" />
        Implementar
      </Button>
      
      {onViewImpact && (
        <Button
          size="sm"
          variant="outline"
          onClick={onViewImpact}
          className="gap-1"
        >
          <Eye className="h-4 w-4" />
          Ver Impacto
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={handleReject}
        className="gap-1 text-neutral-600 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

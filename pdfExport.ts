import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useBiatrixSync() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const companyId = profile?.company_id ?? null;

  const { data: lastSync, isLoading: syncLoading } = useQuery({
    queryKey: ["biatrix-sync-log", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biatrix_sync_logs")
        .select("*")
        .eq("company_id", companyId!)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("biatrix-sync", {
        body: { company_id: companyId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biatrix-sync-log"] });
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      // Sectors query if it exists
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Sincronização concluída!");
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ["biatrix-sync-log"] });
      toast.error(err?.message || "Erro ao sincronizar com Biatrix.");
    },
  });

  return {
    lastSync,
    syncLoading,
    triggerSync: () => syncMutation.mutate(),
    isSyncing: syncMutation.isPending,
  };
}

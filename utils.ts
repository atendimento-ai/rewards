import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useCollaborators() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const companyId = profile?.company_id ?? null;

  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ["collaborators", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, sectors!sectors_leader_id_fkey(name)")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const deactivateMut = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      toast.success("Colaborador desativado.");
    },
    onError: () => toast.error("Erro ao desativar colaborador."),
  });

  const reactivateMut = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.from("profiles").update({ is_active: true }).eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      toast.success("Colaborador reativado.");
    },
    onError: () => toast.error("Erro ao reativar colaborador."),
  });

  return {
    collaborators,
    isLoading,
    deactivateCollaborator: (id: string) => deactivateMut.mutate(id),
    reactivateCollaborator: (id: string) => reactivateMut.mutate(id),
  };
}

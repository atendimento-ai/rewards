import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type {
  RewardCampaign,
  RewardPoint,
  RewardPrize,
  RewardRedemption,
  RedemptionStatus,
} from "@/types/rewards";

const errorMap: Record<string, string> = {
  "Insufficient balance": "Saldo insuficiente",
  "Prize out of stock": "Estoque esgotado",
  "Prize has expired": "Prêmio expirado",
  "Prize is not active": "Prêmio indisponível",
  "Prize not found": "Prêmio não encontrado",
};

function mapPgError(msg: string): string {
  for (const [key, val] of Object.entries(errorMap)) {
    if (msg.includes(key)) return val;
  }
  return "Erro ao resgatar";
}

export function useRewards() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const profileId = profile?.id ?? null;
  const companyId = profile?.company_id ?? null;
  const role = profile?.role ?? null;
  const enabled = !!profile;

  // ── Queries ──

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_campaigns")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as RewardCampaign[];
    },
    enabled,
  });

  const { data: prizes = [], isLoading: loadingPrizes } = useQuery({
    queryKey: ["prizes", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_prizes")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as RewardPrize[];
    },
    enabled,
  });

  const { data: points = [], isLoading: loadingPoints } = useQuery({
    queryKey: ["points", profileId, role],
    queryFn: async () => {
      let query = supabase
        .from("reward_points")
        .select("*")
        .order("created_at", { ascending: false });
      if (role === "collaborator") {
        query = query.eq("profile_id", profileId!);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as RewardPoint[];
    },
    enabled,
  });

  const { data: redemptions = [], isLoading: loadingRedemptions } = useQuery({
    queryKey: ["redemptions", profileId, role],
    queryFn: async () => {
      let query = supabase
        .from("reward_redemptions")
        .select("*, profiles!reward_redemptions_profile_id_fkey(name), reward_prizes!reward_redemptions_prize_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (role === "collaborator") {
        query = query.eq("profile_id", profileId!);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        profile_name: r.profiles?.name ?? null,
        prize_name: r.reward_prizes?.name ?? null,
        profiles: undefined,
        reward_prizes: undefined,
      })) as RewardRedemption[];
    },
    enabled,
  });

  const isLoading = loadingCampaigns || loadingPrizes || loadingPoints || loadingRedemptions;

  // ── Derived ──

  const pointsBalance = useMemo(() => {
    if (!profileId) return 0;
    return points.reduce((acc, p) => {
      if (p.profile_id !== profileId) return acc;
      if (p.transaction_type === "earned" || p.transaction_type === "adjustment") return acc + (p.points || 0);
      if (p.transaction_type === "redeemed" || p.transaction_type === "expired") return acc - (p.points || 0);
      return acc;
    }, 0);
  }, [points, profileId]);

  const totalEarned = useMemo(() => {
    if (!profileId) return 0;
    return points.filter(p => p.profile_id === profileId && p.transaction_type === "earned").reduce((a, p) => a + (p.points || 0), 0);
  }, [points, profileId]);

  const totalRedeemed = useMemo(() => {
    if (!profileId) return 0;
    return points.filter(p => p.profile_id === profileId && p.transaction_type === "redeemed").reduce((a, p) => a + (p.points || 0), 0);
  }, [points, profileId]);

  const activeRedemptions = redemptions;

  // ── Campaign mutations ──

  const createCampaignMut = useMutation({
    mutationFn: async (data: Omit<RewardCampaign, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("reward_campaigns").insert({
        ...data,
        company_id: companyId!,
        created_by: profileId!,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["campaigns"] }); toast.success("Campanha criada com sucesso!"); },
    onError: () => toast.error("Erro ao criar campanha."),
  });

  const updateCampaignMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RewardCampaign> }) => {
      const { error } = await supabase.from("reward_campaigns").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["campaigns"] }); toast.success("Campanha atualizada!"); },
    onError: () => toast.error("Erro ao atualizar campanha."),
  });

  const deleteCampaignMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reward_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["campaigns"] }); toast.success("Campanha removida!"); },
    onError: () => toast.error("Erro ao remover campanha."),
  });

  // ── Prize mutations ──

  const createPrizeMut = useMutation({
    mutationFn: async (data: Omit<RewardPrize, "id" | "created_at">) => {
      const { error } = await supabase.from("reward_prizes").insert({
        ...data,
        company_id: companyId!,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["prizes"] }); toast.success("Prêmio criado com sucesso!"); },
    onError: () => toast.error("Erro ao criar prêmio."),
  });

  const updatePrizeMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RewardPrize> }) => {
      const { error } = await supabase.from("reward_prizes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["prizes"] }); toast.success("Prêmio atualizado!"); },
    onError: () => toast.error("Erro ao atualizar prêmio."),
  });

  const deletePrizeFn = async (id: string) => {
    const hasActive = redemptions.some(r => r.prize_id === id && !["delivered", "rejected"].includes(r.status));
    if (hasActive) {
      toast.error("Não é possível excluir um prêmio com resgates pendentes.");
      return;
    }
    const { error } = await supabase.from("reward_prizes").delete().eq("id", id);
    if (error) { toast.error("Erro ao remover prêmio."); return; }
    queryClient.invalidateQueries({ queryKey: ["prizes"] });
    toast.success("Prêmio removido!");
  };

  // ── Redeem ──

  const redeemPrizeMut = useMutation({
    mutationFn: async (prizeId: string) => {
      const { data, error } = await supabase.rpc("redeem_prize", {
        p_profile_id: profileId!,
        p_prize_id: prizeId,
        p_company_id: companyId!,
        p_idempotency_key: crypto.randomUUID(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      queryClient.invalidateQueries({ queryKey: ["prizes"] });
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
      toast.success("Resgate solicitado com sucesso!");
    },
    onError: (err: any) => {
      toast.error(mapPgError(err?.message ?? ""));
    },
  });

  // ── Approval workflow ──

  const updateRedemptionStatusFn = async (id: string, status: RedemptionStatus, reason?: string) => {
    if (status === "rejected") {
      const { error } = await supabase.rpc("reject_redemption", {
        p_redemption_id: id,
        p_approved_by: profileId!,
        p_reason: reason || "Rejeitado pelo gestor",
      });
      if (error) { toast.error("Erro ao rejeitar resgate."); return; }
      toast.success("Resgate rejeitado e pontos estornados.");
    } else {
      const updates: Record<string, any> = { status };
      if (status === "in_purchase") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = profileId;
        updates.estimated_delivery_date = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      }
      if (status === "delivered") {
        updates.delivered_at = new Date().toISOString();
      }
      const { error } = await supabase.from("reward_redemptions").update(updates).eq("id", id);
      if (error) { toast.error("Erro ao atualizar status."); return; }

      const msgs: Record<string, string> = {
        in_approval: "Enviado para aprovação!",
        in_purchase: "Enviado para compra!",
        delivered: "Prêmio entregue!",
      };
      toast.success(msgs[status] || "Status atualizado!");
    }
    queryClient.invalidateQueries({ queryKey: ["redemptions"] });
    queryClient.invalidateQueries({ queryKey: ["points"] });
    queryClient.invalidateQueries({ queryKey: ["prizes"] });
  };

  // ── Award points ──

  const awardPointsFn = async (targetProfileId: string, profileName: string, campaignId: string, pts: number, description: string) => {
    if (pts <= 0) { toast.error("O valor dos pontos deve ser maior que zero."); return; }

    // Check max_points_per_user
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const currentEarned = points
        .filter(p => p.profile_id === targetProfileId && p.campaign_id === campaignId && p.transaction_type === "earned")
        .reduce((a, p) => a + (p.points || 0), 0);
      if (currentEarned + pts > campaign.max_points_per_user) {
        toast.error(`Excede o máximo de ${campaign.max_points_per_user} pontos por colaborador nesta campanha.`);
        return;
      }
    }

    const { error } = await supabase.from("reward_points").insert({
      profile_id: targetProfileId,
      campaign_id: campaignId,
      company_id: companyId!,
      points: pts,
      transaction_type: "earned",
      description,
      created_by: profileId!,
    });
    if (error) { toast.error("Erro ao atribuir pontos."); return; }
    queryClient.invalidateQueries({ queryKey: ["points"] });
    toast.success(`${pts} pontos atribuídos a ${profileName}!`);
  };

  // ── Stable function references ──

  const createCampaign = (data: Omit<RewardCampaign, "id" | "created_at" | "created_by">) => createCampaignMut.mutate(data);
  const updateCampaign = (id: string, data: Partial<RewardCampaign>) => updateCampaignMut.mutate({ id, data });
  const deleteCampaign = (id: string) => deleteCampaignMut.mutate(id);
  const createPrize = (data: Omit<RewardPrize, "id" | "created_at">) => createPrizeMut.mutate(data);
  const updatePrize = (id: string, data: Partial<RewardPrize>) => updatePrizeMut.mutate({ id, data });
  const deletePrize = (id: string) => deletePrizeFn(id);
  const redeemPrize = (prizeId: string) => redeemPrizeMut.mutate(prizeId);
  const updateRedemptionStatus = (id: string, status: RedemptionStatus, reason?: string) => updateRedemptionStatusFn(id, status, reason);
  const awardPoints = (targetProfileId: string, profileName: string, campaignId: string, pts: number, description: string) => awardPointsFn(targetProfileId, profileName, campaignId, pts, description);

  return {
    campaigns, points, prizes, redemptions, isLoading,
    pointsBalance, totalEarned, totalRedeemed, activeRedemptions,
    createCampaign, updateCampaign, deleteCampaign,
    createPrize, updatePrize, deletePrize,
    redeemPrize, updateRedemptionStatus, awardPoints,
  };
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RewardCampaign } from "@/types/rewards";

interface AwardPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: RewardCampaign[];
  onAward: (profileId: string, profileName: string, campaignId: string, points: number, description: string) => void;
}

export function AwardPointsDialog({ open, onOpenChange, campaigns, onAward }: AwardPointsDialogProps) {
  const { profile } = useAuth();
  const [userId, setUserId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");

  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators-active", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("company_id", profile.company_id)
        .eq("role", "collaborator")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: open && !!profile?.company_id,
  });

  const activeCampaigns = campaigns.filter(c => c.status === "active");

  const handleSubmit = () => {
    const user = collaborators.find(u => u.id === userId);
    if (!user || !campaignId || !points) return;
    onAward(userId, user.name, campaignId, Number(points), description || "Pontuação manual");
    setUserId(""); setCampaignId(""); setPoints(""); setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Atribuir Pontos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Colaborador</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {collaborators.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} <span className="text-muted-foreground ml-1 text-xs">({u.email})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Campanha</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {activeCampaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pontos</Label>
            <Input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Motivo da pontuação" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!userId || !campaignId || !points} className="bg-primary text-primary-foreground">
            Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

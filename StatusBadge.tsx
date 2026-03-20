import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Trophy, Users } from "lucide-react";
import { useRewardsContext } from "@/contexts/RewardsContext";
import { AwardPointsDialog } from "./AwardPointsDialog";
import type { RewardCampaign, CampaignStatus } from "@/types/rewards";

const statusLabels: Record<CampaignStatus, { label: string; className: string }> = {
  draft:     { label: "Rascunho",   className: "border-muted-foreground/30 bg-muted text-muted-foreground" },
  active:    { label: "Ativa",      className: "border-green-700/30 bg-green-900/20 text-green-400" },
  completed: { label: "Concluída",  className: "border-blue-700/30 bg-blue-900/20 text-blue-400" },
  cancelled: { label: "Cancelada",  className: "border-red-700/30 bg-red-900/20 text-red-400" },
};

interface Props { isGestor: boolean; }

export function RewardsCampaignsTab({ isGestor }: Props) {
  const { campaigns, createCampaign, updateCampaign, deleteCampaign, awardPoints } = useRewardsContext();
  const displayCampaigns = isGestor ? campaigns : campaigns.filter(c => c.status === 'active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<RewardCampaign | null>(null);
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "", points_per_action: 0, max_points_per_user: 0, status: "draft" as CampaignStatus });

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", start_date: "", end_date: "", points_per_action: 0, max_points_per_user: 0, status: "draft" }); setIsDialogOpen(true); };
  const openEdit = (c: RewardCampaign) => { setEditing(c); setForm({ name: c.name, description: c.description, start_date: c.start_date, end_date: c.end_date, points_per_action: c.points_per_action, max_points_per_user: c.max_points_per_user, status: c.status }); setIsDialogOpen(true); };

  const handleSubmit = () => {
    if (form.start_date && form.end_date && new Date(form.end_date) <= new Date(form.start_date)) {
      toast({ title: "A data final deve ser posterior à data inicial.", variant: "destructive" });
      return;
    }
    if (form.points_per_action <= 0 || form.max_points_per_user <= 0) {
      toast({ title: "Pontos por ação e máximo por usuário devem ser maiores que zero.", variant: "destructive" });
      return;
    }
    if (editing) { updateCampaign(editing.id, form); }
    else { createCampaign(form); }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {isGestor && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button>
          <Button variant="outline" onClick={() => setIsAwardOpen(true)}><Users className="h-4 w-4 mr-2" />Pontuar</Button>
        </div>
      )}

      {displayCampaigns.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma campanha {isGestor ? "cadastrada" : "ativa no momento"}.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayCampaigns.map(c => (
            <Card key={c.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-display text-base">{c.name}</CardTitle>
                  <Badge variant="outline" className={statusLabels[c.status].className}>{statusLabels[c.status].label}</Badge>
                </div>
                <CardDescription className="text-muted-foreground text-sm">{c.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Período</span>
                  <span>{c.start_date ? format(new Date(c.start_date), "dd/MM/yy", { locale: ptBR }) : "—"} — {c.end_date ? format(new Date(c.end_date), "dd/MM/yy", { locale: ptBR }) : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pontos/ação</span>
                  <span className="font-display text-primary">{c.points_per_action}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Máx/usuário</span>
                  <span className="font-display">{c.max_points_per_user.toLocaleString()}</span>
                </div>
                {isGestor && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}><Edit className="h-3 w-3 mr-1" />Editar</Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3 w-3 mr-1" />Excluir</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Data Início</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
              <div><Label>Data Fim</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Pontos/Ação</Label><Input type="number" value={form.points_per_action} onChange={e => setForm(f => ({ ...f, points_per_action: Number(e.target.value) }))} /></div>
              <div><Label>Máx/Usuário</Label><Input type="number" value={form.max_points_per_user} onChange={e => setForm(f => ({ ...f, max_points_per_user: Number(e.target.value) }))} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as CampaignStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!form.name}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteCampaign(deleteId); setDeleteId(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AwardPointsDialog open={isAwardOpen} onOpenChange={setIsAwardOpen} campaigns={campaigns} onAward={awardPoints} />
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Gift, Plus, Edit, Trash2, ShoppingCart } from "lucide-react";
import { useRewardsContext } from "@/contexts/RewardsContext";
import type { RewardPrize } from "@/types/rewards";

interface Props { isGestor: boolean; isAdmin: boolean; }

export function RewardsPrizesTab({ isGestor, isAdmin }: Props) {
  const { prizes, pointsBalance, createPrize, updatePrize, deletePrize, redeemPrize } = useRewardsContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [redeemId, setRedeemId] = useState<string | null>(null);
  const [editing, setEditing] = useState<RewardPrize | null>(null);
  const [form, setForm] = useState({ name: "", description: "", points_cost: 0, quantity_available: 0, delivery_days: 3, is_active: true });

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", points_cost: 0, quantity_available: 0, delivery_days: 3, is_active: true }); setIsDialogOpen(true); };
  const openEdit = (p: RewardPrize) => { setEditing(p); setForm({ name: p.name, description: p.description, points_cost: p.points_cost, quantity_available: p.quantity_available, delivery_days: p.delivery_days, is_active: p.is_active }); setIsDialogOpen(true); };

  const handleSubmit = () => {
    if (!form.name || form.points_cost <= 0 || form.quantity_available < 0 || form.delivery_days < 1) return;
    if (editing) updatePrize(editing.id, form);
    else createPrize(form);
    setIsDialogOpen(false);
  };

  const activePrizes = prizes.filter(p => p.is_active);

  return (
    <div className="space-y-4">
      {isGestor && (
        <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Novo Prêmio</Button>
      )}

      {activePrizes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum prêmio disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activePrizes.map(p => (
            <Card key={p.id} className="bg-card border-border flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">{p.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo</span>
                    <span className="font-display text-primary font-bold">{p.points_cost.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponível</span>
                    <span>{p.quantity_available} unidades</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span>{p.delivery_days} dias</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {!isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={pointsBalance >= p.points_cost ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground" : ""}
                      disabled={pointsBalance < p.points_cost || p.quantity_available <= 0}
                      onClick={() => setRedeemId(p.id)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />Resgatar
                    </Button>
                  )}
                  {isGestor && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Edit className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3 w-3" /></Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Editar Prêmio" : "Novo Prêmio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><Label>Custo (pts)</Label><Input type="number" min={1} value={form.points_cost} onChange={e => setForm(f => ({ ...f, points_cost: Number(e.target.value) }))} /></div>
              <div><Label>Quantidade</Label><Input type="number" min={0} value={form.quantity_available} onChange={e => setForm(f => ({ ...f, quantity_available: Number(e.target.value) }))} /></div>
              <div><Label>Entrega (dias)</Label><Input type="number" min={1} value={form.delivery_days} onChange={e => setForm(f => ({ ...f, delivery_days: Number(e.target.value) }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!form.name || form.points_cost <= 0 || form.quantity_available < 0 || form.delivery_days < 1}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem confirm */}
      <AlertDialog open={!!redeemId} onOpenChange={() => setRedeemId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Confirmar resgate?</AlertDialogTitle>
            <AlertDialogDescription>
              {redeemId && prizes.find(p => p.id === redeemId) && (
                <>Serão debitados <span className="text-primary font-display font-bold">{prizes.find(p => p.id === redeemId)!.points_cost.toLocaleString()} pts</span> do seu saldo.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (redeemId) redeemPrize(redeemId); setRedeemId(null); }}>Confirmar Resgate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Excluir prêmio?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deletePrize(deleteId); setDeleteId(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

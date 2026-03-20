import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Package, Truck, CheckSquare } from "lucide-react";
import { useRewardsContext } from "@/contexts/RewardsContext";
import { StatusBadge } from "./StatusBadge";
import type { RedemptionStatus } from "@/types/rewards";

export function RewardsApprovalsTab() {
  const { redemptions, updateRedemptionStatus } = useRewardsContext();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingCount = redemptions.filter(r => r.status === "pending").length;

  const getActions = (id: string, status: RedemptionStatus) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex flex-col sm:flex-row gap-1">
            <Button variant="outline" size="sm" onClick={() => updateRedemptionStatus(id, "in_approval")} className="border-green-700/30 text-green-400 hover:bg-green-900/20">
              <CheckCircle className="h-3 w-3 mr-1" />Aprovar
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setRejectId(id); setRejectReason(""); }} className="border-red-700/30 text-red-400 hover:bg-red-900/20">
              <XCircle className="h-3 w-3 mr-1" />Rejeitar
            </Button>
          </div>
        );
      case "in_approval":
        return (
          <Button variant="outline" size="sm" onClick={() => updateRedemptionStatus(id, "in_purchase")}>
            <Package className="h-3 w-3 mr-1" />Enviar p/ Compra
          </Button>
        );
      case "in_purchase":
        return (
          <Button variant="outline" size="sm" onClick={() => updateRedemptionStatus(id, "delivered")}>
            <Truck className="h-3 w-3 mr-1" />Marcar Entregue
          </Button>
        );
      default:
        return <span className="text-muted-foreground text-sm">—</span>;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
            Aprovações de Resgates
            {pendingCount > 0 && (
              <span className="ml-2 text-sm font-body text-primary">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum resgate para aprovar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Data</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead className="hidden sm:table-cell">Prêmio</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{r.profile_name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{r.prize_name}</TableCell>
                    <TableCell className="font-display">{r.points_spent.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell>{getActions(r.id, r.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Rejeitar Resgate</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Motivo da rejeição</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Informe o motivo..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancelar</Button>
            <Button variant="outline" className="border-red-700/30 text-red-400" onClick={() => { if (rejectId) updateRedemptionStatus(rejectId, "rejected", rejectReason); setRejectId(null); }}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

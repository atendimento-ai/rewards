import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ArrowUpDown, Coins, Users, Send } from "lucide-react";
import { useRewardsContext } from "@/contexts/RewardsContext";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "./StatusBadge";

export function RewardsPointsTab() {
  const { points, pointsBalance, totalEarned, totalRedeemed, redemptions, isLoading } = useRewardsContext();
  const { profile } = useAuth();
  const myId = profile?.id ?? "";
  const isAdmin = profile?.role === "admin";

  const myPoints = isAdmin ? points : points.filter(p => p.profile_id === myId);
  const myRedemptions = isAdmin ? redemptions : redemptions.filter(r => r.profile_id === myId);

  // Admin consolidated metrics
  const adminMetrics = useMemo(() => {
    if (!isAdmin) return null;
    const totalDistributed = points
      .filter(p => p.transaction_type === "earned")
      .reduce((a, p) => a + (p.points || 0), 0);
    const totalRedeemedAll = points
      .filter(p => p.transaction_type === "redeemed")
      .reduce((a, p) => a + (p.points || 0), 0);
    const uniqueCollaborators = new Set(points.map(p => p.profile_id)).size;
    const pendingRedemptions = redemptions.filter(r => r.status === "pending" || r.status === "in_approval").length;
    return { totalDistributed, totalRedeemedAll, uniqueCollaborators, pendingRedemptions };
  }, [isAdmin, points, redemptions]);

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {isAdmin ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Total Distribuído</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <span className="text-2xl font-display font-bold text-primary">{adminMetrics!.totalDistributed.toLocaleString()}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Total Resgatado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <span className="text-2xl font-display font-bold">{adminMetrics!.totalRedeemedAll.toLocaleString()}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Colaboradores Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-foreground" />
                <span className="text-2xl font-display font-bold">{adminMetrics!.uniqueCollaborators}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Resgates Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-display font-bold">{adminMetrics!.pendingRedemptions}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-2xl font-display font-bold text-primary odometer-value">{pointsBalance.toLocaleString()}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Total Ganho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-display font-bold">{totalEarned.toLocaleString()}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">Total Resgatado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <span className="text-2xl font-display font-bold">{totalRedeemed.toLocaleString()}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Points history */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
            {isAdmin ? "Movimentações Recentes" : "Extrato de Pontos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myPoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma movimentação registrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPoints.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={p.transaction_type === "earned" || p.transaction_type === "adjustment" ? "text-green-400" : "text-red-400"}>
                        {p.transaction_type === "earned" ? "Ganho" : p.transaction_type === "redeemed" ? "Resgate" : p.transaction_type === "expired" ? "Expirado" : "Ajuste"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-display font-medium">
                      <span className={p.transaction_type === "earned" || p.transaction_type === "adjustment" ? "text-green-400" : "text-red-400"}>
                        {p.transaction_type === "earned" || p.transaction_type === "adjustment" ? "+" : "-"}{p.points.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My redemptions */}
      {myRedemptions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display">{isAdmin ? "Todos os Resgates" : "Meus Resgates"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Data</TableHead>
                  <TableHead>Prêmio</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRedemptions.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{r.prize_name}</TableCell>
                    <TableCell className="font-display">{r.points_spent.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

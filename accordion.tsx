import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Trophy, Medal, Gift, Coins, CheckCircle, FileText, Download } from "lucide-react";
import { useRewardsContext } from "@/contexts/RewardsContext";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { StatusBadge } from "./StatusBadge";
import { exportToPdf } from "@/lib/pdfExport";
import { toast } from "sonner";
import type { CampaignStatus } from "@/types/rewards";

const campaignStatusLabel: Record<CampaignStatus, { label: string; className: string }> = {
  draft:     { label: "Rascunho",   className: "border-muted bg-muted/20 text-muted-foreground" },
  active:    { label: "Ativa",      className: "border-green-700/30 bg-green-900/20 text-green-400" },
  completed: { label: "Concluída",  className: "border-blue-700/30 bg-blue-900/20 text-blue-400" },
  cancelled: { label: "Cancelada",  className: "border-red-700/30 bg-red-900/20 text-red-400" },
};


const redemptionStatusText: Record<string, string> = {
  pending: "Pendente",
  in_approval: "Aprovado",
  in_purchase: "Em Compra",
  delivered: "Entregue",
  rejected: "Rejeitado",
};

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary gap-1.5">
      <Download className="h-3.5 w-3.5" />
      Exportar PDF
    </Button>
  );
}

export function RewardsReportsTab() {
  const { campaigns, prizes, points, redemptions } = useRewardsContext();
  const { profile } = useAuth();
  const { settings } = useAppSettings();
  const [subTab, setSubTab] = useState("resumo");
  const myId = profile?.id ?? "";

  const collaboratorPointsData = useMemo(() => {
    const map = new Map<string, { name: string; earned: number; redeemed: number; redemptions: number }>();
    points.forEach(p => {
      if (!map.has(p.profile_id)) map.set(p.profile_id, { name: p.profile_id, earned: 0, redeemed: 0, redemptions: 0 });
      const entry = map.get(p.profile_id)!;
      if (p.transaction_type === "earned" || p.transaction_type === "adjustment") entry.earned += p.points;
      if (p.transaction_type === "redeemed") entry.redeemed += p.points;
    });
    redemptions.forEach(r => {
      if (map.has(r.profile_id)) {
        map.get(r.profile_id)!.redemptions += 1;
        if (r.profile_name) map.get(r.profile_id)!.name = r.profile_name;
      }
    });
    return Array.from(map.values())
      .map(e => ({ ...e, balance: e.earned - e.redeemed }))
      .sort((a, b) => b.earned - a.earned);
  }, [points, redemptions]);

  const totalPointsDistributed = collaboratorPointsData.reduce((a, r) => a + r.earned, 0);
  const totalRedemptions = redemptions.length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const myPoints = points.filter(p => p.profile_id === myId);

  const pdfBase = { companyName: settings.companyName, companyLogoUrl: settings.companyLogoUrl };

  const exportResumo = async () => {
    toast.info("Gerando PDF...");
    await exportToPdf({
      ...pdfBase,
      title: "Relatório Resumo — Ranking de Colaboradores",
      fileName: "relatorio-resumo",
      headers: ["#", "Colaborador", "Pontos", "Resgates"],
      rows: collaboratorPointsData.map((r, i) => [String(i + 1), r.name, r.earned.toLocaleString(), String(r.redemptions)]),
    });
    toast.success("PDF gerado!");
  };

  const exportPremios = async () => {
    toast.info("Gerando PDF...");
    await exportToPdf({
      ...pdfBase,
      title: "Relatório de Prêmios Cadastrados",
      fileName: "relatorio-premios",
      headers: ["Nome", "Descrição", "Custo (pts)", "Disponíveis", "Entrega (dias)", "Status"],
      rows: prizes.map(p => [p.name, p.description, p.points_cost.toLocaleString(), String(p.quantity_available), String(p.delivery_days), p.is_active ? "Ativo" : "Inativo"]),
    });
    toast.success("PDF gerado!");
  };

  const exportCampanhas = async () => {
    toast.info("Gerando PDF...");
    await exportToPdf({
      ...pdfBase,
      title: "Relatório de Campanhas Cadastradas",
      fileName: "relatorio-campanhas",
      headers: ["Nome", "Descrição", "Início", "Fim", "Pts/Ação", "Status"],
      rows: campaigns.map(c => [c.name, c.description, new Date(c.start_date).toLocaleDateString("pt-BR"), new Date(c.end_date).toLocaleDateString("pt-BR"), String(c.points_per_action), campaignStatusLabel[c.status].label]),
    });
    toast.success("PDF gerado!");
  };

  const exportExtrato = async () => {
    toast.info("Gerando PDF...");
    const sorted = [...myPoints].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    await exportToPdf({
      ...pdfBase,
      title: "Extrato de Pontos — Histórico Individual",
      fileName: "extrato-pontos",
      headers: ["Data", "Descrição", "Tipo", "Pontos"],
      rows: sorted.map(p => {
        const isPos = p.transaction_type === "earned" || p.transaction_type === "adjustment";
        const tipo = p.transaction_type === "earned" ? "Ganho" : p.transaction_type === "redeemed" ? "Resgatado" : p.transaction_type === "expired" ? "Expirado" : "Ajuste";
        return [new Date(p.created_at).toLocaleDateString("pt-BR"), p.description, tipo, `${isPos ? "+" : "−"}${p.points.toLocaleString()}`];
      }),
    });
    toast.success("PDF gerado!");
  };

  const exportAprovacoes = async () => {
    toast.info("Gerando PDF...");
    await exportToPdf({
      ...pdfBase,
      title: "Relatório de Aprovações de Resgates",
      fileName: "relatorio-aprovacoes",
      headers: ["Data", "Colaborador", "Prêmio", "Pontos", "Status", "Motivo Rejeição"],
      rows: redemptions.map(r => [new Date(r.created_at).toLocaleDateString("pt-BR"), r.profile_name || r.profile_id, r.prize_name || r.prize_id, r.points_spent.toLocaleString(), redemptionStatusText[r.status] || r.status, r.rejection_reason || "—"]),
    });
    toast.success("PDF gerado!");
  };

  const exportColaboradores = async () => {
    toast.info("Gerando PDF...");
    await exportToPdf({
      ...pdfBase,
      title: "Relatório de Pontos por Colaborador",
      fileName: "relatorio-colaboradores",
      headers: ["#", "Colaborador", "Ganhos", "Resgatados", "Saldo", "Resgates"],
      rows: collaboratorPointsData.map((r, i) => [String(i + 1), r.name, `+${r.earned.toLocaleString()}`, `−${r.redeemed.toLocaleString()}`, r.balance.toLocaleString(), String(r.redemptions)]),
    });
    toast.success("PDF gerado!");
  };

  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="flex flex-wrap w-full bg-card border border-border gap-0">
          <TabsTrigger value="resumo" className="text-xs font-body data-[state=active]:bg-secondary data-[state=active]:text-foreground">
            <BarChart3 className="h-3.5 w-3.5 mr-1" />Resumo
          </TabsTrigger>
          <TabsTrigger value="premios" className="text-xs font-body data-[state=active]:bg-secondary data-[state=active]:text-foreground">
            <Gift className="h-3.5 w-3.5 mr-1" />Prêmios
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="text-xs font-body data-[state=active]:bg-secondary data-[state=active]:text-foreground">
            <Trophy className="h-3.5 w-3.5 mr-1" />Campanhas
          </TabsTrigger>
          <TabsTrigger value="extrato" className="text-xs font-body data-[state=active]:bg-secondary data-[state=active]:text-foreground">
            <FileText className="h-3.5 w-3.5 mr-1" />Extrato
          </TabsTrigger>
          <TabsTrigger value="aprovacoes" className="text-xs font-body data-[state=active]:bg-secondary data-[state=active]:text-foreground">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />Aprovações
          </TabsTrigger>
          <TabsTrigger value="colaboradores" className="text-xs font-body data-[state=active]:bg-secondary data-[state=active]:text-foreground">
            <Coins className="h-3.5 w-3.5 mr-1" />Colaboradores
          </TabsTrigger>
        </TabsList>

        {/* ── RESUMO ── */}
        <TabsContent value="resumo" className="space-y-6">
          <div className="flex justify-between items-center">
            <div />
            <ExportButton onClick={exportResumo} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">Total Pontos Distribuídos</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-display font-bold text-primary">{totalPointsDistributed.toLocaleString()}</span>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">Resgates Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-display font-bold">{totalRedemptions}</span>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-display font-bold">{activeCampaigns}</span>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ranking de Colaboradores
              </CardTitle>
            </CardHeader>
            <CardContent>
             <div className="overflow-x-auto -mx-6 px-6">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Resgates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaboratorPointsData.map((r, i) => (
                    <TableRow key={r.name}>
                      <TableCell>
                        {i < 3 ? <Medal className={`h-5 w-5 ${i === 0 ? "text-primary" : i === 1 ? "text-foreground" : "text-amber-700"}`} /> : <span className="text-muted-foreground">{i + 1}</span>}
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right font-display text-primary">{r.earned.toLocaleString()}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{r.redemptions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PRÊMIOS ── */}
        <TabsContent value="premios">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display flex items-center gap-2 text-sm sm:text-base">
                <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                Prêmios Cadastrados
              </CardTitle>
              <ExportButton onClick={exportPremios} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Custo (pts)</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Disponíveis</TableHead>
                    <TableHead className="text-right hidden sm:table-cell whitespace-nowrap">Entrega (dias)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum prêmio cadastrado</TableCell></TableRow>
                  ) : prizes.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">{p.description}</TableCell>
                      <TableCell className="text-right font-display text-primary">{p.points_cost.toLocaleString()}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{p.quantity_available}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{p.delivery_days}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={p.is_active ? "border-green-700/30 bg-green-900/20 text-green-400" : "border-red-700/30 bg-red-900/20 text-red-400"}>
                          {p.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CAMPANHAS ── */}
        <TabsContent value="campanhas">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display flex items-center gap-2 text-sm sm:text-base">
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                Campanhas Cadastradas
              </CardTitle>
              <ExportButton onClick={exportCampanhas} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                    <TableHead className="hidden sm:table-cell">Início</TableHead>
                    <TableHead className="hidden sm:table-cell">Fim</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Pts/Ação</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma campanha cadastrada</TableCell></TableRow>
                  ) : campaigns.map(c => {
                    const st = campaignStatusLabel[c.status];
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">{c.description}</TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">{new Date(c.start_date).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">{new Date(c.end_date).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right font-display text-primary">{c.points_per_action}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EXTRATO ── */}
        <TabsContent value="extrato">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="truncate">Extrato de Pontos — Meu Histórico</span>
              </CardTitle>
              <ExportButton onClick={exportExtrato} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPoints.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma movimentação</TableCell></TableRow>
                  ) : [...myPoints].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(p => {
                    const isPositive = p.transaction_type === "earned" || p.transaction_type === "adjustment";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{p.description}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant="outline" className={isPositive ? "border-green-700/30 bg-green-900/20 text-green-400" : "border-red-700/30 bg-red-900/20 text-red-400"}>
                            {p.transaction_type === "earned" ? "Ganho" : p.transaction_type === "redeemed" ? "Resgatado" : p.transaction_type === "expired" ? "Expirado" : "Ajuste"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-display font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                          {isPositive ? "+" : "−"}{p.points.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APROVAÇÕES ── */}
        <TabsContent value="aprovacoes">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="truncate">Histórico de Aprovações</span>
              </CardTitle>
              <ExportButton onClick={exportAprovacoes} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Data</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead className="hidden sm:table-cell">Prêmio</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Motivo Rejeição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum resgate registrado</TableCell></TableRow>
                  ) : redemptions.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="font-medium">{r.profile_name || r.profile_id}</TableCell>
                      <TableCell className="hidden sm:table-cell">{r.prize_name || r.prize_id}</TableCell>
                      <TableCell className="text-right font-display text-primary">{r.points_spent.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.rejection_reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COLABORADORES ── */}
        <TabsContent value="colaboradores">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display flex items-center gap-2 text-sm sm:text-base">
                <Coins className="h-5 w-5 text-primary flex-shrink-0" />
                Pontos por Colaborador
              </CardTitle>
              <ExportButton onClick={exportColaboradores} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead className="text-right">Ganhos</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Resgatados</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Resgates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaboratorPointsData.map((r, i) => (
                    <TableRow key={r.name}>
                      <TableCell>
                        {i < 3 ? <Medal className={`h-5 w-5 ${i === 0 ? "text-primary" : i === 1 ? "text-foreground" : "text-amber-700"}`} /> : <span className="text-muted-foreground">{i + 1}</span>}
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right font-display text-green-400">+{r.earned.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-display text-red-400 hidden sm:table-cell">−{r.redeemed.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-display font-bold text-primary">{r.balance.toLocaleString()}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{r.redemptions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

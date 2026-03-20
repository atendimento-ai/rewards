import { RedemptionStatus } from "@/types/rewards";
import { Badge } from "@/components/ui/badge";

const statusConfigs: Record<RedemptionStatus, { label: string; className: string }> = {
  pending:      { label: "Pendente",    className: "border-yellow-700/30 bg-yellow-900/20 text-yellow-400" },
  in_approval:  { label: "Aprovado",    className: "border-green-700/30 bg-green-900/20 text-green-400" },
  in_purchase:  { label: "Em Compra",   className: "border-purple-700/30 bg-purple-900/20 text-purple-400" },
  delivered:    { label: "Entregue",    className: "border-blue-700/30 bg-blue-900/20 text-blue-400" },
  rejected:     { label: "Rejeitado",   className: "border-red-700/30 bg-red-900/20 text-red-400" },
};

export function StatusBadge({ status }: { status: RedemptionStatus }) {
  const config = statusConfigs[status];
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}

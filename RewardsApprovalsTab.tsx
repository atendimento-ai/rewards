import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserX, UserCheck } from "lucide-react";
import { useCollaborators } from "@/hooks/useCollaborators";
import { InviteCollaboratorDialog } from "./InviteCollaboratorDialog";

export function CollaboratorsTab() {
  const { collaborators, isLoading, deactivateCollaborator, reactivateCollaborator } = useCollaborators();

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <InviteCollaboratorDialog />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Colaboradores ({collaborators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Data de cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum colaborador cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  collaborators.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{c.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.role === "admin"
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-secondary bg-secondary/50 text-foreground"
                          }
                        >
                          {c.role === "admin" ? "Admin" : "Colaborador"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.is_active
                              ? "border-green-700/30 bg-green-900/20 text-green-400"
                              : "border-red-700/30 bg-red-900/20 text-red-400"
                          }
                        >
                          {c.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                            onClick={() => deactivateCollaborator(c.id)}
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Desativar</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-400 hover:bg-green-900/20 gap-1"
                            onClick={() => reactivateCollaborator(c.id)}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Reativar</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

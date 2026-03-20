import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Menu, Coins, Trophy, Gift, CheckCircle, BarChart3, Settings, Users, LogOut } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { OdometerValue } from "./OdometerValue";

interface MobileDrawerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isGestor: boolean;
  isAdmin: boolean;
  pendingCount: number;
  pointsBalance: number;
}

const navItems = [
  { value: "meus-pontos", label: "Meus Pontos", icon: Coins },
  { value: "campanhas", label: "Campanhas", icon: Trophy },
  { value: "premios", label: "Prêmios", icon: Gift },
];

const gestorItems = [
  { value: "aprovacoes", label: "Aprovações", icon: CheckCircle },
  { value: "colaboradores", label: "Colaboradores", icon: Users, adminOnly: true },
  { value: "relatorios", label: "Relatórios", icon: BarChart3 },
];

export function MobileDrawer({ activeTab, onTabChange, isGestor, isAdmin, pendingCount, pointsBalance }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const { settings } = useAppSettings();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleNav = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-background border-border p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            {settings.companyLogoUrl && (
              <img src={settings.companyLogoUrl} alt={settings.companyName} className="h-8 w-8 object-contain flex-shrink-0" />
            )}
            <SheetTitle className="font-display text-sm text-foreground truncate">
              {settings.companyName}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Balance card */}
        <div className="mx-5 mb-4 border border-border bg-card p-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Seu saldo</p>
          <OdometerValue value={pointsBalance} className="text-3xl font-display font-bold text-primary" />
          <p className="text-xs text-muted-foreground mt-0.5">pontos</p>
        </div>

        <Separator className="bg-border" />

        {/* Nav items */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.value}
              onClick={() => handleNav(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body transition-colors ${
                activeTab === item.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}

          {isGestor && (
            <>
              <Separator className="bg-border my-2" />
              <p className="px-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Gestão</p>
              {gestorItems.filter(item => !item.adminOnly || isAdmin).map(item => (
                <button
                  key={item.value}
                  onClick={() => handleNav(item.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body transition-colors ${
                    activeTab === item.value
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                  {item.value === "aprovacoes" && pendingCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-0">
                      {pendingCount}
                    </Badge>
                  )}
                </button>
              ))}
            </>
          )}
        </nav>

        {isAdmin && (
          <>
            <Separator className="bg-border" />
            <div className="p-3">
              <button
                onClick={() => { navigate("/configuracoes"); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                Configurações
              </button>
            </div>
          </>
        )}

        <Separator className="bg-border" />
        <div className="p-3">
          <button
            onClick={async () => { await signOut(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Camera, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UserWelcome() {
  const { profile, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = profile?.name || "Usuário";
  const avatarUrl = profile?.avatar_url || undefined;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }
    // TODO: upload to storage when connected
    toast.info("Upload de avatar será implementado em breve.");
  };

  const initials = name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-secondary text-foreground text-xs font-display">{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          <Camera className="h-3.5 w-3.5 text-primary" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-foreground leading-none">Olá, {name.split(" ")[0]}!</p>
        <p className="text-xs text-muted-foreground mt-0.5">Bem-vindo(a) de volta</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={handleSignOut}
        title="Sair"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

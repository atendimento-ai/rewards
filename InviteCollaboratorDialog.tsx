import { ReactNode } from "react";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-4">
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}

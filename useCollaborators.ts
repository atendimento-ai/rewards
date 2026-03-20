import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AppSettings {
  companyName: string;
  companyLogoUrl: string | null;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (data: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  companyName: "Minha Empresa",
  companyLogoUrl: null,
};

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("app-settings");
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        localStorage.removeItem("app-settings");
      }
    }
    return defaultSettings;
  });

  // Fetch from Supabase on load when we have a company_id
  useEffect(() => {
    if (!profile?.company_id) return;
    supabase
      .from("companies")
      .select("name, logo_url")
      .eq("id", profile.company_id)
      .single()
      .then(({ data }) => {
        if (data) {
          const next: AppSettings = {
            companyName: data.name || defaultSettings.companyName,
            companyLogoUrl: data.logo_url || null,
          };
          setSettings(next);
          localStorage.setItem("app-settings", JSON.stringify(next));
        }
      });
  }, [profile?.company_id]);

  const updateSettings = useCallback((data: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem("app-settings", JSON.stringify(next));

      // Persist to Supabase if we have a company
      if (profile?.company_id) {
        const update: Record<string, unknown> = {};
        if (data.companyName !== undefined) update.name = data.companyName;
        if (data.companyLogoUrl !== undefined) update.logo_url = data.companyLogoUrl;
        if (Object.keys(update).length > 0) {
          supabase
            .from("companies")
            .update(update)
            .eq("id", profile.company_id)
            .then(({ error }) => {
              if (error) console.error("Failed to persist settings:", error);
            });
        }
      }

      return next;
    });
  }, [profile?.company_id]);

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}

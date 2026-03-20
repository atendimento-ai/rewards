import { UserLevel } from "@/types/rewards";
import { useAuth } from "@/hooks/useAuth";

export function useUserLevel() {
  const { role } = useAuth();
  const userLevel: UserLevel = role === 'admin' ? 'admin' : 'collaborator';
  const isGestor = role === 'admin';
  return { userLevel, isGestor };
}

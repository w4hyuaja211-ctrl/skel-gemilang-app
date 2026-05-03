import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Ctx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshRole = async (uid: string | undefined) => {
    if (!uid) {
      console.log("No UID, setting isAdmin false");
      return setIsAdmin(false);
    }
    console.log("Checking user role for UID:", uid);
    
    // Try direct query first
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    
    console.log("Direct user_roles query result:", { data: rolesData, error: rolesError });
    
    if (rolesData && rolesData.length > 0) {
      const isAdmin = rolesData.some((r) => r.role === "admin");
      setIsAdmin(isAdmin);
      console.log("Set isAdmin from direct query to:", isAdmin);
      return;
    }

    // If direct query fails, try RPC
    console.log("Falling back to RPC...");
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: uid,
      _role: "admin"
    });
    console.log("has_role RPC result:", { data, error });
    setIsAdmin(!!data);
    console.log("Set isAdmin from RPC to:", !!data);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      refreshRole(s?.user?.id);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      refreshRole(s?.user?.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setUser(s?.user ?? null);
      await refreshRole(s?.user?.id);
    }
    return { error: error?.message ?? null };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};

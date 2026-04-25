import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AccountType = "tourist" | "partner";

export type Account = {
  type: AccountType;
  email: string;
  name: string;
  initials: string;
  detail: string;
  userId: string;
};

type AuthState = {
  account: Account | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string; type?: AccountType }>;
  signUpTourist: (args: { email: string; password: string; name: string; country: string }) => Promise<{ ok: boolean; error?: string }>;
  signUpPartner: (args: { email: string; password: string; name: string; claimAlpine?: boolean; businessName?: string; category?: string; location?: string }) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

const ALPINE_FONDUE_ID = "11111111-1111-1111-1111-111111111111";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "??";
}

async function loadAccount(user: User): Promise<Account | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, role, home_country")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !profile) return null;

  let detail = profile.home_country ?? "";
  if (profile.role === "partner") {
    const { data: partner } = await supabase
      .from("partners")
      .select("name, location")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (partner) detail = `${partner.name}${partner.location ? " · " + partner.location : ""}`;
    else detail = "No business linked yet";
  }

  return {
    type: profile.role as AccountType,
    email: user.email ?? "",
    name: profile.display_name,
    initials: initialsOf(profile.display_name),
    detail,
    userId: user.id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener first
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      // Defer DB call to avoid blocking the listener
      if (session?.user) {
        setTimeout(() => {
          loadAccount(session.user).then(setAccount);
        }, 0);
      } else {
        setAccount(null);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const acc = await loadAccount(data.session.user);
        setAccount(acc);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthState["signIn"] = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    const acc = data.user ? await loadAccount(data.user) : null;
    if (acc) setAccount(acc);
    return { ok: true, type: acc?.type };
  }, []);

  const signUpTourist: AuthState["signUpTourist"] = useCallback(async ({ email, password, name, country }) => {
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name, role: "tourist", home_country: country },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signUpPartner: AuthState["signUpPartner"] = useCallback(async ({ email, password, name, claimAlpine, businessName, category, location }) => {
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name, role: "partner" },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) return { ok: false, error: error.message };

    // If session is immediately available (auto-confirm enabled), claim/create partner
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.user) {
      if (claimAlpine) {
        // Best effort claim via edge function so it works even with RLS update restriction.
        await supabase.functions.invoke("claim-partner", { body: { partnerId: ALPINE_FONDUE_ID } });
      } else if (businessName) {
        await supabase.from("partners").insert({
          owner_id: session.user.id,
          name: businessName,
          category: category ?? "Other",
          location: location ?? null,
        });
      }
      const acc = await loadAccount(session.user);
      setAccount(acc);
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAccount(null);
  }, []);

  return (
    <Ctx.Provider value={{ account, loading, signIn, signUpTourist, signUpPartner, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

export const ALPINE_FONDUE_PARTNER_ID = ALPINE_FONDUE_ID;

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type AccountType = "tourist" | "partner";

export type Account = {
  type: AccountType;
  email: string;
  name: string;
  initials: string;
  /** Tourist: home country. Partner: business name */
  detail: string;
};

const DEMO_ACCOUNTS: Record<string, { password: string; account: Account }> = {
  "hans@example.com": {
    password: "alpine",
    account: {
      type: "tourist",
      email: "hans@example.com",
      name: "Hans Keller",
      initials: "HK",
      detail: "Berlin, Germany",
    },
  },
  "marco@fonduehouse.ch": {
    password: "fondue",
    account: {
      type: "partner",
      email: "marco@fonduehouse.ch",
      name: "Marco Bianchi",
      initials: "MB",
      detail: "Alpine Fondue House · Interlaken",
    },
  },
};

type AuthState = {
  account: Account | null;
  login: (email: string, password: string) => { ok: true; type: AccountType } | { ok: false; error: string };
  loginAs: (type: AccountType) => Account;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);
const STORAGE_KEY = "jf_wallet_account";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);

  // Hydrate from localStorage (client only — SSR safe via effect)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAccount(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (a: Account | null) => {
    try {
      if (a) localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const login: AuthState["login"] = useCallback((email, password) => {
    const entry = DEMO_ACCOUNTS[email.toLowerCase().trim()];
    if (!entry) return { ok: false, error: "No account with this email." };
    if (entry.password !== password) return { ok: false, error: "Wrong password." };
    setAccount(entry.account);
    persist(entry.account);
    return { ok: true, type: entry.account.type };
  }, []);

  const loginAs = useCallback((type: AccountType) => {
    const acc = type === "tourist"
      ? DEMO_ACCOUNTS["hans@example.com"].account
      : DEMO_ACCOUNTS["marco@fonduehouse.ch"].account;
    setAccount(acc);
    persist(acc);
    return acc;
  }, []);

  const logout = useCallback(() => {
    setAccount(null);
    persist(null);
  }, []);

  return <Ctx.Provider value={{ account, login, loginAs, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

export const DEMO_CREDENTIALS = [
  { type: "tourist" as const, email: "hans@example.com", password: "alpine", label: "Tourist · Hans Keller" },
  { type: "partner" as const, email: "marco@fonduehouse.ch", password: "fondue", label: "Partner · Alpine Fondue House" },
];

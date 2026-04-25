import { useWallet, fmtCHF } from "@/lib/wallet-store";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

/* ---------- Phone shell with status bar ---------- */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-frame">
      <div className="phone-notch" />
      <div className="phone-screen">
        <StatusBar />
        <div className="absolute inset-0 pt-10 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-10 px-7 flex items-center justify-between text-[11px] font-semibold text-charcoal z-40">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 16 12" className="w-4 h-3" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="0.5" /><rect x="4" y="6" width="3" height="6" rx="0.5" /><rect x="8" y="3" width="3" height="9" rx="0.5" /><rect x="12" y="0" width="3" height="12" rx="0.5" /></svg>
        <svg viewBox="0 0 24 12" className="w-6 h-3" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" /><rect x="2" y="2" width="14" height="8" rx="1" fill="currentColor" /><rect x="21.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" /></svg>
      </div>
    </div>
  );
}

/* ---------- Wallet card ---------- */
export function WalletCard() {
  const { balance, guestStatus, guestName } = useWallet();
  return (
    <div className="rounded-2xl bg-gradient-card text-white p-5 shadow-card relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10" aria-hidden />
      <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-teal/30" aria-hidden />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">Wallet balance</div>
            <div className="text-3xl font-display font-bold mt-1">{fmtCHF(balance)}</div>
          </div>
          <div
            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
              guestStatus === "active"
                ? "bg-emerald/20 border-emerald/40 text-white"
                : "bg-white/10 border-white/20 text-white/70"
            }`}
          >
            {guestStatus === "active" ? "● Guest active" : "○ Card pending"}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-[11px]">
          <div>
            <div className="opacity-60">Cardholder</div>
            <div className="font-medium">{guestName}</div>
          </div>
          <div className="font-mono opacity-80 tracking-widest">•••• 1024</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bottom nav ---------- */
export function BottomNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏔️" },
    { id: "discover", label: "Discover", icon: "🧭" },
    { id: "tickets", label: "Tickets", icon: "🎫" },
    { id: "rewards", label: "Rewards", icon: "🏅" },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-border px-3 py-2 flex justify-around">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            active === t.id ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <span className="text-lg leading-none">{t.icon}</span>
          <span className="text-[10px] font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- QR mock ---------- */
export function QRBlock({ value, size = 120 }: { value: string; size?: number }) {
  // Deterministic pixel pattern from string hash (no external lib)
  const cells = 21;
  const grid: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  }
  for (let i = 0; i < cells * cells; i++) {
    h = Math.imul(h ^ (i + 17), 16777619);
    grid.push((h & 7) > 3);
  }
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0);
  };
  const finderFill = (r: number, c: number) => {
    const localBox = (br: number, bc: number) => {
      const lr = r - br;
      const lc = c - bc;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };
    if (r < 7 && c < 7) return localBox(0, 0);
    if (r < 7 && c >= cells - 7) return localBox(0, cells - 7);
    if (r >= cells - 7 && c < 7) return localBox(cells - 7, 0);
    return false;
  };
  return (
    <div
      className="bg-white p-3 rounded-xl border border-border inline-block"
      style={{ width: size + 24 }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cells}, 1fr)`,
          width: size,
          height: size,
          gap: 0,
        }}
      >
        {grid.map((on, i) => {
          const r = Math.floor(i / cells);
          const c = i % cells;
          const finder = isFinder(r, c);
          const fill = finder ? finderFill(r, c) : on;
          return (
            <div
              key={i}
              style={{ backgroundColor: fill ? "#1F2933" : "transparent" }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);
  return { msg, show: setMsg };
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-charcoal text-white text-sm px-4 py-2.5 rounded-full shadow-card animate-in fade-in slide-in-from-bottom-4">
      {msg}
    </div>
  );
}

/* ---------- Reusable "demo step" cue ---------- */
export function DemoCue({ text, action, to }: { text: string; action: string; to?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-teal/50 bg-teal/5 p-4 flex items-center justify-between gap-3">
      <div className="text-sm text-charcoal">{text}</div>
      {to ? (
        <Link
          to={to}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-primary"
        >
          {action} →
        </Link>
      ) : (
        <span className="text-xs font-semibold text-teal">{action}</span>
      )}
    </div>
  );
}

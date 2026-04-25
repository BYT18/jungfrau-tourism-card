import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useWallet } from "@/lib/wallet-store";
import { useAuth } from "@/lib/auth-store";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-9 w-9 rounded-lg bg-gradient-card shadow-soft flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          <path d="M3 19L9 9l4 6 3-4 5 8H3z" fill="currentColor" />
          <circle cx="16" cy="6" r="2" fill="currentColor" opacity="0.7" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
          Jungfrau Pass
        </div>
        <div className="font-display font-bold text-charcoal text-base -mt-0.5">Wallet</div>
      </div>
    </Link>
  );
}

export function TopNav() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { resetDemo } = useWallet();
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  // Build nav based on whether user is signed in
  const items = [
    { to: "/", label: "Overview" },
    ...(account?.type === "tourist" ? [{ to: "/tourist", label: "Tourist app" }] : []),
    ...(account?.type === "partner" ? [{ to: "/partner", label: "Partner" }] : []),
    { to: "/admin", label: "Destination" },
  ];

  const handleLogout = () => {
    logout();
    resetDemo();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {items.map((i) => {
            const active = pathname === i.to || (i.to !== "/" && pathname.startsWith(i.to));
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`px-3.5 py-2 text-sm rounded-md transition-colors ${
                  active
                    ? "text-primary bg-primary/8 font-semibold"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-surface-2"
                }`}
              >
                {i.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {account ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs font-semibold text-charcoal">{account.name}</div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {account.type} account
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-charcoal text-white grid place-items-center font-semibold text-xs">
                {account.initials}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-charcoal px-2 py-1 rounded-md hover:bg-surface-2"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-soft hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-topo">
      <TopNav />
      <main>{children}</main>
      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <Logo />
          <div>Hackathon prototype · Simulated closed-loop ledger · © Jungfrau Region</div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald" /> Demo live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "up" | "down";
}) {
  const toneClass =
    tone === "up" ? "text-emerald" : tone === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className="mt-2 text-2xl font-display font-bold text-charcoal">{value}</div>
      {delta && <div className={`mt-1 text-xs ${toneClass}`}>{delta}</div>}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.18em] text-teal font-semibold mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal tracking-tight">
        {title}
      </h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  );
}

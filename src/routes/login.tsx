import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/brand";
import { useAuth, DEMO_CREDENTIALS, type AccountType } from "@/lib/auth-store";
import heroImg from "@/assets/jungfrau-hero.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Jungfrau Pass Wallet" },
      { name: "description", content: "Sign in to your Jungfrau Pass Wallet — tourist or partner account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AccountType>("tourist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const goByType = (t: AccountType) => navigate({ to: t === "tourist" ? "/tourist" : "/partner" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    goByType(res.type);
  };

  const quick = (t: AccountType) => {
    const acc = loginAs(t);
    goByType(acc.type);
  };

  const presetCreds = DEMO_CREDENTIALS.find((c) => c.type === tab)!;
  const fillDemo = () => {
    setEmail(presetCreds.email);
    setPassword(presetCreds.password);
    setError(null);
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: visual */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-card aspect-[4/5] hidden lg:block">
          <img src={heroImg} alt="Jungfrau" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal font-semibold">
              Jungfrau Pass Wallet
            </div>
            <h2 className="font-display font-bold text-3xl mt-2 leading-tight">
              One wallet for the<br />Jungfrau Region.
            </h2>
            <p className="mt-3 text-sm text-white/75 max-w-xs">
              Sign in to your tourist or partner account and continue where you left off.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="rounded-3xl bg-card border border-border shadow-card p-8 md:p-10">
          <div className="text-[10px] uppercase tracking-[0.18em] text-teal font-semibold">
            Welcome back
          </div>
          <h1 className="mt-1 font-display font-bold text-3xl text-charcoal">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your account type and sign in. Use the demo credentials below to skip ahead.
          </p>

          {/* Tabs */}
          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-lg bg-surface">
            {(["tourist", "partner"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                className={`py-2.5 text-sm font-semibold rounded-md transition-all ${
                  tab === t
                    ? "bg-white text-charcoal shadow-soft"
                    : "text-muted-foreground hover:text-charcoal"
                }`}
              >
                {t === "tourist" ? "🏔️ Tourist" : "🍽️ Partner"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-charcoal">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={presetCreds.email}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-charcoal">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-card hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          </form>

          {/* Demo credentials helper */}
          <div className="mt-6 rounded-xl border border-dashed border-teal/40 bg-teal/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-teal font-bold">
                  Demo credentials
                </div>
                <div className="mt-1 text-xs text-charcoal font-mono">
                  {presetCreds.email} / {presetCreds.password}
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs font-semibold text-primary hover:text-teal whitespace-nowrap"
              >
                Fill in →
              </button>
            </div>
            <button
              type="button"
              onClick={() => quick(tab)}
              className="mt-3 w-full py-2 rounded-md bg-white border border-border text-xs font-semibold text-charcoal hover:bg-surface-2"
            >
              One-click sign in as {tab === "tourist" ? "Hans" : "Marco"}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/" className="text-primary font-semibold hover:underline">
              Read about Jungfrau Pass Wallet
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

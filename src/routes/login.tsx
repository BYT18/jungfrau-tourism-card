import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/brand";
import { useAuth, type AccountType } from "@/lib/auth-store";
import heroImg from "@/assets/jungfrau-hero.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Jungfrau Pass Wallet" },
      { name: "description", content: "Sign in or create your Jungfrau Pass Wallet account — tourist or partner." },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const { signIn, signUpTourist, signUpPartner } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AccountType>("tourist");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Germany");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Restaurant");
  const [location, setLocation] = useState("Interlaken");
  const [claimAlpine, setClaimAlpine] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const goByType = (t: AccountType) => navigate({ to: t === "tourist" ? "/tourist" : "/partner" });

  const demoSignIn = async (kind: "tourist" | "partner") => {
    setError(null); setInfo(null); setBusy(true);
    try {
      const demoEmail = kind === "tourist" ? "demo.tourist@jungfrau.app" : "demo.partner@jungfrau.app";
      const demoPassword = "demo1234";
      const demoName = kind === "tourist" ? "Hans Keller" : "Marco Bianchi";

      // Try sign in first
      let res = await signIn(demoEmail, demoPassword);
      if (!res.ok) {
        // Create the account on the fly
        if (kind === "tourist") {
          const up = await signUpTourist({ email: demoEmail, password: demoPassword, name: demoName, country: "Germany" });
          if (!up.ok) { setError(up.error ?? "Demo signup failed."); return; }
        } else {
          const up = await signUpPartner({ email: demoEmail, password: demoPassword, name: demoName, claimAlpine: true });
          if (!up.ok) { setError(up.error ?? "Demo signup failed."); return; }
        }
        res = await signIn(demoEmail, demoPassword);
        if (!res.ok) { setError(res.error ?? "Could not sign in to demo account."); return; }
      }
      goByType(kind);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const res = await signIn(email, password);
        if (!res.ok) {
          setError(res.error ?? "Could not sign in.");
          return;
        }
        if (res.type) goByType(res.type);
        else navigate({ to: "/" });
      } else if (tab === "tourist") {
        const res = await signUpTourist({ email, password, name, country });
        if (!res.ok) { setError(res.error ?? "Sign up failed."); return; }
        const sign = await signIn(email, password);
        if (sign.ok && sign.type) goByType(sign.type);
        else setInfo("Account created. Please check your email to confirm, then sign in.");
      } else {
        const res = await signUpPartner({
          email, password, name,
          claimAlpine,
          businessName: claimAlpine ? undefined : businessName,
          category: claimAlpine ? undefined : category,
          location: claimAlpine ? undefined : location,
        });
        if (!res.ok) { setError(res.error ?? "Sign up failed."); return; }
        const sign = await signIn(email, password);
        if (sign.ok && sign.type) goByType(sign.type);
        else setInfo("Account created. Please check your email to confirm, then sign in.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
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
              Create a tourist account and start using the wallet, or sign your business in as a partner.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-card p-8 md:p-10">
          <div className="text-[10px] uppercase tracking-[0.18em] text-teal font-semibold">
            {mode === "signin" ? "Welcome back" : "Get started"}
          </div>
          <h1 className="mt-1 font-display font-bold text-3xl text-charcoal">
            {mode === "signin" ? "Sign in" : tab === "tourist" ? "Create tourist account" : "Create partner account"}
          </h1>

          {/* Account type tabs */}
          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-lg bg-surface">
            {(["tourist", "partner"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); }}
                className={`py-2.5 text-sm font-semibold rounded-md transition-all ${
                  tab === t ? "bg-white text-charcoal shadow-soft" : "text-muted-foreground hover:text-charcoal"
                }`}
              >
                {t === "tourist" ? "🏔️ Tourist" : "🍽️ Partner"}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="mt-3 flex justify-center text-xs">
            <div className="inline-flex rounded-md bg-surface p-0.5">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); setInfo(null); }}
                  className={`px-3 py-1.5 rounded ${mode === m ? "bg-white text-charcoal font-semibold shadow-soft" : "text-muted-foreground"}`}
                >
                  {m === "signin" ? "Sign in" : tab === "tourist" ? "Sign up as tourist" : tab === "partner" ? "Sign up as partner" : "Sign up"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold text-charcoal">{tab === "partner" ? "Your name" : "Full name"}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                  placeholder={tab === "partner" ? "Marco Bianchi" : "Hans Keller"}
                />
              </label>
            )}

            <label className="block">
              <span className="text-xs font-semibold text-charcoal">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-charcoal">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </label>

            {mode === "signup" && tab === "tourist" && (
              <label className="block">
                <span className="text-xs font-semibold text-charcoal">Home country</span>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            )}

            {mode === "signup" && tab === "partner" && (
              <div className="space-y-3">
                <label className="flex items-start gap-2.5 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={claimAlpine}
                    onChange={(e) => setClaimAlpine(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-charcoal">
                    <span className="font-semibold">Claim demo business: Alpine Fondue House</span>
                    <span className="block text-muted-foreground mt-0.5">Recommended for the hackathon demo. The first partner to sign up claims this seeded business.</span>
                  </span>
                </label>

                {!claimAlpine && (
                  <>
                    <label className="block">
                      <span className="text-xs font-semibold text-charcoal">Business name</span>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal"
                        required
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-charcoal">Category</span>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal"
                        >
                          {["Restaurant", "Hotel", "Activity", "Transport", "Souvenir"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-charcoal">Location</span>
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-charcoal"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs text-emerald bg-emerald/10 border border-emerald/20 rounded-md px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-card hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>New here? <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">Sign in</button></>
            )}
          </div>

          <div className="mt-3 text-center text-[11px] text-muted-foreground">
            <Link to="/" className="hover:text-charcoal">← Back to overview</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

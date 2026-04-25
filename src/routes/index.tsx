import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionTitle, Stat } from "@/components/brand";
import { WalletCard } from "@/components/wallet-ui";
import heroImg from "@/assets/jungfrau-hero.jpg";
import interlakenImg from "@/assets/interlaken.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jungfrau Pass Wallet — One wallet for the Jungfrau Region" },
      {
        name: "description",
        content:
          "Top up once. Pay locally, redeem guest-card benefits, book activities, store tickets and earn alpine rewards across the Jungfrau Region.",
      },
      { property: "og:title", content: "Jungfrau Pass Wallet" },
      {
        property: "og:description",
        content:
          "One wallet for payments, benefits, bookings, tickets and local rewards in the Jungfrau Region.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Jungfrau Region alpine panorama"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 grid lg:grid-cols-[1.2fr_1fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-border text-xs font-medium text-charcoal">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
              Hackathon prototype · Jungfrau Region
            </div>
            <h1 className="mt-6 font-display font-extrabold text-5xl md:text-6xl lg:text-[68px] leading-[1.02] tracking-tight text-charcoal">
              One wallet for the<br />
              <span className="text-primary">Jungfrau Region.</span>
            </h1>
            <p className="mt-6 text-lg text-charcoal/70 max-w-xl">
              Pay, book, redeem benefits and collect alpine rewards — all in one
              digital guest wallet. For tourists, partners and the destination.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/tourist"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-card hover:bg-primary/90 transition-colors"
              >
                Try Hans's journey →
              </Link>
              <Link
                to="/partner"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-border text-charcoal font-semibold hover:bg-surface-2 transition-colors"
              >
                Partner dashboard
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-border text-charcoal font-semibold hover:bg-surface-2 transition-colors"
              >
                Destination view
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              <div>
                <div className="text-2xl font-display font-bold text-charcoal">+20%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Visitor spend</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-charcoal">+15%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Repeat visits</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-charcoal">−18%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Operational cost</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white shadow-card border border-border p-6 max-w-md ml-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-full bg-charcoal text-white grid place-items-center font-semibold">
                    HK
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Hans Keller</div>
                    <div className="text-muted-foreground">Interlaken · Day 1</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-emerald font-semibold">
                  ● Live
                </span>
              </div>
              <WalletCard />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-surface p-3">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Tonight</div>
                  <div className="text-sm font-semibold text-charcoal mt-0.5">Fondue · 20% off</div>
                </div>
                <div className="rounded-lg bg-surface p-3">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Tomorrow</div>
                  <div className="text-sm font-semibold text-charcoal mt-0.5">Eiger Express</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="mx-auto max-w-7xl px-6 -mt-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-destructive font-semibold">
              Problem
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-charcoal">
              Today's alpine trip is fragmented.
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal/80">
              {[
                "Repeated foreign-card fees on every coffee, ticket, hotel.",
                "Paper guest cards, PDFs, separate booking sites.",
                "Partners struggle to validate eligibility manually.",
                "Region has no unified view of guest behavior.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <svg className="h-4 w-4 mt-0.5 text-destructive shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-7 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-emerald font-semibold">
              Solution
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-charcoal">
              The guest card becomes a wallet.
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal/80">
              {[
                "Top up once. Pay foreign-card fees only at top-up.",
                "Digital guest card activates after first overnight stay.",
                "QR/NFC redemption — partners validate in one tap.",
                "Trip Builder, ticket storage, alpine rewards built-in.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <svg className="h-4 w-4 mt-0.5 text-emerald shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.78-9.78a.75.75 0 00-1.06-1.06L9 10.88 7.28 9.16a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd"/></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* THREE ROLES */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <SectionTitle
          eyebrow="Three connected experiences"
          title="One platform — three audiences."
          description="Click into each to explore the working prototype."
        />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            {
              to: "/tourist",
              tag: "Tourist",
              title: "Hans Keller",
              desc: "Spontaneous traveler discovers the region, tops up CHF 1,000, gets his digital guest card and books his trip — all from one app.",
              cta: "Open tourist app",
              accent: "from-primary to-teal",
            },
            {
              to: "/partner",
              tag: "Partner",
              title: "Alpine Fondue House",
              desc: "Restaurant fills its 18:00–19:00 quiet hour with a targeted offer, scans guest QR, validates eligibility automatically.",
              cta: "Open partner dashboard",
              accent: "from-teal to-emerald",
            },
            {
              to: "/admin",
              tag: "Destination",
              title: "Jungfrau Region",
              desc: "Tourism board sees wallet adoption, partner performance, redemption flows and runs sustainability campaigns.",
              cta: "Open destination view",
              accent: "from-charcoal to-primary",
            },
          ].map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft hover:shadow-card transition-shadow"
            >
              <div className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded bg-gradient-to-r ${r.accent} text-white`}>
                {r.tag}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-charcoal">{r.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{r.desc}</p>
              <div className="mt-5 text-sm font-semibold text-primary group-hover:text-teal transition-colors">
                {r.cta} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DEMO METRICS */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <SectionTitle
          eyebrow="Connected ecosystem"
          title="What the pilot region unlocks."
        />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Active wallets" value="2,184" delta="+12% this week" tone="up" />
          <Stat label="Partner volume" value="CHF 184k" delta="+24% MoM" tone="up" />
          <Stat label="Redemption rate" value="78%" delta="vs 31% paper card" tone="up" />
          <Stat label="Avg. session" value="6.4 days" delta="+1.2 days" tone="up" />
        </div>
      </section>

      {/* ROLLOUT */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="rounded-3xl overflow-hidden border border-border bg-charcoal text-white relative">
          <img
            src={interlakenImg}
            alt="Interlaken"
            width={1280}
            height={800}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="relative p-10 md:p-14">
            <div className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
              Rollout plan
            </div>
            <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold max-w-2xl">
              From hackathon demo to regional infrastructure — in four phases.
            </h3>
            <div className="mt-10 grid md:grid-cols-4 gap-5">
              {[
                { n: "01", t: "Hackathon demo", d: "Tourist app · Partner dashboard · Admin view" },
                { n: "02", t: "Interlaken pilot", d: "5 hotels · 5 restaurants · 3 activity providers" },
                { n: "03", t: "Regional expansion", d: "Grindelwald · Wengen · Mürren · Lauterbrunnen" },
                { n: "04", t: "API ecosystem", d: "Partner checkouts · Mountain railways · Transport" },
              ].map((p) => (
                <div key={p.n} className="border-l-2 border-teal/60 pl-4">
                  <div className="text-xs font-mono text-teal">PHASE {p.n}</div>
                  <div className="mt-1 font-display text-lg font-bold">{p.t}</div>
                  <div className="text-xs text-white/70 mt-1">{p.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

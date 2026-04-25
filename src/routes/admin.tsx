import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionTitle, Stat } from "@/components/brand";
import interlakenImg from "@/assets/interlaken.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Destination view — Jungfrau Pass Wallet" },
      {
        name: "description",
        content:
          "How Jungfrau Region tourism manages eligibility rules, partner ecosystem, sustainability campaigns and live regional metrics.",
      },
      { property: "og:title", content: "Destination view · Jungfrau Pass Wallet" },
      {
        property: "og:description",
        content:
          "Region-wide adoption, partner volume, redemption flows and campaign performance.",
      },
      { property: "og:image", content: interlakenImg },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionTitle
            eyebrow="Demo · Destination"
            title="Jungfrau Region · live overview"
            description="The platform owner sees adoption, partner performance, redemption flows and campaign impact in one place."
          />
          <div className="flex items-center gap-3">
            <Link
              to="/partner"
              className="text-sm font-semibold text-primary hover:text-teal"
            >
              ← Partner view
            </Link>
            <Link
              to="/tourist"
              className="text-sm font-semibold text-primary hover:text-teal"
            >
              Tourist app →
            </Link>
          </div>
        </div>

        {/* TOP METRICS */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Active wallets" value="2,184" delta="+12% this week" tone="up" />
          <Stat label="Wallet volume" value="CHF 184,210" delta="+24% MoM" tone="up" />
          <Stat label="Redemptions" value="6,128" delta="78% redemption rate" tone="up" />
          <Stat label="Active partners" value="42" delta="+5 this month" tone="up" />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* MAP */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="relative">
              <img
                src={interlakenImg}
                alt="Jungfrau Region map"
                className="w-full h-72 object-cover"
                loading="lazy"
                width={1280}
                height={800}
              />
              <div className="absolute inset-0 bg-charcoal/30" />
              {/* Pins */}
              {[
                { x: "20%", y: "62%", n: "Interlaken", v: "1,128", c: "bg-primary" },
                { x: "55%", y: "38%", n: "Grindelwald", v: "412", c: "bg-teal" },
                { x: "44%", y: "72%", n: "Lauterbrunnen", v: "284", c: "bg-emerald" },
                { x: "70%", y: "55%", n: "Wengen", v: "188", c: "bg-amber-500" },
                { x: "82%", y: "30%", n: "Mürren", v: "172", c: "bg-purple-500" },
              ].map((p) => (
                <div
                  key={p.n}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: p.x, top: p.y }}
                >
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${p.c} ring-4 ring-white/40 shadow-card animate-pulse`} />
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-charcoal shadow-soft">
                      {p.n} · {p.v}
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 text-[11px] font-semibold text-charcoal shadow-soft">
                Active wallets by village
              </div>
            </div>
          </div>

          {/* TOP OFFERS */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="font-display font-bold text-charcoal">Top offers this week</div>
            <div className="mt-4 space-y-3">
              {[
                { p: "Alpine Fondue House", o: "20% off fondue · early evening", n: 31 },
                { p: "Grindelwald Coffee Co.", o: "Free pastry with espresso", n: 24 },
                { p: "Berghaus Männlichen", o: "15% lunch menu", n: 19 },
                { p: "Lauterbrunnen Falls Café", o: "10% sustainable explorer", n: 14 },
              ].map((r, i) => (
                <div key={r.p} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-surface text-xs font-bold text-charcoal grid place-items-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-charcoal">{r.p}</div>
                    <div className="text-[11px] text-muted-foreground">{r.o}</div>
                  </div>
                  <div className="text-xs font-mono text-emerald">{r.n}×</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* Wallet adoption */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-charcoal">Wallet adoption</div>
                <div className="text-xs text-muted-foreground">
                  Cumulative wallet activations · last 12 weeks
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald/15 text-emerald font-semibold">
                +24% MoM
              </span>
            </div>
            <LineChart />
          </div>

          {/* Category split */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="font-display font-bold text-charcoal">Spend by category</div>
            <div className="text-xs text-muted-foreground">Where wallets are used</div>
            <div className="mt-5 space-y-3">
              {[
                { l: "Hotels", v: 38, c: "bg-primary" },
                { l: "Activities & railways", v: 27, c: "bg-teal" },
                { l: "Restaurants & cafés", v: 22, c: "bg-emerald" },
                { l: "Transport", v: 9, c: "bg-amber-500" },
                { l: "Other", v: 4, c: "bg-charcoal" },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-charcoal">{r.l}</span>
                    <span className="text-muted-foreground font-mono">{r.v}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className={`${r.c} h-full`} style={{ width: `${r.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ELIGIBILITY RULES & CAMPAIGNS */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold">
              Ecosystem rules
            </div>
            <h3 className="font-display text-xl font-bold text-charcoal mt-1">
              Guest-card eligibility & redemption
            </h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                {
                  t: "Eligibility",
                  r: ["Active overnight stay", "Day pass purchase", "Tourism office grant"],
                },
                {
                  t: "Redemption",
                  r: ["Single-use per guest", "Time-window enforced", "Excludes (e.g. drinks)"],
                },
                {
                  t: "Settlement",
                  r: ["Weekly net to bank", "No per-tx card fees", "Live ledger view"],
                },
                {
                  t: "Privacy",
                  r: ["Pseudonymous guest_id", "Partner sees first name only", "Aggregate analytics"],
                },
              ].map((b) => (
                <div key={b.t} className="rounded-lg bg-surface p-3">
                  <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {b.t}
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-charcoal">
                    {b.r.map((x) => (
                      <li key={x}>· {x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold">
              Active campaigns
            </div>
            <h3 className="font-display text-xl font-bold text-charcoal mt-1">
              Loyalty & sustainability
            </h3>
            <div className="mt-4 space-y-3">
              {[
                {
                  t: "Sustainable Voyager",
                  d: "Reward train, bus & cable car trips",
                  p: 64,
                  s: "1,418 participants",
                },
                {
                  t: "Alpine Film Explorer",
                  d: "Visit 5 famous film locations",
                  p: 38,
                  s: "612 in progress",
                },
                {
                  t: "Low-Season Boost",
                  d: "Bonus rewards Apr–May",
                  p: 22,
                  s: "Launching",
                },
              ].map((c) => (
                <div key={c.t} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-charcoal text-sm">{c.t}</div>
                    <span className="text-[10px] text-muted-foreground">{c.s}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.d}</div>
                  <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-emerald" style={{ width: `${c.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PARTNERS TABLE */}
        <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="p-5 border-b border-border">
            <div className="font-display font-bold text-charcoal">Top partners</div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5">Partner</th>
                <th className="px-5 py-2.5">Category</th>
                <th className="px-5 py-2.5">Village</th>
                <th className="px-5 py-2.5">Bookings</th>
                <th className="px-5 py-2.5">Volume</th>
                <th className="px-5 py-2.5">Redemption</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Hotel Interlaken Central", "Hotel", "Interlaken", "184", "CHF 38,420", "92%"],
                ["Jungfrau Railways", "Activity", "Region", "421", "CHF 31,118", "88%"],
                ["Alpine Fondue House", "Restaurant", "Interlaken", "42", "CHF 2,418", "78%"],
                ["Grindelwald First", "Activity", "Grindelwald", "212", "CHF 18,240", "84%"],
                ["Berghaus Männlichen", "Restaurant", "Wengen", "98", "CHF 6,818", "71%"],
              ].map((r) => (
                <tr key={r[0]} className="border-t border-border">
                  {r.map((c, i) => (
                    <td key={i} className={`px-5 py-3 ${i === 0 ? "font-semibold text-charcoal" : "text-charcoal/80"}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}

function LineChart() {
  const data = [120, 180, 240, 280, 360, 480, 612, 780, 980, 1240, 1620, 2184];
  const max = Math.max(...data);
  const w = 100;
  const h = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  const path = `M ${points[0]} L ${points.slice(1).join(" L ")}`;
  const fill = `M 0,${h} L ${points.join(" L ")} L ${w},${h} Z`;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-44">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.395 0.156 260)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.395 0.156 260)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#lg)" />
        <path d={path} stroke="oklch(0.395 0.156 260)" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => {
          const [x, y] = p.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="0.8" fill="oklch(0.66 0.108 210)" />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Wk 1</span><span>Wk 12</span>
      </div>
    </div>
  );
}

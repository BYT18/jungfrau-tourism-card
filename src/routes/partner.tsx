import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionTitle, Stat } from "@/components/brand";
import { Toast, useToast, QRBlock } from "@/components/wallet-ui";
import { useWallet, fmtCHF } from "@/lib/wallet-store";
import fondueImg from "@/assets/fondue.jpg";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner dashboard — Jungfrau Pass Wallet" },
      {
        name: "description",
        content:
          "Lightweight partner dashboard: create offers, validate guest eligibility via QR, track bookings and analytics.",
      },
      { property: "og:title", content: "Partner dashboard · Jungfrau Pass Wallet" },
      {
        property: "og:description",
        content:
          "How Alpine Fondue House fills its quiet hour and validates wallet guests in seconds.",
      },
    ],
  }),
  component: PartnerDashboard,
});

type Tab = "overview" | "offers" | "bookings" | "scan" | "settle";

function PartnerDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { msg, show } = useToast();

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionTitle
            eyebrow="Demo · Partner"
            title="Alpine Fondue House dashboard"
            description="Create targeted offers, receive bookings from the wallet, validate guest eligibility with one scan."
          />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Signed in as</div>
              <div className="text-sm font-semibold text-charcoal">Marco · Manager</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-charcoal text-white grid place-items-center font-semibold">
              MA
            </div>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-6">
          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-24 self-start rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-surface">
              <img src={fondueImg} alt="Fondue" className="w-10 h-10 rounded-md object-cover" loading="lazy" width={1024} height={768} />
              <div>
                <div className="font-display font-bold text-sm text-charcoal">Alpine Fondue House</div>
                <div className="text-[10px] text-muted-foreground">Restaurant · Interlaken</div>
              </div>
            </div>
            {[
              { id: "overview", label: "Overview", i: "📊" },
              { id: "offers", label: "Offers", i: "🎟️" },
              { id: "bookings", label: "Bookings", i: "📅" },
              { id: "scan", label: "Scan QR", i: "📱" },
              { id: "settle", label: "Settlement", i: "💳" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left ${
                  tab === t.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-charcoal/70 hover:bg-surface-2"
                }`}
              >
                <span>{t.i}</span>
                {t.label}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <Link to="/tourist" className="block text-[11px] text-teal font-semibold hover:text-primary px-3 py-1">
                ← Tourist app
              </Link>
              <Link to="/admin" className="block text-[11px] text-teal font-semibold hover:text-primary px-3 py-1">
                Destination view →
              </Link>
            </div>
          </aside>

          {/* CONTENT */}
          <div>
            {tab === "overview" && <Overview />}
            {tab === "offers" && <Offers onToast={show} />}
            {tab === "bookings" && <Bookings />}
            {tab === "scan" && <ScanTab onToast={show} />}
            {tab === "settle" && <Settlement />}
          </div>
        </div>
      </section>
      <Toast msg={msg} />
    </PageShell>
  );
}

function Overview() {
  const { bookings, offers } = useWallet();
  const redemptions = offers.reduce((s, o) => s + o.redemptions, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Wallet bookings" value="42" delta="+18% vs week" tone="up" />
        <Stat label="Redemptions" value={String(redemptions)} delta="+9 today" tone="up" />
        <Stat label="Quiet-hour fill" value="74%" delta="from 41% baseline" tone="up" />
        <Stat label="Avg. spend" value={fmtCHF(58.4).replace("CHF ", "CHF ")} delta="−12% (discount)" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-bold text-charcoal">Bookings · last 14 days</div>
              <div className="text-xs text-muted-foreground">Wallet bookings vs walk-ins</div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Wallet</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-border" />Walk-in</span>
            </div>
          </div>
          <BarChart />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="font-display font-bold text-charcoal">Today's bookings</div>
          <div className="mt-3 space-y-2">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-xs py-2 border-b border-border last:border-0">
                <div>
                  <div className="font-semibold text-charcoal">{b.guestName}</div>
                  <div className="text-muted-foreground">{b.time} · {b.people}p</div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    b.redemption === "confirmed"
                      ? "bg-emerald/15 text-emerald"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.redemption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart() {
  // Mock 14 days of data
  const data = [12, 15, 11, 18, 22, 24, 19, 27, 31, 29, 35, 33, 38, 42];
  const walkin = [22, 24, 21, 19, 18, 23, 20, 17, 18, 16, 14, 15, 16, 14];
  const max = Math.max(...data, ...walkin);
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end h-full">
            <div
              className="flex-1 bg-primary rounded-t-md transition-all"
              style={{ height: `${(v / max) * 100}%` }}
              title={`Wallet: ${v}`}
            />
            <div
              className="flex-1 bg-border rounded-t-md"
              style={{ height: `${(walkin[i] / max) * 100}%` }}
            />
          </div>
          {i % 2 === 0 && <div className="text-[9px] text-muted-foreground">D{i + 1}</div>}
        </div>
      ))}
    </div>
  );
}

function Offers({ onToast }: { onToast: (s: string) => void }) {
  const { offers, toggleOffer, createOffer } = useWallet();
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-charcoal">Active offers</h3>
        <button
          onClick={() => setCreating((c) => !c)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-soft"
        >
          + New offer
        </button>
      </div>

      {creating && (
        <NewOfferForm
          onCreate={(o) => {
            createOffer(o);
            setCreating(false);
            onToast("Offer published — visible to nearby guests");
          }}
        />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {offers.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">
                  {o.category}
                </div>
                <div className="font-display font-bold text-charcoal mt-1">{o.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.validTime}</div>
              </div>
              <div className="text-3xl font-display font-extrabold text-emerald">
                {o.discount}%
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-surface p-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Views</div>
                <div className="text-sm font-bold text-charcoal">{o.views}</div>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Booked</div>
                <div className="text-sm font-bold text-charcoal">{o.redemptions}</div>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">CR</div>
                <div className="text-sm font-bold text-charcoal">
                  {o.views ? Math.round((o.redemptions / o.views) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {o.excludes?.map((e) => (
                  <span key={e} className="text-[10px] px-1.5 py-0.5 bg-surface rounded text-muted-foreground">
                    excl. {e}
                  </span>
                ))}
                <span className="text-[10px] px-1.5 py-0.5 bg-surface rounded text-muted-foreground">
                  {o.redemptionType.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={() => toggleOffer(o.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md ${
                  o.active
                    ? "bg-emerald/10 text-emerald"
                    : "bg-surface text-muted-foreground"
                }`}
              >
                {o.active ? "● Active" : "○ Paused"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewOfferForm({
  onCreate,
}: {
  onCreate: (o: {
    title: string;
    discount: number;
    validTime: string;
    category: string;
    redemptionType: "single_use" | "multi_use";
    excludes?: string[];
  }) => void;
}) {
  const [title, setTitle] = useState("Late lunch · 25% off mains");
  const [discount, setDiscount] = useState(25);
  const [time, setTime] = useState("14:00 – 16:00");
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="font-display font-bold text-charcoal">New offer</div>
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <label className="text-xs text-muted-foreground">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-white text-sm text-charcoal"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Discount %
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-white text-sm text-charcoal"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Valid time
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-white text-sm text-charcoal"
          />
        </label>
      </div>
      <button
        onClick={() =>
          onCreate({
            title,
            discount,
            validTime: time,
            category: "Restaurant",
            redemptionType: "single_use",
            excludes: ["drinks"],
          })
        }
        className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
      >
        Publish offer
      </button>
    </div>
  );
}

function Bookings() {
  const { bookings } = useWallet();
  return (
    <div>
      <h3 className="font-display font-bold text-xl text-charcoal mb-4">Bookings</h3>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">People</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-charcoal">{b.guestName}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.date} · {b.time}</td>
                <td className="px-4 py-3">{b.people}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.offerTitle}</td>
                <td className="px-4 py-3 text-emerald font-mono">−{fmtCHF(b.estimatedDiscount ?? 0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                      b.status === "redeemed"
                        ? "bg-emerald/15 text-emerald"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScanTab({ onToast }: { onToast: (s: string) => void }) {
  const { bookings, redeemFondue } = useWallet();
  const [scanned, setScanned] = useState(false);
  const hansBooking = bookings.find((b) => b.id === "bk_hans");

  const valid = !!hansBooking && hansBooking.redemption === "pending";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display font-bold text-xl text-charcoal">Scan guest QR</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Point any phone camera at the guest's QR. The validator does the rest.
        </p>
        <div className="mt-5 aspect-square rounded-2xl border-2 border-dashed border-border bg-surface grid place-items-center relative overflow-hidden">
          <QRBlock value="JF-WALLET-HANS-FONDUE-18:30" size={180} />
          <div className="absolute inset-x-6 top-1/2 h-0.5 bg-primary/70 animate-pulse" />
        </div>
        <button
          onClick={() => {
            setScanned(true);
            onToast("QR captured — checking eligibility…");
          }}
          className="mt-5 w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
        >
          Simulate scan
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display font-bold text-xl text-charcoal">Validation result</h3>
        {!scanned ? (
          <div className="mt-5 text-sm text-muted-foreground">
            Awaiting scan. Tip: in the tourist app, complete steps 1–4 first so a
            pending booking exists for Hans.
          </div>
        ) : valid ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-lg bg-emerald/10 border border-emerald/30 px-4 py-3">
              <div className="text-emerald text-xs font-semibold uppercase tracking-wider">
                ✓ Eligible
              </div>
              <div className="font-display font-bold text-charcoal mt-1">
                Apply 20% on food · drinks excluded
              </div>
            </div>
            {[
              ["Guest", "Hans Keller"],
              ["Guest card", "Active overnight"],
              ["Offer", "20% off · 18:00–19:00"],
              ["Time check", "✓ within window"],
              ["Single-use", "✓ not yet redeemed"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1.5 border-b border-border">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-charcoal font-medium">{v}</span>
              </div>
            ))}
            <div className="pt-2">
              <div className="text-xs text-muted-foreground">Bill</div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Subtotal</span>
                <span>CHF 72.00</span>
              </div>
              <div className="flex justify-between text-sm text-emerald font-semibold">
                <span>Discount applied</span>
                <span>−CHF 12.00</span>
              </div>
              <div className="flex justify-between text-base font-display font-bold text-charcoal mt-1 pt-2 border-t border-border">
                <span>Charge wallet</span>
                <span>CHF 60.00</span>
              </div>
            </div>
            <button
              onClick={() => {
                redeemFondue();
                onToast("Wallet charged · Redemption confirmed");
                setScanned(false);
              }}
              className="w-full py-3 rounded-lg bg-emerald text-white font-semibold"
            >
              Confirm payment & redemption
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-surface px-4 py-3 text-sm text-muted-foreground">
            No pending booking found for this guest. Either it was already redeemed,
            or the tourist hasn't booked yet — head to{" "}
            <Link to="/tourist" className="text-primary font-semibold">the tourist app</Link>{" "}
            and complete step 4.
          </div>
        )}
      </div>
    </div>
  );
}

function Settlement() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="This week" value="CHF 2,418" />
        <Stat label="Pending settlement" value="CHF 612" />
        <Stat label="Discount cost" value="CHF 304" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="font-display font-bold text-charcoal">Settlement schedule</div>
        <div className="text-sm text-muted-foreground mt-1">
          Net wallet revenue is settled to your bank every Tuesday. No
          per-transaction card fees.
        </div>
        <table className="w-full text-sm mt-4">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left py-2">Period</th>
              <th className="text-left py-2">Wallet revenue</th>
              <th className="text-left py-2">Discounts</th>
              <th className="text-left py-2">Net</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["W14", "CHF 2,818", "−CHF 312", "CHF 2,506", "Settled"],
              ["W15", "CHF 2,418", "−CHF 304", "CHF 2,114", "Pending"],
            ].map((r) => (
              <tr key={r[0]} className="border-t border-border">
                {r.map((c, i) => (
                  <td key={i} className="py-2.5 text-charcoal">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

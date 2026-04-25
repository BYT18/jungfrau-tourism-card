import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionTitle } from "@/components/brand";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture & data model — Jungfrau Pass Wallet" },
      {
        name: "description",
        content:
          "Technical architecture of the Jungfrau Pass Wallet prototype: simulated closed-loop ledger, rules engine, QR redemption, partner APIs.",
      },
      { property: "og:title", content: "Architecture · Jungfrau Pass Wallet" },
      {
        property: "og:description",
        content:
          "Simulated closed-loop ledger, offer rules engine, QR redemption, partner API.",
      },
    ],
  }),
  component: Architecture,
});

function Architecture() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20">
        <SectionTitle
          eyebrow="Technical"
          title="Architecture & data model"
          description="For the hackathon, the wallet is a simulated closed-loop ledger. In production it can connect to licensed payment providers or existing infrastructure."
        />

        {/* DIAGRAM */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="grid lg:grid-cols-3 gap-4 text-sm">
            <Block tone="primary" title="Tourist App" items={["Top-up", "Wallet payments", "QR redemption", "Trip Builder", "Tickets & rewards"]} />
            <Block tone="emerald" title="Partner Dashboard" items={["Offer creation", "Booking inbox", "QR validator", "Settlement"]} />
            <Block tone="charcoal" title="Destination Admin" items={["Eligibility rules", "Campaigns", "Partner roster", "Live analytics"]} />
          </div>

          <div className="my-6 flex items-center justify-center">
            <svg viewBox="0 0 120 30" className="w-full max-w-md text-border">
              <line x1="20" y1="0" x2="20" y2="30" stroke="currentColor" strokeWidth="0.8" />
              <line x1="60" y1="0" x2="60" y2="30" stroke="currentColor" strokeWidth="0.8" />
              <line x1="100" y1="0" x2="100" y2="30" stroke="currentColor" strokeWidth="0.8" />
              <line x1="20" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </div>

          <div className="rounded-xl bg-charcoal text-white p-6">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold">
              Core backend
            </div>
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["User Service", "Guests, partners, roles"],
                ["Wallet Ledger", "Simulated closed-loop"],
                ["Rules Engine", "Eligibility · time · exclusions"],
                ["Booking Service", "Capacity & reservations"],
                ["QR Redemption", "Signed tokens, single-use"],
                ["Tickets & Invoices", "Wallet-stored, offline ready"],
                ["Recommendations", "Trip Builder · routes"],
                ["Analytics", "Aggregate destination view"],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="font-display font-semibold">{t}</div>
                  <div className="text-[11px] text-white/60 mt-0.5">{d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { t: "Partner API", d: "POST /wallet/payment-request · /confirm-payment · /tickets/add-to-wallet" },
              { t: "Webhook events", d: "redemption.confirmed · booking.created · achievement.unlocked" },
              { t: "Identity layer", d: "Pseudonymous guest_id · partner sees first name only" },
            ].map((c) => (
              <div key={c.t} className="rounded-lg border border-border p-4 bg-surface">
                <div className="text-[11px] uppercase tracking-wider text-teal font-semibold">{c.t}</div>
                <div className="text-sm text-charcoal mt-1 font-mono">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DATA MODEL */}
        <div className="mt-12">
          <SectionTitle
            eyebrow="Data model"
            title="Simplified entities"
            description="Five entities power the entire prototype."
          />
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CodeCard
              title="Guest"
              code={`{
  "guest_id": "guest_102",
  "name": "Hans Keller",
  "guest_type": "overnight_guest",
  "wallet_id": "wallet_102",
  "guest_card_status": "active",
  "home_country": "Germany"
}`}
            />
            <CodeCard
              title="Wallet"
              code={`{
  "wallet_id": "wallet_102",
  "balance": 775.00,
  "currency": "CHF",
  "status": "active"
}`}
            />
            <CodeCard
              title="Partner"
              code={`{
  "partner_id": "partner_045",
  "name": "Alpine Fondue House",
  "type": "restaurant",
  "location": "Interlaken",
  "accepts_wallet": true
}`}
            />
            <CodeCard
              title="Offer"
              code={`{
  "offer_id": "offer_301",
  "title": "20% off fondue dishes",
  "discount_value": 20,
  "valid_time": "18:00-19:00",
  "excluded_items": ["drinks"],
  "redemption_type": "single_use"
}`}
            />
            <CodeCard
              title="Booking"
              code={`{
  "booking_id": "booking_908",
  "guest_id": "guest_102",
  "partner_id": "partner_045",
  "offer_id": "offer_301",
  "time": "18:30",
  "status": "confirmed"
}`}
            />
            <CodeCard
              title="Redemption"
              code={`{
  "redemption_id": "red_502",
  "booking_id": "booking_908",
  "status": "confirmed",
  "confirmed_by": "partner_dashboard",
  "timestamp": "2026-04-25T18:32:00"
}`}
            />
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
            Honest scope
          </div>
          <div className="mt-2 text-charcoal text-sm max-w-3xl">
            We are not building a bank. The wallet is a <strong>simulated closed-loop
            ledger</strong> for the hackathon. In production, balances connect to
            licensed payment providers (e.g. TWINT, card acquirers) and settlement
            uses existing partner infrastructure. The frontend, rules engine, QR
            redemption logic and partner API surface are all real.
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Block({
  tone,
  title,
  items,
}: {
  tone: "primary" | "emerald" | "charcoal";
  title: string;
  items: string[];
}) {
  const toneMap = {
    primary: "border-primary/30 bg-primary/5",
    emerald: "border-emerald/30 bg-emerald/5",
    charcoal: "border-charcoal/20 bg-charcoal/5",
  };
  return (
    <div className={`rounded-xl border p-5 ${toneMap[tone]}`}>
      <div className="font-display font-bold text-charcoal">{title}</div>
      <ul className="mt-2 space-y-1 text-xs text-charcoal/80">
        {items.map((i) => (
          <li key={i}>· {i}</li>
        ))}
      </ul>
    </div>
  );
}

function CodeCard({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
      <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
        <div className="text-xs font-display font-bold text-charcoal">{title}</div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive/60" />
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="w-2 h-2 rounded-full bg-emerald" />
        </div>
      </div>
      <pre className="text-[11px] font-mono text-charcoal p-4 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

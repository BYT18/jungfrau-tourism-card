import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionTitle } from "@/components/brand";
import { RequireAuth } from "@/components/require-auth";
import {
  PhoneFrame,
  WalletCard,
  BottomNav,
  QRBlock,
  Toast,
  useToast,
  DemoCue,
} from "@/components/wallet-ui";
import { useWallet, fmtCHF } from "@/lib/wallet-store";
import fondueImg from "@/assets/fondue.jpg";
import hotelImg from "@/assets/hotel.jpg";
import eigerImg from "@/assets/eiger.jpg";

export const Route = createFileRoute("/tourist")({
  head: () => ({
    meta: [
      { title: "Tourist app demo — Jungfrau Pass Wallet" },
      {
        name: "description",
        content:
          "Walk through Hans's journey: top up, book the hotel, redeem the fondue offer with QR, plan an alpine route and unlock a reward.",
      },
      { property: "og:title", content: "Tourist app · Jungfrau Pass Wallet" },
      {
        property: "og:description",
        content:
          "Hans's journey through the Jungfrau Region — wallet, guest card, restaurant offer, Trip Builder and rewards.",
      },
    ],
  }),
  component: () => (
    <RequireAuth type="tourist">
      <TouristApp />
    </RequireAuth>
  ),
});

type Screen =
  | "onboard"
  | "topup"
  | "home"
  | "discover"
  | "fondue"
  | "qr"
  | "trip"
  | "eiger"
  | "reward"
  | "tickets"
  | "rewards";

function TouristApp() {
  const [screen, setScreen] = useState<Screen>("onboard");
  const [tab, setTab] = useState("home");
  const { msg, show } = useToast();
  const wallet = useWallet();

  const goto = (s: Screen) => setScreen(s);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20">
        <SectionTitle
          eyebrow="Demo · Tourist app"
          title="Hans Keller's day in the Jungfrau Region"
          description="Click through the storyline on the right. Each action updates the shared wallet state — visible from the partner and destination views too."
        />

        <div className="mt-10 grid lg:grid-cols-[1fr_auto] gap-12 items-start">
          {/* SCENES PANEL */}
          <div className="space-y-3">
            <Scene
              n="01"
              title="Arrival at Interlaken Ost"
              desc="Hans paid foreign-card fees on his first coffee. He visits the tourism kiosk and discovers the wallet."
              done={screen !== "onboard"}
              active={screen === "onboard"}
              cta="Start onboarding"
              onClick={() => goto("topup")}
            />
            <Scene
              n="02"
              title="Top up CHF 1,000"
              desc="One foreign-card fee at top-up — then local payments inside the regional ecosystem."
              done={wallet.scenesCompleted.topup}
              active={screen === "topup"}
              cta="Open top-up"
              onClick={() => goto("topup")}
            />
            <Scene
              n="03"
              title="Hotel check-in activates the guest card"
              desc="Pay the hotel via QR/NFC. The digital guest card becomes active automatically."
              done={wallet.scenesCompleted.hotel}
              active={screen === "home"}
              cta="Pay hotel"
              onClick={() => {
                wallet.payHotel();
                show("Hotel paid · Guest card now active");
                goto("home");
              }}
            />
            <Scene
              n="04"
              title="Fondue offer · 18:00–19:00"
              desc="App suggests a 20% off restaurant offer for the quiet hour. Hans books in two taps."
              done={wallet.scenesCompleted.restaurant}
              active={screen === "fondue"}
              cta="Open offer"
              onClick={() => goto("fondue")}
            />
            <Scene
              n="05"
              title="QR redemption at the table"
              desc="Restaurant scans Hans's QR. Eligibility, time slot, exclusions — all checked automatically."
              done={wallet.scenesCompleted.qr}
              active={screen === "qr"}
              cta="Show QR"
              onClick={() => goto("qr")}
            />
            <Scene
              n="06"
              title="Trip Builder · Alpine Film Locations"
              desc="One curated route, one checkout. Tickets land in the wallet."
              done={wallet.scenesCompleted.trip}
              active={screen === "trip"}
              cta="Plan route"
              onClick={() => goto("trip")}
            />
            <Scene
              n="07"
              title="Eiger Express via partner website"
              desc="External checkout offers Jungfrau Pass Wallet alongside Visa, Mastercard, TWINT."
              done={wallet.scenesCompleted.eiger}
              active={screen === "eiger"}
              cta="External checkout"
              onClick={() => goto("eiger")}
            />
            <Scene
              n="08"
              title="Reward unlocked"
              desc="Alpine Film Explorer souvenir — collect at the nearest tourism office."
              done={wallet.scenesCompleted.reward}
              active={screen === "reward"}
              cta="See reward"
              onClick={() => goto("reward")}
            />

            <div className="pt-4 flex gap-3">
              <Link
                to="/partner"
                className="text-sm font-semibold text-primary hover:text-teal"
              >
                See it from the partner side →
              </Link>
              <Link
                to="/admin"
                className="text-sm font-semibold text-primary hover:text-teal"
              >
                See destination metrics →
              </Link>
            </div>
          </div>

          {/* PHONE */}
          <div className="lg:sticky lg:top-24 mx-auto">
            <PhoneFrame>
              {screen === "onboard" && <OnboardScreen onNext={() => goto("topup")} />}
              {screen === "topup" && (
                <TopUpScreen
                  onDone={() => {
                    wallet.topUp(1000);
                    show("CHF 1,000 added · Foreign-card fee paid once");
                    goto("home");
                  }}
                />
              )}
              {(screen === "home" ||
                screen === "discover" ||
                screen === "tickets" ||
                screen === "rewards") && (
                <>
                  {tab === "home" && <HomeScreen onOpenFondue={() => goto("fondue")} />}
                  {tab === "discover" && <DiscoverScreen onOpenFondue={() => goto("fondue")} onOpenTrip={() => goto("trip")} />}
                  {tab === "tickets" && <TicketsScreen />}
                  {tab === "rewards" && <RewardsScreen />}
                  <BottomNav active={tab} onChange={setTab} />
                </>
              )}
              {screen === "fondue" && (
                <FondueScreen
                  onBook={() => {
                    wallet.bookFondue();
                    show("Table booked · 18:30 · 20% off attached");
                    goto("qr");
                  }}
                />
              )}
              {screen === "qr" && (
                <QRScreen
                  onPaid={() => {
                    wallet.redeemFondue();
                    show("Paid CHF 60.00 · Saved CHF 12.00");
                    setTab("home");
                    goto("home");
                  }}
                />
              )}
              {screen === "trip" && (
                <TripBuilderScreen
                  onBook={() => {
                    wallet.bookTripBuilder();
                    show("Trip booked · Tickets in wallet");
                    goto("eiger");
                  }}
                />
              )}
              {screen === "eiger" && (
                <EigerExternalScreen
                  onPaid={() => {
                    wallet.payEigerExpress();
                    show("Eiger Express ticket added to wallet");
                    goto("reward");
                  }}
                />
              )}
              {screen === "reward" && (
                <RewardScreen
                  onUnlock={() => {
                    wallet.unlockReward();
                    show("🎬 Alpine Film Explorer unlocked!");
                    setTab("rewards");
                    goto("rewards");
                  }}
                />
              )}
            </PhoneFrame>
          </div>
        </div>
      </section>
      <Toast msg={msg} />
    </PageShell>
  );
}

/* ---------- Storyline scene card ---------- */
function Scene({
  n,
  title,
  desc,
  done,
  active,
  cta,
  onClick,
}: {
  n: string;
  title: string;
  desc: string;
  done?: boolean;
  active?: boolean;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-4 p-5 rounded-xl border transition-all ${
        active
          ? "bg-primary/5 border-primary shadow-soft"
          : done
            ? "bg-emerald/5 border-emerald/20"
            : "bg-card border-border hover:border-primary/40"
      }`}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-full grid place-items-center font-mono text-xs font-bold ${
          done
            ? "bg-emerald text-white"
            : active
              ? "bg-primary text-white"
              : "bg-surface text-charcoal/60"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <div className="flex-1">
        <div className="font-display font-bold text-charcoal">{title}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <div
        className={`text-xs font-semibold whitespace-nowrap self-center ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {cta} →
      </div>
    </button>
  );
}

/* ---------- Phone screens ---------- */

function OnboardScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-44 bg-gradient-hero relative">
        <div className="absolute inset-0 grid place-items-center">
          <svg viewBox="0 0 24 24" className="h-14 w-14 text-white/95" fill="none">
            <path d="M3 19L9 9l4 6 3-4 5 8H3z" fill="currentColor" />
            <circle cx="16" cy="6" r="2" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
      </div>
      <div className="px-6 py-7 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-teal font-semibold">
          Welcome
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-charcoal">
          Your alpine wallet, ready in 60 seconds.
        </h2>
        <p className="mt-3 text-sm text-charcoal/70">
          Top up once. Pay across hotels, restaurants, trains and activities. Get
          your digital guest card automatically.
        </p>

        <div className="mt-6 space-y-2">
          {[
            { t: "Avoid repeated foreign-card fees", i: "💳" },
            { t: "Digital guest card with all benefits", i: "🎫" },
            { t: "QR redemption · Tickets stored", i: "📱" },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-3 text-sm text-charcoal">
              <div className="w-8 h-8 rounded-full bg-teal/10 grid place-items-center">{b.i}</div>
              {b.t}
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className="mt-7 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
        >
          Activate my wallet
        </button>
        <div className="mt-3 text-center text-[11px] text-muted-foreground">
          Simulated closed-loop ledger · Hackathon prototype
        </div>
      </div>
    </div>
  );
}

function TopUpScreen({ onDone }: { onDone: () => void }) {
  const [amount, setAmount] = useState(1000);
  const fee = (amount * 0.015).toFixed(2);
  return (
    <div className="px-6 py-6">
      <div className="text-[10px] uppercase tracking-[0.18em] text-teal font-semibold">
        Step 02
      </div>
      <h2 className="mt-1 font-display text-2xl font-bold text-charcoal">Top up your wallet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        One foreign-card fee here, instead of dozens of small ones across the trip.
      </p>

      <div className="mt-5 rounded-2xl border border-border p-5 bg-surface">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xs text-muted-foreground font-mono">CHF</span>
          <input
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            className="text-3xl font-display font-bold text-charcoal bg-transparent outline-none w-full"
            inputMode="numeric"
          />
        </div>
        <div className="mt-3 flex gap-2">
          {[200, 500, 1000, 1500].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={`flex-1 py-1.5 text-xs rounded-md border ${
                amount === v
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-charcoal"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border p-4 bg-card">
        <div className="text-xs font-semibold text-charcoal mb-2">Pay with</div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-primary bg-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-5 rounded bg-charcoal" />
            <div className="text-sm font-medium">Visa · 1024</div>
          </div>
          <svg className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"/></svg>
        </div>
        <div className="mt-3 flex justify-between text-xs">
          <span className="text-muted-foreground">Top-up amount</span>
          <span className="text-charcoal">CHF {amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">Foreign-card fee (1.5%)</span>
          <span className="text-charcoal">CHF {fee}</span>
        </div>
        <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border font-semibold">
          <span className="text-charcoal">You'll be charged</span>
          <span className="text-charcoal">CHF {(amount + Number(fee)).toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onDone}
        className="mt-5 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
      >
        Confirm top-up
      </button>
    </div>
  );
}

function HomeScreen({ onOpenFondue }: { onOpenFondue: () => void }) {
  const { transactions, guestStatus } = useWallet();
  return (
    <div className="px-5 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground">Good evening</div>
          <div className="font-display font-bold text-charcoal">Hans</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-charcoal text-white grid place-items-center font-semibold text-sm">
          HK
        </div>
      </div>
      <WalletCard />

      {guestStatus === "active" && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald/10 border border-emerald/30">
          <div className="text-lg">🎫</div>
          <div className="text-xs text-charcoal">
            <div className="font-semibold">Digital guest card active</div>
            <div className="text-muted-foreground">Eligible for partner benefits</div>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          { i: "📲", t: "Pay" },
          { i: "↑", t: "Top up" },
          { i: "🎟️", t: "Tickets" },
          { i: "🧭", t: "Trip" },
        ].map((a) => (
          <button key={a.t} className="rounded-xl bg-surface p-3 flex flex-col items-center gap-1">
            <span className="text-lg">{a.i}</span>
            <span className="text-[10px] font-medium text-charcoal">{a.t}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenFondue}
        className="mt-5 w-full text-left rounded-xl overflow-hidden border border-border bg-card relative"
      >
        <img src={fondueImg} alt="Fondue" className="h-28 w-full object-cover" loading="lazy" width={1024} height={768} />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald text-white text-[10px] font-semibold">
          20% off · ends 19:00
        </div>
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">
            Suggested for tonight
          </div>
          <div className="font-display font-bold text-charcoal">Alpine Fondue House</div>
          <div className="text-xs text-muted-foreground">4 min walk · Quiet hour offer</div>
        </div>
      </button>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Recent activity
        </div>
        <div className="space-y-1.5">
          {transactions.length === 0 && (
            <div className="text-xs text-muted-foreground italic">No transactions yet.</div>
          )}
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white grid place-items-center text-base">
                  {t.icon}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-charcoal">{t.partner}</div>
                  <div className="text-muted-foreground">{t.time}{t.discount ? ` · saved ${fmtCHF(t.discount)}` : ""}</div>
                </div>
              </div>
              <div className={`text-sm font-mono font-semibold ${t.amount > 0 ? "text-emerald" : "text-charcoal"}`}>
                {t.amount > 0 ? "+" : ""}{fmtCHF(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscoverScreen({ onOpenFondue, onOpenTrip }: { onOpenFondue: () => void; onOpenTrip: () => void }) {
  return (
    <div className="px-5 py-4 pb-24">
      <h2 className="font-display font-bold text-xl text-charcoal">Discover</h2>
      <input
        placeholder="Search hotels, food, activities…"
        className="mt-3 w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm"
      />

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {["All", "Tonight", "Sustainable", "Indoor", "Family"].map((c, i) => (
          <button
            key={c}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              i === 0 ? "bg-charcoal text-white" : "bg-surface text-charcoal"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        onClick={onOpenTrip}
        className="mt-4 w-full text-left rounded-xl overflow-hidden border border-border bg-card relative"
      >
        <img src={eigerImg} alt="Eiger Express" className="h-28 w-full object-cover" loading="lazy" width={1024} height={768} />
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">Trip Builder</div>
          <div className="font-display font-bold text-charcoal">Alpine Film Locations</div>
          <div className="text-xs text-muted-foreground">5 stops · ~7h · saves CHF 38</div>
        </div>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { t: "Fondue · 20% off", img: fondueImg, sub: "18:00–19:00", onClick: onOpenFondue },
          { t: "Hotel Central", img: hotelImg, sub: "From CHF 165" },
        ].map((c) => (
          <button
            key={c.t}
            onClick={c.onClick}
            className="rounded-xl overflow-hidden border border-border bg-card text-left"
          >
            <img src={c.img} alt={c.t} className="h-20 w-full object-cover" loading="lazy" width={1024} height={768} />
            <div className="p-2.5">
              <div className="text-xs font-semibold text-charcoal">{c.t}</div>
              <div className="text-[10px] text-muted-foreground">{c.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FondueScreen({ onBook }: { onBook: () => void }) {
  return (
    <div className="pb-24">
      <div className="relative h-44">
        <img src={fondueImg} alt="Fondue" className="w-full h-full object-cover" loading="lazy" width={1024} height={768} />
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-emerald text-white text-[10px] font-semibold shadow-card">
          20% off · 18:00–19:00
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">Restaurant</div>
        <h2 className="font-display text-2xl font-bold text-charcoal mt-1">
          Alpine Fondue House
        </h2>
        <div className="text-xs text-muted-foreground mt-1">★ 4.7 · Swiss · Interlaken · 4 min walk</div>

        <div className="mt-4 rounded-xl border border-emerald/30 bg-emerald/5 p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald font-semibold">
                Quiet-hour benefit
              </div>
              <div className="font-display font-bold text-charcoal mt-1">
                20% off fondue dishes
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Drinks excluded · single use per guest
              </div>
            </div>
            <div className="text-2xl">🫕</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold text-charcoal mb-2">Choose time</div>
          <div className="grid grid-cols-4 gap-2">
            {["18:00", "18:30", "18:45", "19:00"].map((t, i) => (
              <button
                key={t}
                className={`py-2 text-xs rounded-lg border ${
                  i === 1 ? "bg-primary text-white border-primary" : "bg-white border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-surface p-3 text-xs text-charcoal/80">
          <div className="flex justify-between"><span>Estimated total</span><span>CHF 72.00</span></div>
          <div className="flex justify-between mt-1 text-emerald font-semibold">
            <span>Wallet discount</span><span>−CHF 12.00</span>
          </div>
        </div>

        <button
          onClick={onBook}
          className="mt-5 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
        >
          Reserve table · 18:30
        </button>
      </div>
    </div>
  );
}

function QRScreen({ onPaid }: { onPaid: () => void }) {
  return (
    <div className="px-5 py-5">
      <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">
        Pay & redeem
      </div>
      <h2 className="font-display text-2xl font-bold text-charcoal mt-1">
        Show this QR to staff
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Eligibility, time slot, exclusions and single-use checks happen automatically.
      </p>

      <div className="mt-5 rounded-2xl bg-charcoal p-5 grid place-items-center">
        <QRBlock value="JF-WALLET-HANS-FONDUE-18:30" size={160} />
        <div className="mt-3 text-center text-xs text-white/80">
          <div className="font-semibold text-white">Alpine Fondue House</div>
          <div className="font-mono mt-0.5">JF-RED-FN20-0918</div>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-xs text-charcoal">
        {[
          ["Guest card", "Active overnight"],
          ["Offer valid", "20% · 18:00–19:00"],
          ["Excludes", "Drinks"],
          ["Redemption", "Single-use · pending"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onPaid}
        className="mt-4 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
      >
        Simulate scan · Pay CHF 60.00
      </button>
      <div className="mt-2 text-center text-[11px] text-muted-foreground">
        In real life, the partner scans this QR.
      </div>
    </div>
  );
}

function TripBuilderScreen({ onBook }: { onBook: () => void }) {
  return (
    <div className="px-5 py-5">
      <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">
        Trip Builder
      </div>
      <h2 className="font-display text-2xl font-bold text-charcoal mt-1">
        Alpine Film Locations
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        5 stops · ~7 hours · curated by Jungfrau Region
      </p>

      <div className="mt-5 space-y-2.5">
        {[
          { t: "08:14 · Train to Grindelwald", s: "Compass route start", c: "Included" },
          { t: "09:30 · Grindelwald village", s: "Photo viewpoint", c: "Free" },
          { t: "10:30 · Eiger Express", s: "North face crossing", c: "CHF 89" },
          { t: "13:00 · Lunch · Berghaus", s: "15% wallet benefit", c: "CHF 24" },
          { t: "16:00 · Lauterbrunnen falls", s: "Sustainability bonus", c: "+50 pts" },
        ].map((stop, i) => (
          <div key={stop.t} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-teal text-white grid place-items-center text-xs font-bold">
                {i + 1}
              </div>
              {i < 4 && <div className="w-px flex-1 bg-border min-h-[12px] my-1" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="text-xs font-semibold text-charcoal">{stop.t}</div>
              <div className="text-[11px] text-muted-foreground">{stop.s}</div>
            </div>
            <div className="text-[11px] text-charcoal font-mono self-center">{stop.c}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-surface p-3 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Estimated total</span><span>CHF 113.00</span></div>
        <div className="flex justify-between mt-1 text-emerald font-semibold">
          <span>Wallet savings</span><span>−CHF 38.00</span>
        </div>
      </div>

      <button
        onClick={onBook}
        className="mt-4 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
      >
        Book the route
      </button>
    </div>
  );
}

function EigerExternalScreen({ onPaid }: { onPaid: () => void }) {
  return (
    <div className="px-5 py-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 mb-4">
        Simulated external partner website checkout
      </div>
      <div className="rounded-xl overflow-hidden border border-border bg-card">
        <img src={eigerImg} alt="Eiger Express" className="w-full h-32 object-cover" loading="lazy" width={1024} height={768} />
        <div className="p-4">
          <div className="text-xs text-muted-foreground">jungfrau-railways.ch</div>
          <div className="font-display text-lg font-bold text-charcoal mt-0.5">
            Eiger Express · Round trip
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Tomorrow · 10:30 · Adult</div>
          <div className="mt-3 text-2xl font-display font-bold text-charcoal">CHF 89.00</div>
        </div>
      </div>

      <div className="mt-4 text-xs font-semibold text-charcoal mb-2">Choose payment</div>
      <div className="space-y-2">
        {["Visa", "Mastercard", "TWINT", "PayPal"].map((p) => (
          <div key={p} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white text-sm">
            <span>{p}</span>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-border" />
          </div>
        ))}
        <button
          onClick={onPaid}
          className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-primary bg-primary/5 text-sm"
        >
          <span className="flex items-center gap-2 font-semibold text-primary">
            <svg viewBox="0 0 24 24" className="h-4 w-4"><path d="M3 19L9 9l4 6 3-4 5 8H3z" fill="currentColor" /></svg>
            Jungfrau Pass Wallet
          </span>
          <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-primary" />
        </button>
      </div>

      <button
        onClick={onPaid}
        className="mt-5 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
      >
        Pay CHF 89.00 with wallet
      </button>
    </div>
  );
}

function RewardScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="px-5 py-6 text-center">
      <div className="mx-auto w-32 h-32 rounded-full bg-gradient-emerald grid place-items-center text-5xl shadow-card">
        🎬
      </div>
      <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-emerald font-semibold">
        Achievement unlocked
      </div>
      <h2 className="mt-1 font-display text-2xl font-bold text-charcoal">
        Alpine Film Explorer
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You completed all 5 famous alpine film locations from Goldfinger to The Golden Compass.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 text-left">
        <div className="text-xs uppercase tracking-wider text-teal font-semibold">
          Your souvenir
        </div>
        <div className="font-display font-bold text-charcoal mt-1">
          Mini metal film camera
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Collect at: Tourism Office Lauterbrunnen
        </div>
        <div className="mt-3 inline-block rounded-md bg-surface px-2 py-1 text-[11px] font-mono text-charcoal">
          QR · JF-SOUV-FILM-7732
        </div>
      </div>

      <button
        onClick={onUnlock}
        className="mt-6 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-card"
      >
        Save to my rewards
      </button>
    </div>
  );
}

function TicketsScreen() {
  const { tickets } = useWallet();
  return (
    <div className="px-5 py-4 pb-24">
      <h2 className="font-display font-bold text-xl text-charcoal">Tickets</h2>
      <p className="text-xs text-muted-foreground mt-1">Stored in your wallet — offline ready.</p>
      <div className="mt-4 space-y-3">
        {tickets.length === 0 && (
          <div className="text-xs text-muted-foreground italic rounded-lg bg-surface p-4">
            No tickets yet. Book a route or activity to fill your wallet.
          </div>
        )}
        {tickets.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-gradient-card text-white px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">{t.partner}</div>
              <div className="font-display font-bold">{t.title}</div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <QRBlock value={t.qr} size={64} />
              <div className="text-xs flex-1">
                <div className="text-muted-foreground">When</div>
                <div className="font-semibold text-charcoal">{t.date} · {t.time}</div>
                <div className="text-muted-foreground mt-1">Code</div>
                <div className="font-mono text-charcoal">{t.qr}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardsScreen() {
  const { achievements } = useWallet();
  return (
    <div className="px-5 py-4 pb-24">
      <h2 className="font-display font-bold text-xl text-charcoal">Rewards</h2>
      <p className="text-xs text-muted-foreground mt-1">
        Explore more, earn alpine souvenirs.
      </p>
      <div className="mt-4 space-y-3">
        {achievements.map((a) => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.unlocked ? "bg-emerald/5 border-emerald/30" : "bg-card border-border"}`}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">{a.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-display font-bold text-charcoal">{a.title}</div>
                  {a.unlocked && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald text-white font-semibold uppercase tracking-wider">
                      Unlocked
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{a.description}</div>
                <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald transition-all"
                    style={{ width: `${(a.progress / a.total) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{a.progress} / {a.total}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DemoCue
        text="See destination-level reward analytics."
        action="Open admin"
        to="/admin"
      />
    </div>
  );
}

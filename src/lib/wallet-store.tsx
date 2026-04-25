import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ALPINE_FONDUE_PARTNER_ID } from "@/lib/auth-store";

/* ----------------------------- Types ----------------------------- */

export type Transaction = {
  id: string;
  partner: string;
  category: "Hotel" | "Restaurant" | "Activity" | "Transport" | "Top-up" | "Souvenir";
  amount: number;
  discount?: number;
  time: string;
  icon: string;
};

export type Booking = {
  id: string;
  guestName: string;
  partnerId: string;
  partner: string;
  offerId?: string;
  offerTitle?: string;
  time: string;
  date: string;
  people: number;
  status: "confirmed" | "redeemed" | "cancelled";
  redemption: "pending" | "confirmed";
  estimatedDiscount?: number;
};

export type Offer = {
  id: string;
  partnerId: string;
  partner: string;
  title: string;
  discount: number;
  validTime: string;
  excludes?: string[];
  redemptionType: "single_use" | "multi_use";
  category: string;
  active: boolean;
  redemptions: number;
  views: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlocked: boolean;
};

export type Ticket = {
  id: string;
  title: string;
  partner: string;
  date: string;
  time: string;
  qr: string;
  used: boolean;
};

type WalletState = {
  // Guest
  guestName: string;
  guestStatus: "inactive" | "active";
  guestCardActiveSince?: string;
  homeCountry: string;

  // Wallet
  balance: number;
  toppedUp: number;

  // Data (live)
  transactions: Transaction[];
  bookings: Booking[];
  offers: Offer[];
  achievements: Achievement[];
  tickets: Ticket[];

  scenesCompleted: Record<string, boolean>;
  loading: boolean;
};

type WalletActions = {
  topUp: (amount: number) => Promise<void>;
  payHotel: () => Promise<void>;
  bookFondue: () => Promise<void>;
  redeemFondue: () => Promise<void>;
  bookTripBuilder: () => Promise<void>;
  payEigerExpress: () => Promise<void>;
  unlockReward: () => void;
  resetDemo: () => void;
  markScene: (scene: string) => void;
  toggleOffer: (id: string) => Promise<void>;
  createOffer: (offer: {
    title: string;
    discount: number;
    validTime: string;
    category: string;
    redemptionType: "single_use" | "multi_use";
    excludes?: string[];
  }) => Promise<void>;
  /** Partner: confirm a guest booking by ID (charges wallet, marks redeemed) */
  partnerConfirmBooking: (bookingId: string) => Promise<{ ok: boolean; error?: string }>;
};

/* ----------------------------- Helpers ----------------------------- */

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "a_film", title: "Alpine Film Explorer", description: "Visit 5 famous alpine film locations", icon: "🎬", progress: 0, total: 5, unlocked: false },
  { id: "a_sustain", title: "Sustainable Voyager", description: "5 trips by train, bus or cable car", icon: "🚞", progress: 2, total: 5, unlocked: false },
  { id: "a_villages", title: "Village Hopper", description: "Visit 5 villages in the region", icon: "🏘️", progress: 1, total: 5, unlocked: false },
];

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function categoryIcon(cat: string): string {
  switch (cat) {
    case "Hotel": return "🏨";
    case "Restaurant": return "🫕";
    case "Activity": return "🚠";
    case "Transport": return "🚞";
    case "Top-up": return "↑";
    case "Souvenir": return "🎁";
    default: return "·";
  }
}

/* ----------------------------- Context ----------------------------- */

const WalletContext = createContext<(WalletState & WalletActions) | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const userId = account?.userId;
  const isPartner = account?.type === "partner";

  const [balance, setBalance] = useState(0);
  const [toppedUp, setToppedUp] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [scenesCompleted, setScenes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState<string | undefined>();

  const guestName = account?.name ?? "Guest";
  const homeCountry = account?.detail ?? "";
  const guestStatus: "active" | "inactive" =
    transactions.some((t) => t.category === "Hotel") ? "active" : "inactive";

  /* ---------- Load + subscribe ---------- */
  useEffect(() => {
    if (!userId) {
      setBalance(0); setToppedUp(0);
      setTransactions([]); setBookings([]); setOffers([]);
      setAchievements(DEFAULT_ACHIEVEMENTS); setTickets([]); setScenes({});
      setPartnerId(undefined);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const uid = userId;

    async function load() {
      // Tourist data: wallet + own transactions + own bookings
      if (!isPartner) {
        const [{ data: w }, { data: txs }, { data: bks }, { data: offs }] = await Promise.all([
          supabase.from("wallets").select("balance, topped_up").eq("user_id", userId).maybeSingle(),
          supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("offers").select("id, partner_id, title, discount, valid_time, category, active, redemptions, views").eq("active", true),
        ]);
        if (cancelled) return;
        if (w) { setBalance(Number(w.balance)); setToppedUp(Number(w.topped_up)); }
        setTransactions((txs ?? []).map(mapTx));
        setBookings((bks ?? []).map(mapBooking));
        // Load partner names for offers
        const partnerIds = Array.from(new Set((offs ?? []).map((o) => o.partner_id)));
        const { data: parts } = partnerIds.length
          ? await supabase.from("partners").select("id, name").in("id", partnerIds)
          : { data: [] as { id: string; name: string }[] };
        const nameMap = new Map((parts ?? []).map((p) => [p.id, p.name]));
        setOffers((offs ?? []).map((o) => mapOffer(o, nameMap.get(o.partner_id) ?? "Partner")));
      } else {
        // Partner data: my partner row + my offers + bookings at my partner
        const { data: myPartner } = await supabase
          .from("partners").select("id, name").eq("owner_id", userId).maybeSingle();
        if (cancelled) return;
        if (myPartner) {
          setPartnerId(myPartner.id);
          const [{ data: offs }, { data: bks }, { data: txs }] = await Promise.all([
            supabase.from("offers").select("*").eq("partner_id", myPartner.id).order("created_at", { ascending: false }),
            supabase.from("bookings").select("*").eq("partner_id", myPartner.id).order("created_at", { ascending: false }),
            supabase.from("transactions").select("*").eq("partner_id", myPartner.id).order("created_at", { ascending: false }),
          ]);
          if (cancelled) return;
          setOffers((offs ?? []).map((o) => mapOffer(o, myPartner.name)));
          setBookings((bks ?? []).map(mapBooking));
          setTransactions((txs ?? []).map(mapTx));
        }
      }
      setLoading(false);
    }
    load();

    // Realtime
    const channels = [];
    if (!isPartner) {
      const ch = supabase
        .channel(`wallet-${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${userId}` }, (p) => {
          const row = p.new as { balance: number; topped_up: number } | undefined;
          if (row) { setBalance(Number(row.balance)); setToppedUp(Number(row.topped_up)); }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` }, () => load())
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${userId}` }, () => load())
        .subscribe();
      channels.push(ch);
    } else {
      const ch = supabase
        .channel(`partner-${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
        .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => load())
        .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => load())
        .subscribe();
      channels.push(ch);
    }

    return () => {
      cancelled = true;
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, [userId, isPartner]);

  /* ---------- Mappers ---------- */
  function mapTx(r: any): Transaction {
    return {
      id: r.id,
      partner: r.partner_name,
      category: r.category,
      amount: Number(r.amount),
      discount: r.discount ? Number(r.discount) : undefined,
      time: timeAgo(r.created_at),
      icon: r.icon ?? categoryIcon(r.category),
    };
  }
  function mapBooking(r: any): Booking {
    return {
      id: r.id,
      guestName: r.guest_name,
      partnerId: r.partner_id,
      partner: r.partner_name,
      offerId: r.offer_id ?? undefined,
      offerTitle: r.offer_title ?? undefined,
      time: r.booking_time,
      date: r.booking_date,
      people: r.people,
      status: r.status,
      redemption: r.status === "redeemed" ? "confirmed" : "pending",
      estimatedDiscount: r.estimated_discount ? Number(r.estimated_discount) : undefined,
    };
  }
  function mapOffer(r: any, partnerName: string): Offer {
    return {
      id: r.id,
      partnerId: r.partner_id,
      partner: partnerName,
      title: r.title,
      discount: Number(r.discount),
      validTime: r.valid_time ?? "",
      redemptionType: (r.redemption_type ?? "single_use") as "single_use" | "multi_use",
      category: r.category ?? "Restaurant",
      active: !!r.active,
      redemptions: r.redemptions ?? 0,
      views: r.views ?? 0,
    };
  }

  /* ---------- Actions (tourist) ---------- */

  const topUp = useCallback(async (amount: number) => {
    if (!userId) return;
    const { error } = await supabase.functions.invoke("wallet-topup", { body: { amount } });
    if (error) console.error(error);
    setScenes((s) => ({ ...s, topup: true }));
  }, [userId]);

  const spend = useCallback(async (args: {
    partnerId: string | null; partnerName: string;
    category: Transaction["category"]; amount: number;
    discount?: number; icon?: string; bookingId?: string;
  }) => {
    const { error } = await supabase.rpc("wallet_spend", {
      p_partner_id: args.partnerId,
      p_partner_name: args.partnerName,
      p_category: args.category,
      p_amount: args.amount,
      p_discount: args.discount ?? null,
      p_icon: args.icon ?? null,
      p_booking_id: args.bookingId ?? null,
    });
    if (error) throw error;
  }, []);

  const payHotel = useCallback(async () => {
    await spend({
      partnerId: null,
      partnerName: "Hotel Interlaken Central",
      category: "Hotel",
      amount: 165,
      icon: "🏨",
    });
    setScenes((s) => ({ ...s, hotel: true }));
  }, [spend]);

  const bookFondue = useCallback(async () => {
    if (!userId) return;
    await supabase.from("bookings").insert({
      user_id: userId,
      guest_name: guestName,
      partner_id: ALPINE_FONDUE_PARTNER_ID,
      partner_name: "Alpine Fondue House",
      offer_title: "20% off fondue · early evening",
      booking_time: "18:30",
      booking_date: "Today",
      people: 1,
      estimated_discount: 12.0,
    });
    setScenes((s) => ({ ...s, restaurant: true }));
  }, [userId, guestName]);

  const redeemFondue = useCallback(async () => {
    const myFondue = bookings.find(
      (b) => b.partnerId === ALPINE_FONDUE_PARTNER_ID && b.status === "confirmed"
    );
    await spend({
      partnerId: ALPINE_FONDUE_PARTNER_ID,
      partnerName: "Alpine Fondue House",
      category: "Restaurant",
      amount: 60,
      discount: 12,
      icon: "🫕",
      bookingId: myFondue?.id,
    });
    setScenes((s) => ({ ...s, qr: true }));
  }, [bookings, spend]);

  const bookTripBuilder = useCallback(async () => {
    setTickets((t) => [
      { id: "tk_train", title: "Train · Interlaken Ost → Grindelwald", partner: "BLS", date: "Tomorrow", time: "08:14", qr: "JF-TRN-7714", used: false },
      ...t,
    ]);
    setAchievements((a) => a.map((x) => x.id === "a_film" ? { ...x, progress: 1 } : x));
    setScenes((s) => ({ ...s, trip: true }));
  }, []);

  const payEigerExpress = useCallback(async () => {
    await spend({
      partnerId: null,
      partnerName: "Eiger Express · External checkout",
      category: "Activity",
      amount: 89,
      icon: "🚠",
    });
    setTickets((t) => [
      { id: "tk_eiger", title: "Eiger Express · Round trip", partner: "Jungfrau Railways", date: "Tomorrow", time: "10:30", qr: "JF-EIG-2244", used: false },
      ...t,
    ]);
    setAchievements((a) => a.map((x) => x.id === "a_film" ? { ...x, progress: 3 } : x));
    setScenes((s) => ({ ...s, eiger: true }));
  }, [spend]);

  const unlockReward = useCallback(() => {
    setAchievements((a) => a.map((x) => x.id === "a_film" ? { ...x, progress: 5, unlocked: true } : x));
    setScenes((s) => ({ ...s, reward: true }));
  }, []);

  const resetDemo = useCallback(() => {
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setTickets([]);
    setScenes({});
  }, []);

  const markScene = useCallback((scene: string) => {
    setScenes((s) => ({ ...s, [scene]: true }));
  }, []);

  /* ---------- Actions (partner) ---------- */

  const toggleOffer = useCallback(async (id: string) => {
    const o = offers.find((x) => x.id === id);
    if (!o) return;
    await supabase.from("offers").update({ active: !o.active }).eq("id", id);
  }, [offers]);

  const createOffer = useCallback(async (offer: {
    title: string; discount: number; validTime: string; category: string;
    redemptionType: "single_use" | "multi_use"; excludes?: string[];
  }) => {
    if (!partnerId) return;
    await supabase.from("offers").insert({
      partner_id: partnerId,
      title: offer.title,
      discount: offer.discount,
      valid_time: offer.validTime,
      category: offer.category,
      redemption_type: offer.redemptionType,
      active: true,
    });
  }, [partnerId]);

  const partnerConfirmBooking = useCallback(async (bookingId: string) => {
    const { data, error } = await supabase.functions.invoke("partner-confirm-booking", {
      body: { bookingId },
    });
    if (error) return { ok: false, error: error.message };
    if ((data as any)?.error) return { ok: false, error: (data as any).error };
    return { ok: true };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        guestName, guestStatus, homeCountry, balance, toppedUp,
        transactions, bookings, offers, achievements, tickets,
        scenesCompleted, loading,
        topUp, payHotel, bookFondue, redeemFondue, bookTripBuilder,
        payEigerExpress, unlockReward, resetDemo, markScene,
        toggleOffer, createOffer, partnerConfirmBooking,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

export function fmtCHF(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}CHF ${Math.abs(n).toFixed(2)}`;
}

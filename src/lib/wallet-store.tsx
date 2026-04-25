import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/* ----------------------------- Types ----------------------------- */

export type Transaction = {
  id: string;
  partner: string;
  category: "Hotel" | "Restaurant" | "Activity" | "Transport" | "Top-up" | "Souvenir";
  amount: number; // negative = spent, positive = top-up
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

  // History & data
  transactions: Transaction[];
  bookings: Booking[];
  offers: Offer[];
  achievements: Achievement[];
  tickets: Ticket[];

  // Demo flow tracking
  scenesCompleted: Record<string, boolean>;
};

type WalletActions = {
  topUp: (amount: number) => void;
  payHotel: () => void;
  bookFondue: () => void;
  redeemFondue: () => void;
  bookTripBuilder: () => void;
  payEigerExpress: () => void;
  unlockReward: () => void;
  resetDemo: () => void;
  markScene: (scene: string) => void;
  toggleOffer: (id: string) => void;
  createOffer: (offer: Omit<Offer, "id" | "redemptions" | "views" | "active" | "partnerId" | "partner">) => void;
};

/* ----------------------------- Initial state ----------------------------- */

const initial: WalletState = {
  guestName: "Hans Keller",
  guestStatus: "inactive",
  homeCountry: "Germany",
  balance: 0,
  toppedUp: 0,
  transactions: [],
  bookings: [
    {
      id: "bk_001",
      guestName: "Sofia Romano",
      partnerId: "p_fondue",
      partner: "Alpine Fondue House",
      offerId: "off_fondue_20",
      offerTitle: "20% off fondue · early evening",
      time: "18:15",
      date: "Today",
      people: 2,
      status: "redeemed",
      redemption: "confirmed",
      estimatedDiscount: 14.0,
    },
    {
      id: "bk_002",
      guestName: "Marc Lefèvre",
      partnerId: "p_fondue",
      partner: "Alpine Fondue House",
      offerId: "off_fondue_20",
      offerTitle: "20% off fondue · early evening",
      time: "18:45",
      date: "Today",
      people: 4,
      status: "confirmed",
      redemption: "pending",
      estimatedDiscount: 22.4,
    },
  ],
  offers: [
    {
      id: "off_fondue_20",
      partnerId: "p_fondue",
      partner: "Alpine Fondue House",
      title: "20% off fondue dishes",
      discount: 20,
      validTime: "18:00 – 19:00",
      excludes: ["drinks"],
      redemptionType: "single_use",
      category: "Restaurant",
      active: true,
      redemptions: 31,
      views: 412,
    },
    {
      id: "off_lunch_15",
      partnerId: "p_fondue",
      partner: "Alpine Fondue House",
      title: "15% off lunch menu",
      discount: 15,
      validTime: "11:30 – 13:30",
      redemptionType: "single_use",
      category: "Restaurant",
      active: false,
      redemptions: 8,
      views: 156,
    },
  ],
  achievements: [
    {
      id: "a_film",
      title: "Alpine Film Explorer",
      description: "Visit 5 famous alpine film locations",
      icon: "🎬",
      progress: 0,
      total: 5,
      unlocked: false,
    },
    {
      id: "a_sustain",
      title: "Sustainable Voyager",
      description: "5 trips by train, bus or cable car",
      icon: "🚞",
      progress: 2,
      total: 5,
      unlocked: false,
    },
    {
      id: "a_villages",
      title: "Village Hopper",
      description: "Visit 5 villages in the region",
      icon: "🏘️",
      progress: 1,
      total: 5,
      unlocked: false,
    },
  ],
  tickets: [],
  scenesCompleted: {},
};

/* ----------------------------- Context ----------------------------- */

const WalletContext = createContext<(WalletState & WalletActions) | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initial);

  const addTx = useCallback((tx: Transaction) => {
    setState((s) => ({ ...s, transactions: [tx, ...s.transactions] }));
  }, []);

  const topUp = useCallback(
    (amount: number) => {
      setState((s) => ({
        ...s,
        balance: s.balance + amount,
        toppedUp: s.toppedUp + amount,
        scenesCompleted: { ...s.scenesCompleted, topup: true },
      }));
      addTx({
        id: `tx_${Date.now()}`,
        partner: "Top-up · Tourism Kiosk",
        category: "Top-up",
        amount,
        time: "Just now",
        icon: "↑",
      });
    },
    [addTx]
  );

  const payHotel = useCallback(() => {
    const cost = 165;
    setState((s) => ({
      ...s,
      balance: s.balance - cost,
      guestStatus: "active",
      guestCardActiveSince: "Today",
      scenesCompleted: { ...s.scenesCompleted, hotel: true },
    }));
    addTx({
      id: `tx_${Date.now()}`,
      partner: "Hotel Interlaken Central",
      category: "Hotel",
      amount: -cost,
      time: "Just now",
      icon: "🏨",
    });
  }, [addTx]);

  const bookFondue = useCallback(() => {
    setState((s) => ({
      ...s,
      bookings: [
        {
          id: "bk_hans",
          guestName: "Hans Keller",
          partnerId: "p_fondue",
          partner: "Alpine Fondue House",
          offerId: "off_fondue_20",
          offerTitle: "20% off fondue · early evening",
          time: "18:30",
          date: "Today",
          people: 1,
          status: "confirmed",
          redemption: "pending",
          estimatedDiscount: 12.0,
        },
        ...s.bookings,
      ],
      scenesCompleted: { ...s.scenesCompleted, restaurant: true },
    }));
  }, []);

  const redeemFondue = useCallback(() => {
    const beforeDiscount = 72;
    const discount = 12;
    const finalAmount = beforeDiscount - discount;

    setState((s) => ({
      ...s,
      balance: s.balance - finalAmount,
      bookings: s.bookings.map((b) =>
        b.id === "bk_hans" ? { ...b, status: "redeemed", redemption: "confirmed" } : b
      ),
      offers: s.offers.map((o) =>
        o.id === "off_fondue_20" ? { ...o, redemptions: o.redemptions + 1 } : o
      ),
      scenesCompleted: { ...s.scenesCompleted, qr: true },
    }));
    addTx({
      id: `tx_${Date.now()}`,
      partner: "Alpine Fondue House",
      category: "Restaurant",
      amount: -finalAmount,
      discount,
      time: "Just now",
      icon: "🫕",
    });
  }, [addTx]);

  const bookTripBuilder = useCallback(() => {
    setState((s) => ({
      ...s,
      tickets: [
        {
          id: "tk_train",
          title: "Train · Interlaken Ost → Grindelwald",
          partner: "BLS",
          date: "Tomorrow",
          time: "08:14",
          qr: "JF-TRN-7714",
          used: false,
        },
        ...s.tickets,
      ],
      achievements: s.achievements.map((a) =>
        a.id === "a_film" ? { ...a, progress: 1 } : a
      ),
      scenesCompleted: { ...s.scenesCompleted, trip: true },
    }));
  }, []);

  const payEigerExpress = useCallback(() => {
    const cost = 89;
    setState((s) => ({
      ...s,
      balance: s.balance - cost,
      tickets: [
        {
          id: "tk_eiger",
          title: "Eiger Express · Round trip",
          partner: "Jungfrau Railways",
          date: "Tomorrow",
          time: "10:30",
          qr: "JF-EIG-2244",
          used: false,
        },
        ...s.tickets,
      ],
      achievements: s.achievements.map((a) =>
        a.id === "a_film" ? { ...a, progress: 3 } : a
      ),
      scenesCompleted: { ...s.scenesCompleted, eiger: true },
    }));
    addTx({
      id: `tx_${Date.now()}`,
      partner: "Eiger Express · External checkout",
      category: "Activity",
      amount: -cost,
      time: "Just now",
      icon: "🚠",
    });
  }, [addTx]);

  const unlockReward = useCallback(() => {
    setState((s) => ({
      ...s,
      achievements: s.achievements.map((a) =>
        a.id === "a_film" ? { ...a, progress: 5, unlocked: true } : a
      ),
      scenesCompleted: { ...s.scenesCompleted, reward: true },
    }));
  }, []);

  const resetDemo = useCallback(() => setState(initial), []);
  const markScene = useCallback((scene: string) => {
    setState((s) => ({ ...s, scenesCompleted: { ...s.scenesCompleted, [scene]: true } }));
  }, []);

  const toggleOffer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      offers: s.offers.map((o) => (o.id === id ? { ...o, active: !o.active } : o)),
    }));
  }, []);

  const createOffer: WalletActions["createOffer"] = useCallback((offer) => {
    setState((s) => ({
      ...s,
      offers: [
        {
          id: `off_${Date.now()}`,
          partnerId: "p_fondue",
          partner: "Alpine Fondue House",
          active: true,
          redemptions: 0,
          views: 0,
          ...offer,
        },
        ...s.offers,
      ],
    }));
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        topUp,
        payHotel,
        bookFondue,
        redeemFondue,
        bookTripBuilder,
        payEigerExpress,
        unlockReward,
        resetDemo,
        markScene,
        toggleOffer,
        createOffer,
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

import { Link, Navigate } from "@tanstack/react-router";
import { useAuth, type AccountType } from "@/lib/auth-store";
import { PageShell } from "@/components/brand";
import type { ReactNode } from "react";

export function RequireAuth({
  type,
  children,
}: {
  type: AccountType;
  children: ReactNode;
}) {
  const { account } = useAuth();

  if (!account) {
    return <Navigate to="/login" />;
  }

  if (account.type !== type) {
    return (
      <PageShell>
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-destructive font-bold">
            Wrong account type
          </div>
          <h1 className="mt-3 font-display font-bold text-3xl text-charcoal">
            This area is for {type} accounts.
          </h1>
          <p className="mt-3 text-muted-foreground">
            You're signed in as a <strong className="text-charcoal capitalize">{account.type}</strong>{" "}
            account ({account.name}). Sign out and use a {type} login to continue.
          </p>
          <div className="mt-7 flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-soft hover:bg-primary/90"
            >
              Switch account
            </Link>
            <Link
              to={account.type === "tourist" ? "/tourist" : "/partner"}
              className="px-5 py-2.5 rounded-lg bg-white border border-border text-charcoal font-semibold hover:bg-surface-2"
            >
              Back to my dashboard
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  return <>{children}</>;
}

import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { WalletProvider } from "@/lib/wallet-store";
import { AuthProvider } from "@/lib/auth-store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jungfrau Pass Wallet — One wallet for the Jungfrau Region" },
      {
        name: "description",
        content:
          "Pay, book, redeem benefits and collect rewards across the Jungfrau Region with one digital guest wallet.",
      },
      { name: "author", content: "Jungfrau Pass Wallet" },
      { property: "og:title", content: "Jungfrau Pass Wallet — One wallet for the Jungfrau Region" },
      {
        property: "og:description",
        content:
          "One wallet for payments, benefits, bookings, tickets and local rewards in the Jungfrau Region.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jungfrau Pass Wallet — One wallet for the Jungfrau Region" },
      { name: "description", content: "A digital guest wallet for payments, benefits, bookings, tickets, and local rewards in the Jungfrau Region." },
      { property: "og:description", content: "A digital guest wallet for payments, benefits, bookings, tickets, and local rewards in the Jungfrau Region." },
      { name: "twitter:description", content: "A digital guest wallet for payments, benefits, bookings, tickets, and local rewards in the Jungfrau Region." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/15554a1f-27d2-4f6e-a783-b27873135f0c/id-preview-0e2e2f56--67b3906a-d8a2-452c-a553-37a099003fa4.lovable.app-1777106985750.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/15554a1f-27d2-4f6e-a783-b27873135f0c/id-preview-0e2e2f56--67b3906a-d8a2-452c-a553-37a099003fa4.lovable.app-1777106985750.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Outlet />
      </WalletProvider>
    </AuthProvider>
  );
}

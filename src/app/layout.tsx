// Root layout that wraps the entire app
// The actual HTML structure is in [locale]/layout.tsx

// Force all routes to be dynamic (no static generation during build)
// This prevents SSR errors with browser APIs like localStorage, sessionStorage, window
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

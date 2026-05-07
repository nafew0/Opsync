import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import ClientShell from './ClientShell'

export const metadata: Metadata = {
  title: 'BdREN OpsSync',
  applicationName: 'BdREN OpsSync',
  description: 'BdREN OpsSync operations workspace.',
  icons: {
    icon: '/branding/logo.ico',
    shortcut: '/branding/logo.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  )
}

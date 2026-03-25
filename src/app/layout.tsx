import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import NextTopLoader from 'nextjs-toploader'

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'URJA Command Centre',
  description: 'BVG URJA Team Command Centre',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full flex bg-background text-foreground antialiased font-sans">
        <NextTopLoader color="#8b5cf6" showSpinner={false} shadow="0 0 10px #8b5cf6,0 0 5px #8b5cf6" height={3} />
        
        {/* Sleek Navigation */}
        <Sidebar />

        {/* Main Content Area with Subtle Mesh/Grid Background */}
        <main className="flex-1 overflow-hidden bg-muted/20 relative flex flex-col">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          {/* Subtle glowing ambient orb in the center back */}
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-[500px] w-[800px] rounded-[100%] bg-primary/10 opacity-40 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 w-full h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}

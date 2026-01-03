import { Footer } from '@/components/footer'
import { SiteHeader } from '@/components/layouts/site-header'
import React from 'react'

export default function AppLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <SiteHeader />
            <div className="bg-[radial-gradient(circle_at_12%_18%,rgba(16,163,118,0.12),transparent_36%),radial-gradient(circle_at_88%_4%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(240,244,248,0.9))] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(52,211,153,0.18),transparent_36%),radial-gradient(circle_at_88%_4%,rgba(56,189,248,0.18),transparent_32%),linear-gradient(180deg,rgba(16,24,40,0.94),rgba(11,18,32,0.96))]">
                {children}
            </div>
            <Footer />
        </>
    )
}

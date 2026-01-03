import { SiteHeader } from '@/components/layouts/site-header'
import React from 'react'

export default function AppLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <SiteHeader />
            <div className="bg-linear-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {children}
            </div>
        </>
    )
}

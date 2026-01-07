"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  income: "Income",
  expenses: "Expenses",
  debts: "Debts",
  snowball: "Snowball",
  account: "Account",
  settings: "Settings",
  help: "Help",
}

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function SiteHeader() {
  const pathname = usePathname() ?? ""
  const rawSegments = pathname.split("/").filter(Boolean)
  const segments = rawSegments[0] === "dashboard" ? rawSegments : ["dashboard"]
  const crumbs = segments.length
    ? segments.map((segment, index) => ({
        href: `/${segments.slice(0, index + 1).join("/")}`,
        label: labelMap[segment] ?? formatSegment(segment),
      }))
    : [{ href: "/dashboard", label: "Dashboard" }]

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {index < crumbs.length - 1 ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < crumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

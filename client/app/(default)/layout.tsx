"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CountsProvider } from "@/components/data/counts-context"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <CountsProvider>
        <SidebarProvider
          defaultOpen={true}
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </CountsProvider>
    </AuthGuard>
  )
}

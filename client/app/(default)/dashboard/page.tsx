"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { SiteHeader } from "@/components/layout/site-header"
import { SectionCards } from "@/components/data/section-cards"

const ChartAreaInteractive = dynamic(
  () =>
    import("@/components/data/interactive-chart").then(
      (mod) => mod.ChartAreaInteractive
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted h-[400px] animate-pulse rounded-lg" />
    ),
  }
)

export default function DashboardPage() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </>
  )
}

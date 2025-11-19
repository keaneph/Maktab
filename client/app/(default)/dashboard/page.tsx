"use client"

import * as React from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { SectionCards } from "@/components/data/section-cards"
import { ChartAreaInteractive } from "@/components/data/interactive-chart"

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

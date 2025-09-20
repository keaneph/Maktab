"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import chartData from "@/public/data/chart-data.json"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig: ChartConfig = {
  college: {
    label: "College",
    color: "var(--primary)" 
  },
  program: {
    label: "Program",
    color: "var(--primary)"
  },
  students: {
    label: "Students",
    color: "var(--primary)" 
}
}

export function ChartAreaInteractive() {
  // always show last 7 days only
  const daysToSubtract = 7

  const filteredData = React.useMemo(() => {
  const referenceDate = new Date() // today
  const startDate = new Date(referenceDate)
  startDate.setDate(startDate.getDate() - daysToSubtract)
  return chartData.filter((item) => {
    const d = new Date(item.date)
    return d >= startDate && d <= referenceDate
  })
}, [])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          Last 7 days
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
                <linearGradient id="fillCollege" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-college)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-college)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillProgram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-program)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-program)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-students)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-students)" stopOpacity={0.1} />
                </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
                dataKey="college"
                type="natural"
                fill="url(#fillCollege)"
                stroke="var(--color-college)"
                stackId="a"
                />
                <Area
                dataKey="program"
                type="natural"
                fill="url(#fillProgram)"
                stroke="var(--color-program)"
                stackId="a"
                />
                <Area
                dataKey="students"
                type="natural"
                fill="url(#fillStudents)"
                stroke="var(--color-students)"
                stackId="a"
                />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

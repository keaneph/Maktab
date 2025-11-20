"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"

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
    color: "var(--primary)",
  },
  program: {
    label: "Program",
    color: "var(--primary)",
  },
  students: {
    label: "Students",
    color: "var(--primary)",
  },
  users: {
    label: "Users",
    color: "var(--primary)",
  },
}

interface DailyMetric {
  date: string
  college: number
  program: number
  students: number
  users: number
}

export function ChartAreaInteractive() {
  const [data, setData] = React.useState<DailyMetric[] | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const abortController = new AbortController()

    async function fetchMetrics() {
      try {
        setIsLoading(true)
        const res = await fetch("http://localhost:8080/api/metrics/daily", {
          signal: abortController.signal,
        })
        if (!res.ok) {
          const message = await res.text().catch(() => "")
          throw new Error(message || "Failed to fetch metrics")
        }
        const metrics = await res.json()
        if (!abortController.signal.aborted) {
          setData(metrics)
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        const err = error as Error
        toast.error(`Error fetching metrics: ${err.message}`)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    fetchMetrics()

    return () => {
      abortController.abort()
    }
  }, [])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Daily Additions</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="text-muted-foreground grid h-[250px] w-full place-items-center text-sm">
            Loading chart…
          </div>
        ) : null}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data || []}>
            <defs>
              <linearGradient id="fillCollege" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-college)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-college)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillProgram" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-program)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-program)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-students)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-students)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.1}
                />
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
            <Area
              dataKey="users"
              type="natural"
              fill="url(#fillUsers)"
              stroke="var(--color-users)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

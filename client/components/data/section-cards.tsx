import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import * as React from "react"
import { useCounts } from "./counts-context"
import { useDailyMetrics } from "./use-daily-metrics"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function computeDelta(current?: number, previous?: number) {
  const curr = typeof current === "number" ? current : 0
  const prevVal = typeof previous === "number" ? previous : 0
  const diff = curr - prevVal
  const pct =
    prevVal === 0 ? (curr > 0 ? 100 : 0) : Math.round((diff / prevVal) * 100)
  return { diff, pct }
}

export const SectionCards = React.memo(function SectionCards({
  active,
}: {
  active?: "college" | "program" | "student" | "miscellaneous"
}) {
  const { counts } = useCounts()
  const activeClasses =
    "!shadow-xs !bg-gradient-to-br !from-primary/5 !to-primary/20"

  const { data: metrics } = useDailyMetrics()

  const last = metrics?.[metrics.length - 1]
  const prev = metrics?.[metrics.length - 2]

  const collegeDelta = React.useMemo(
    () => computeDelta(last?.college, prev?.college),
    [last?.college, prev?.college]
  )
  const programDelta = React.useMemo(
    () => computeDelta(last?.program, prev?.program),
    [last?.program, prev?.program]
  )
  const studentDelta = React.useMemo(
    () => computeDelta(last?.students, prev?.students),
    [last?.students, prev?.students]
  )
  const userDelta = React.useMemo(
    () => computeDelta(last?.users, prev?.users),
    [last?.users, prev?.users]
  )

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card
        className={`@container/card ${active === "college" ? activeClasses : ""}`}
      >
        <CardHeader>
          <CardDescription>Total Colleges</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.colleges}
          </CardTitle>
          <CardAction>
            <Link href="/colleges">
              <Badge variant="outline">
                <ExternalLink /> View
              </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {collegeDelta.pct >= 0 ? "Up" : "Down"} {Math.abs(collegeDelta.pct)}
            % in the last 24 hours{" "}
            {collegeDelta.pct >= 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Overall college count increase is {collegeDelta.diff}
          </div>
        </CardFooter>
      </Card>
      <Card
        className={`@container/card ${active === "program" ? activeClasses : ""}`}
      >
        <CardHeader>
          <CardDescription>Total Programs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.programs}
          </CardTitle>
          <CardAction>
            <Link href="/programs">
              <Badge variant="outline">
                <ExternalLink /> View
              </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {programDelta.pct >= 0 ? "Up" : "Down"} {Math.abs(programDelta.pct)}
            % in the last 24 hours{" "}
            {programDelta.pct >= 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Overall program count increase is {programDelta.diff}
          </div>
        </CardFooter>
      </Card>
      <Card
        className={`@container/card ${active === "student" ? activeClasses : ""}`}
      >
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.students}
          </CardTitle>
          <CardAction>
            <Link href="/students">
              <Badge variant="outline">
                <ExternalLink /> View
              </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {studentDelta.pct >= 0 ? "Up" : "Down"} {Math.abs(studentDelta.pct)}
            % in the last 24 hours{" "}
            {studentDelta.pct >= 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Overall student count increase is {studentDelta.diff}
          </div>
        </CardFooter>
      </Card>
      <Card
        className={`@container/card ${active === "miscellaneous" ? activeClasses : ""}`}
      >
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.users}
          </CardTitle>
          <CardAction>
            <Link href="/miscellaneous">
              <Badge variant="outline">
                <ExternalLink /> View
              </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {userDelta.pct >= 0 ? "Up" : "Down"} {Math.abs(userDelta.pct)}% in
            the last 24 hours{" "}
            {userDelta.pct >= 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Overall user count increase is {userDelta.diff}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
})

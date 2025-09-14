import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

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

export function SectionCards({ 
  collegeCount,
  programCount,
  studentCount,
}: { 
  collegeCount: number,
  programCount: number,
  studentCount: number,
}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Colleges</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {collegeCount}
          </CardTitle>
          <CardAction>
            <Link href="/colleges">
              <Badge variant="outline">
              <ExternalLink/ > View
            </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 60% in the last 24 hours <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Overall college count increase is 12
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Programs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {programCount}
          </CardTitle>
          <CardAction>
            <Link href="/programs">
              <Badge variant="outline">
              <ExternalLink/ > View
            </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% in the last 24 hours <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Overall program count increase is 0
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {studentCount}
          </CardTitle>
          <CardAction>
            <Link href="/students">
              <Badge variant="outline">
              <ExternalLink/ > View
            </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 13% in the last 24 hours <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Overall college count increase is 9</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Site Visits</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
          <CardAction>
            <Link href="/miscellaneous">
              <Badge variant="outline">
              <ExternalLink/ > View
            </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 28% in the last 24 hours <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Overall site visit count increase is 0</div>
        </CardFooter>
      </Card>
    </div>
  )
}

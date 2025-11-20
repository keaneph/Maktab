"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-wrap items-center gap-3 px-4 py-3"
          >
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32 flex-1 min-w-[120px]" />
            <Skeleton className="h-4 w-24 flex-1 min-w-[80px]" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}


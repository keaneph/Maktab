import { TableSkeleton } from "@/components/data/table-skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
      </div>
      <TableSkeleton />
    </div>
  )
}

"use client"

import React from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { Colleges, columns } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { CollegeForm } from "@/components/forms/college-form"
import { useCounts } from "@/components/data/counts-context"
import { useDailyMetrics } from "@/components/data/use-daily-metrics"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/data/table-skeleton"

import {
  getColleges,
  addCollege,
  editCollege,
  deleteCollege,
  bulkDeleteColleges,
} from "@/lib/college-service"

export default function CollegesPage() {
  const [collegeData, setCollegeData] = React.useState<Colleges[]>([])
  const { refreshCounts } = useCounts()
  const { refresh: refreshMetrics } = useDailyMetrics()
  const hasLoaded = React.useRef(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!hasLoaded.current) {
      loadColleges({ showSkeleton: true })
      hasLoaded.current = true
    }
  }, [])

  async function loadColleges(options: { showSkeleton?: boolean } = {}) {
    const { showSkeleton = false } = options
    if (showSkeleton) setIsLoading(true)
    try {
      const data = await getColleges()
      setCollegeData(data)
    } catch (err) {
      toast.error(`Error fetching data: ${(err as Error).message}`)
    } finally {
      if (showSkeleton) {
        setIsLoading(false)
      }
    }
  }

  async function refresh() {
    await loadColleges()
    await refreshCounts()
    await refreshMetrics()
  }

  const handleAdd = async (values: { code: string; name: string }) => {
    try {
      await addCollege(values)
      await refresh()
      toast.success("College added successfully!")
    } catch (err) {
      toast.error(`Failed to add college: ${(err as Error).message}`)
      throw err
    }
  }

  const handleEdit = async (
    oldCode: string,
    values: { code: string; name: string }
  ) => {
    try {
      await editCollege(oldCode, values)
      await refresh()
      toast.success("College updated!")
    } catch (err) {
      toast.error(`Failed to edit college: ${(err as Error).message}`)
      throw err
    }
  }

  const handleDelete = async (code: string) => {
    try {
      await deleteCollege(code)
      await refresh()
      toast.success("College deleted!")
    } catch (err) {
      toast.error(`Failed to delete college: ${(err as Error).message}`)
      throw err
    }
  }

  const handleBulkDelete = async (codes: string[]) => {
    try {
      await bulkDeleteColleges(codes)
      await refresh()
      toast.success(`${codes.length} college(s) deleted!`)
    } catch (err) {
      toast.error(`Failed to delete colleges: ${(err as Error).message}`)
      throw err
    }
  }

  return (
    <>
      <SiteHeader title="Colleges" />

      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="college" />
        <div className="px-4 lg:px-6">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={columns(
                handleDelete,
                handleEdit,
                handleBulkDelete,
                collegeData.map((c) => c.code.toUpperCase())
              )}
              data={collegeData}
              searchPlaceholder="Search colleges..."
              addTitle="Add College"
              addDescription="Add a new college"
              searchKeys={["code", "name"]}
              renderAddForm={({
                onSuccess,
                onValidityChange,
                setIsSubmitting,
              }) => (
                <CollegeForm
                  onSubmit={handleAdd}
                  existingCodes={collegeData.map((c) => c.code.toUpperCase())}
                  onSuccess={onSuccess}
                  onValidityChange={onValidityChange}
                  onSubmittingChange={setIsSubmitting}
                />
              )}
            />
          )}
        </div>
      </div>
    </>
  )
}

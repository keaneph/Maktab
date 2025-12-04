"use client"

import React from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { ProgramForm } from "@/components/forms/program-form"
import { toast } from "sonner"
import { useCounts } from "@/components/data/counts-context"
import { useDailyMetrics } from "@/components/data/use-daily-metrics"
import { TableSkeleton } from "@/components/data/table-skeleton"

import { Colleges } from "../colleges/columns"
import { Programs, columns } from "./columns"

import { getColleges } from "@/lib/college-service"
import {
  getPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  bulkDeletePrograms,
} from "@/lib/program-service"

export default function ProgramsPage() {
  const [colleges, setColleges] = React.useState<Colleges[]>([])
  const [programs, setPrograms] = React.useState<Programs[]>([])
  const { refreshCounts } = useCounts()
  const { refresh: refreshMetrics } = useDailyMetrics()

  const hasLoaded = React.useRef(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!hasLoaded.current) {
      loadData({ showSkeleton: true })
      hasLoaded.current = true
    }
  }, [])

  async function loadData(options: { showSkeleton?: boolean } = {}) {
    const { showSkeleton = false } = options
    if (showSkeleton) setIsLoading(true)
    try {
      const [collegesResult, programsResult] = await Promise.all([
        getColleges(),
        getPrograms(),
      ])
      setColleges(collegesResult)
      setPrograms(programsResult)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      if (showSkeleton) {
        setIsLoading(false)
      }
    }
  }

  async function refresh() {
    await loadData()
    await refreshCounts()
    await refreshMetrics()
  }

  const handleAdd = async (values: {
    code: string
    name: string
    college_code: string
  }) => {
    try {
      await addProgram(values)
      await refresh()
      toast.success("Program added successfully!")
    } catch (err) {
      toast.error((err as Error).message)
      throw err
    }
  }

  const handleEdit = async (
    oldCode: string,
    data: { code: string; name: string; college_code: string }
  ) => {
    try {
      await updateProgram(oldCode, data)
      await refresh()
      toast.success("Program updated successfully!")
    } catch (err) {
      toast.error((err as Error).message)
      throw err
    }
  }

  const handleDelete = async (code: string) => {
    try {
      await deleteProgram(code)
      await refresh()
      toast.success("Program deleted!")
    } catch (err) {
      toast.error((err as Error).message)
      throw err
    }
  }

  const handleBulkDelete = async (codes: string[]) => {
    try {
      await bulkDeletePrograms(codes)
      await refresh()
      toast.success(`${codes.length} program(s) deleted!`)
    } catch (err) {
      toast.error((err as Error).message)
      throw err
    }
  }

  const collegeOptions = React.useMemo(() => {
    return colleges.map((c) => ({
      label: c.code,
      value: c.code,
    }))
  }, [colleges])

  return (
    <>
      <SiteHeader title="Programs" />

      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="program" />

        <div className="px-4 lg:px-6">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={columns(
                handleDelete,
                handleEdit,
                colleges.map((c) => ({ code: c.code, name: c.name })),
                programs.map((p) => p.code.toUpperCase()),
                handleBulkDelete
              )}
              data={programs}
              searchKeys={["code", "name", "college_code"]}
              searchPlaceholder="Search programs..."
              addTitle="Add Program"
              addFormId="program-form"
              addDescription="Add a new program"
              filterableColumns={[
                {
                  id: "college_code",
                  label: "College",
                  options: collegeOptions,
                },
              ]}
              renderAddForm={({
                onSuccess,
                onValidityChange,
                setIsSubmitting,
              }) => (
                <ProgramForm
                  onSubmit={handleAdd}
                  existingCodes={programs.map((p) => p.code.toUpperCase())}
                  colleges={colleges}
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

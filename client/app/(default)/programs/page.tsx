"use client"

import React from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { ProgramForm } from "@/components/forms/program-form"
import { toast } from "sonner"
import { useCounts } from "@/components/data/counts-context"

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

  // initial load
  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [collegesResult, programsResult] = await Promise.all([
        getColleges(),
        getPrograms(),
      ])
      setColleges(collegesResult)
      setPrograms(programsResult)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function refresh() {
    await loadData()
    await refreshCounts()
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
    }
  }

  const handleDelete = async (code: string) => {
    try {
      await deleteProgram(code)
      await refresh()
      toast.success("Program deleted!")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const handleBulkDelete = async (codes: string[]) => {
    try {
      await bulkDeletePrograms(codes)
      await refresh()
      toast.success(`${codes.length} program(s) deleted!`)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <>
      <SiteHeader title="Programs" />

      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="program" />

        <div className="px-4 lg:px-6">
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
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <ProgramForm
                onSubmit={handleAdd}
                existingCodes={programs.map((p) => p.code.toUpperCase())}
                colleges={colleges}
                onSuccess={onSuccess}
                onValidityChange={onValidityChange}
              />
            )}
          />
        </div>
      </div>
    </>
  )
}

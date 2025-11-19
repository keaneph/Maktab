"use client"

import * as React from "react"
import { authFetch } from "@/lib/api"
import { SiteHeader } from "@/components/layout/site-header"
import { Colleges } from "../colleges/columns"
import { Programs, columns } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { ProgramForm } from "@/components/forms/program-form"
import { useCounts } from "@/components/data/counts-context"
import { toast } from "sonner"

export default function ProgramsPage() {
  const [collegeData, setCollegeData] = React.useState<Colleges[]>([])
  const [programData, setProgramData] = React.useState<Programs[]>([])
  const { refreshCounts } = useCounts()

  const fetchColleges = React.useCallback(async (init?: RequestInit) => {
    const res = await fetch("http://localhost:8080/api/colleges/", init)
    if (!res.ok) {
      const message = await res.text().catch(() => "")
      throw new Error(message || "Failed to fetch colleges")
    }
    return (await res.json()) as Colleges[]
  }, [])

  const fetchPrograms = React.useCallback(async (init?: RequestInit) => {
    const res = await fetch("http://localhost:8080/api/programs/", init)
    if (!res.ok) {
      const message = await res.text().catch(() => "")
      throw new Error(message || "Failed to fetch programs")
    }
    return (await res.json()) as Programs[]
  }, [])

  // Fetch only what we need: colleges (for form dropdown) and programs (for table)
  React.useEffect(() => {
    const abortController = new AbortController()
    
    async function fetchData() {
      try {
        const colleges = await fetchColleges({
          signal: abortController.signal,
        })
        if (!abortController.signal.aborted) {
          setCollegeData(colleges)
        }
        const programs = await fetchPrograms({
          signal: abortController.signal,
        })
        if (!abortController.signal.aborted) {
          setProgramData(programs)
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        const err = error as Error
        toast.error(`Error fetching data: ${err.message}`)
      }
    }
    fetchData()
    
    return () => {
      abortController.abort()
    }
  }, [])

  // Refetch function
  const refetchData = React.useCallback(async () => {
    try {
      const colleges = await fetchColleges()
      setCollegeData(colleges)
      const programs = await fetchPrograms()
      setProgramData(programs)
      // Refresh counts after data changes
      await refreshCounts()
    } catch (error) {
      const err = error as Error
      toast.error(`Error fetching data: ${err.message}`)
    }
  }, [refreshCounts])

  async function handleAdd(values: {
    code: string
    name: string
    college_code: string
  }) {
    try {
      const res = await authFetch("http://localhost:8080/api/programs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: values.code,
          name: values.name,
          college_code: values.college_code,
        }),
      })
      if (!res.ok) throw new Error("Failed to add program")
      await refetchData()
      toast.success("Program added successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to add program: ${err.message}`)
      throw error
    }
  }

  async function handleEdit(
    oldCode: string,
    data: { code: string; name: string; college_code: string }
  ) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/programs/${oldCode}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) throw new Error("Failed to update program")
      await refetchData()
      toast.success("Program updated successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to update program: ${err.message}`)
      throw error
    }
  }

  async function handleDelete(code: string) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/programs/${code}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
      if (!res.ok) throw new Error("Failed to delete program")
      await refetchData()
      toast.success("Program deleted successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete program: ${err.message}`)
      throw error
    }
  }

  async function handleBulkDelete(codes: string[]) {
    try {
      await Promise.all(
        codes.map((code) =>
          authFetch(`http://localhost:8080/api/programs/${code}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      )
      await refetchData()
      toast.success(`${codes.length} program(s) deleted successfully!`)
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete programs: ${err.message}`)
      throw error
    }
  }
  return (
    <>
      <SiteHeader title="Programs" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="program" />
        <div className="px-4 lg:px-6">
          <DataTable<
            Programs,
            unknown,
            Pick<Programs, "code" | "name" | "college_code">
          >
            columns={columns(
              handleDelete,
              handleEdit,
              collegeData.map((c: Colleges) => ({
                code: c.code,
                name: c.name,
              })),
              programData.map((p: Programs) => p.code.toUpperCase()),
              handleBulkDelete
            )}
            data={programData}
            searchPlaceholder="Search programs..."
            addTitle="Add Program"
            addDescription="Add a new program to the list."
            addFormId="program-form"
            searchKeys={["code", "name", "college_code"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <ProgramForm
                onSubmit={handleAdd}
                existingCodes={programData.map((p: Programs) =>
                  p.code.toUpperCase()
                )}
                colleges={collegeData.map((c: Colleges) => ({
                  code: c.code,
                  name: c.name,
                }))}
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

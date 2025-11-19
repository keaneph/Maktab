"use client"

import * as React from "react"
import { authFetch, fetcher } from "@/lib/api"
import { SiteHeader } from "@/components/layout/site-header"
import { Colleges, columns } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { CollegeForm } from "@/components/forms/college-form"
import { useCounts } from "@/components/data/counts-context"
import { toast } from "sonner"

export default function CollegesPage() {
  const [collegeData, setCollegeData] = React.useState<Colleges[]>([])
  const { refreshCounts } = useCounts()

  // Fetch only what we need: colleges (for table)
  React.useEffect(() => {
    const abortController = new AbortController()
    
    async function fetchData() {
      try {
        const colleges = await fetcher<Colleges[]>(
          "http://localhost:8080/api/colleges/",
          { signal: abortController.signal }
        )
        if (!abortController.signal.aborted) {
          setCollegeData(colleges)
        }
      } catch (error) {
        if (abortController.signal.aborted) return // Ignore aborted requests
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
      const colleges = await fetcher<Colleges[]>(
        "http://localhost:8080/api/colleges/"
      )
      setCollegeData(colleges)
      // Refresh counts after data changes
      await refreshCounts()
    } catch (error) {
      const err = error as Error
      toast.error(`Error fetching data: ${err.message}`)
    }
  }, [refreshCounts])

  // handler for adding a college
  // this makes sure that when i call this function, it passes the right values
  async function handleAdd(values: { code: string; name: string }) {
    try {
      const res = await authFetch("http://localhost:8080/api/colleges/", {
        method: "POST",
        body: JSON.stringify({
          code: values.code,
          name: values.name,
        }),
      })
      if (!res.ok) throw new Error("Failed to add")
      await refetchData()
      toast.success("College added successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to add college: ${err.message}`)
      throw error
    }
  }

  // handler for editing a college
  async function handleEdit(
    oldCode: string,
    data: { code: string; name: string }
  ) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/colleges/${oldCode}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) throw new Error("Failed to update college")
      await refetchData()
      toast.success("College updated successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to update college: ${err.message}`)
      throw error
    }
  }

  // handler for deleting a college
  async function handleDelete(code: string) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/colleges/${code}`,
        {
          method: "DELETE",
        }
      )
      if (!res.ok) throw new Error("Failed to delete college")
      await refetchData()
      toast.success("College deleted successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete college: ${err.message}`)
      throw error
    }
  }

  // bulk delete for colleges
  async function handleBulkDelete(codes: string[]) {
    try {
      await Promise.all(
        codes.map((c) =>
          authFetch(`http://localhost:8080/api/colleges/${c}`, {
            method: "DELETE",
          })
        )
      )
      await refetchData()
      toast.success(`${codes.length} college(s) deleted successfully!`)
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete colleges: ${err.message}`)
      throw error
    }
  }

  return (
    <>
      <SiteHeader title="Colleges" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="college" />
        <div className="px-4 lg:px-6">
          <DataTable<Colleges, unknown, Pick<Colleges, "code" | "name">>
            columns={columns(
              handleDelete,
              handleEdit,
              handleBulkDelete,
              collegeData.map((c: Colleges) => c.code.toUpperCase())
            )}
            data={collegeData}
            searchPlaceholder="Search colleges..."
            addTitle="Add College"
            addDescription="Add a new college to the list."
            searchKeys={["code", "name"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <CollegeForm
                onSubmit={handleAdd}
                existingCodes={collegeData.map((c: Colleges) =>
                  c.code.toUpperCase()
                )}
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

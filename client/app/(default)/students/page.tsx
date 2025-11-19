"use client"

import * as React from "react"
import { authFetch, fetcher } from "@/lib/api"
import { SiteHeader } from "@/components/layout/site-header"
import { Programs } from "../programs/columns"
import { Students, columns } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { StudentForm } from "@/components/forms/student-form"
import { useCounts } from "@/components/data/counts-context"
import { toast } from "sonner"

export default function StudentsPage() {
  const [studentData, setStudentData] = React.useState<Students[]>([])
  const [programData, setProgramData] = React.useState<Programs[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { refreshCounts } = useCounts()

  // Fetch only what we need: programs (for form dropdown) and students (for table)
  React.useEffect(() => {
    const abortController = new AbortController()
    
    async function fetchData() {
      try {
        setIsLoading(true)
        const students = await fetcher<Students[]>("http://localhost:8080/api/students/", { signal: abortController.signal })
        if (!abortController.signal.aborted) {
          setStudentData(students)
        }
        const programs = await fetcher<Programs[]>("http://localhost:8080/api/programs/", { signal: abortController.signal })
        if (!abortController.signal.aborted) {
          setProgramData(programs)
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        const err = error as Error
        toast.error(`Error fetching data: ${err.message}`)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
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
      const students = await fetcher<Students[]>("http://localhost:8080/api/students/")
      setStudentData(students)
      const programs = await fetcher<Programs[]>("http://localhost:8080/api/programs/")
      setProgramData(programs)
      // Refresh counts after data changes
      await refreshCounts()
    } catch (error) {
      const err = error as Error
      toast.error(`Error fetching data: ${err.message}`)
    }
  }, [refreshCounts])

  async function handleAdd(values: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
  }) {
    try {
      const newItem = { ...values, year: parseInt(values.year) }
      const res = await authFetch("http://localhost:8080/api/students/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newItem),
      })
      if (!res.ok) throw new Error("Failed to add student")
      await refetchData()
      toast.success("Student added successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to add student: ${err.message}`)
      throw error
    }
  }

  async function handleEdit(
    oldId: string,
    data: {
      idNo: string
      firstName: string
      lastName: string
      course: string
      year: string
      gender: string
    }
  ) {
    try {
      const payload = {
        ...data,
        year: parseInt(data.year),
      }
      const res = await authFetch(
        `http://localhost:8080/api/students/${oldId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) throw new Error("Failed to update student")
      await refetchData()
      toast.success("Student updated successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to update student: ${err.message}`)
      throw error
    }
  }

  async function handleDelete(id_no: string) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/students/${id_no}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
      if (!res.ok) throw new Error("Failed to delete student")
      await refetchData()
      toast.success("Student deleted successfully!")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete student: ${err.message}`)
      throw error
    }
  }

  async function handleBulkDelete(ids: string[]) {
    try {
      await Promise.all(
        ids.map((id) =>
          authFetch(`http://localhost:8080/api/students/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      )
      await refetchData()
      toast.success(`${ids.length} student(s) deleted successfully!`)
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete students: ${err.message}`)
      throw error
    }
  }

  return (
    <>
      <SiteHeader title="Students" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="student" />
        <div className="px-4 lg:px-6">
          <DataTable<
            Students,
            unknown,
            Pick<
              Students,
              "idNo" | "firstName" | "lastName" | "course" | "year" | "gender"
            >
          >
            columns={columns(
              handleDelete,
              handleEdit,
              programData.map((p: Programs) => ({
                code: p.code,
                name: p.name,
              })),
              studentData.map((s: Students) => s.idNo.toUpperCase()),
              handleBulkDelete
            )}
            data={studentData}
            searchPlaceholder="Search students..."
            addTitle="Add Student"
            addDescription="Add a new student to the list."
            addFormId="student-form"
            searchKeys={[
              "idNo",
              "firstName",
              "lastName",
              "course",
              "year",
              "gender",
            ]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <StudentForm
                onSubmit={handleAdd}
                existingIds={studentData.map((s: Students) =>
                  s.idNo.toUpperCase()
                )}
                programs={programData.map((p: Programs) => ({
                  code: p.code,
                  name: p.name,
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

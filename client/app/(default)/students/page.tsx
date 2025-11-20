"use client"

import React from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { Students, columns } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { StudentForm } from "@/components/forms/student-form"
import { useCounts } from "@/components/data/counts-context"
import { toast } from "sonner"

import {
  getStudents,
  addStudent,
  editStudent,
  deleteStudent,
  bulkDeleteStudents,
} from "@/lib/student-service"

import { getPrograms } from "@/lib/program-service"
import { Programs } from "../programs/columns"

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Students[]>([])
  const [programs, setPrograms] = React.useState<Programs[]>([])
  const { refreshCounts } = useCounts()

  const hasLoaded = React.useRef(false)

  React.useEffect(() => {
    if (!hasLoaded.current) {
      loadData()
      hasLoaded.current = true
    }
  }, [])

  async function loadData() {
    try {
      const [s, p] = await Promise.all([getStudents(), getPrograms()])
      setStudents(s)
      setPrograms(p)
    } catch (err) {
      toast.error(`Error fetching data: ${(err as Error).message}`)
    }
  }

  async function refresh() {
    await loadData()
    await refreshCounts()
  }

  const handleAdd = async (values: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
  }) => {
    try {
      await addStudent(values)
      await refresh()
      toast.success("Student added successfully!")
    } catch (err) {
      toast.error(`Failed to add student: ${(err as Error).message}`)
    }
  }

  const handleEdit = async (
    oldId: string,
    values: {
      idNo: string
      firstName: string
      lastName: string
      course: string
      year: string
      gender: string
    }
  ) => {
    try {
      await editStudent(oldId, values)
      await refresh()
      toast.success("Student updated!")
    } catch (err) {
      toast.error(`Failed to update student: ${(err as Error).message}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id)
      await refresh()
      toast.success("Student deleted!")
    } catch (err) {
      toast.error(`Failed to delete student: ${(err as Error).message}`)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDeleteStudents(ids)
      await refresh()
      toast.success(`${ids.length} student(s) deleted!`)
    } catch (err) {
      toast.error(`Failed to delete students: ${(err as Error).message}`)
    }
  }

  return (
    <>
      <SiteHeader title="Students" />

      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="student" />

        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns(
              handleDelete,
              handleEdit,
              programs.map((p) => ({ code: p.code, name: p.name })),
              students.map((s) => s.idNo.toUpperCase()),
              handleBulkDelete
            )}
            data={students}
            searchPlaceholder="Search students..."
            addTitle="Add Student"
            addDescription="Add a new student"
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
                existingIds={students.map((s) => s.idNo.toUpperCase())}
                programs={programs.map((p) => ({
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

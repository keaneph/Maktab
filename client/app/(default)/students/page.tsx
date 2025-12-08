"use client"

import React from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { Students, columns } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { StudentForm } from "@/components/forms/student-form"
import { useCounts } from "@/components/data/counts-context"
import { useDailyMetrics } from "@/components/data/use-daily-metrics"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/data/table-skeleton"

import {
  getStudents,
  addStudent,
  editStudent,
  deleteStudent,
  bulkDeleteStudents,
} from "@/lib/student-service"

import { getPrograms } from "@/lib/program-service"
import { getColleges } from "@/lib/college-service"
import { Programs } from "../programs/columns"
import { Colleges } from "../colleges/columns"

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Students[]>([])
  const [programs, setPrograms] = React.useState<Programs[]>([])
  const [colleges, setColleges] = React.useState<Colleges[]>([])
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
      const [s, p, c] = await Promise.all([
        getStudents(),
        getPrograms(),
        getColleges(),
      ])
      setStudents(s)
      setPrograms(p)
      setColleges(c)
    } catch (err) {
      toast.error(`Error fetching data: ${(err as Error).message}`)
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
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
    photo_path?: string
  }) => {
    try {
      await addStudent(values)
      await refresh()
      toast.success("Student added successfully!")
    } catch (err) {
      toast.error(`Failed to add student: ${(err as Error).message}`)
      throw err
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
      photo_path?: string
    }
  ) => {
    try {
      await editStudent(oldId, values)
      await refresh()
      toast.success("Student updated!")
    } catch (err) {
      toast.error(`Failed to update student: ${(err as Error).message}`)
      throw err
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id)
      await refresh()
      toast.success("Student deleted!")
    } catch (err) {
      toast.error(`Failed to delete student: ${(err as Error).message}`)
      throw err
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDeleteStudents(ids)
      await refresh()
      toast.success(`${ids.length} student(s) deleted!`)
    } catch (err) {
      toast.error(`Failed to delete students: ${(err as Error).message}`)
      throw err
    }
  }

  const collegeOptions = React.useMemo(() => {
    return colleges.map((c) => ({
      label: c.code,
      value: c.code,
    }))
  }, [colleges])

  const courseOptions = React.useMemo(() => {
    const uniqueCourses = [
      ...new Set(students.map((s) => s.course).filter(Boolean)),
    ]
    return uniqueCourses.map((course) => ({ label: course, value: course }))
  }, [students])

  const yearOptions = [
    { label: "1st Year", value: "1" },
    { label: "2nd Year", value: "2" },
    { label: "3rd Year", value: "3" },
    { label: "4th Year", value: "4" },
  ]

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ]

  return (
    <>
      <SiteHeader title="Students" />

      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="student" />

        <div className="px-4 lg:px-6">
          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : (
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
                "college_code",
                "course",
                "year",
                "gender",
              ]}
              filterableColumns={[
                {
                  id: "college_code",
                  label: "All College",
                  options: collegeOptions,
                },
                { id: "course", label: "All Course", options: courseOptions },
                { id: "year", label: "All Year", options: yearOptions },
                { id: "gender", label: "All Gender", options: genderOptions },
              ]}
              renderAddForm={({
                onSuccess,
                onValidityChange,
                setIsSubmitting,
              }) => (
                <StudentForm
                  onSubmit={handleAdd}
                  existingIds={students.map((s) => s.idNo.toUpperCase())}
                  programs={programs.map((p) => ({
                    code: p.code,
                    name: p.name,
                  }))}
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

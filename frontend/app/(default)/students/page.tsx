"use client"

import * as React from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { SiteHeader } from "@/components/site-header"
import { Colleges } from "../colleges/columns"
import { Programs } from "../programs/columns"
import { Students, columns } from "./columns"
import { DataTable } from "@/components/data-table"
import userData from "@/app/(default)/miscellaneous/user-data.json"
import { SectionCards } from "@/components/section-cards"
import { StudentForm } from "@/components/student-form"
import { toast } from "sonner"

export default function StudentsPage() {
  const { data: collegeData = [], error: collegesErr } = useSWR<Colleges[], Error>("http://127.0.0.1:8080/api/colleges/")
  const { data: studentData = [], error: studentsErr } = useSWR<Students[], Error>("http://127.0.0.1:8080/api/students/")
  const { data: programData = [], error: programsErr } = useSWR<Programs[], Error>("http://127.0.0.1:8080/api/programs/")
  React.useEffect(() => {
    if (collegesErr) toast.error(`Error fetching colleges: ${collegesErr.message}`)
  }, [collegesErr])
  React.useEffect(() => {
    if (studentsErr) toast.error(`Error fetching students: ${studentsErr.message}`)
  }, [studentsErr])
  React.useEffect(() => {
    if (programsErr) toast.error(`Error fetching programs: ${programsErr.message}`)
  }, [programsErr])

  async function handleAdd(values: { idNo: string; firstName: string; lastName: string; course: string; year: string; gender: string }) {
    const newItem = { ...values, year: parseInt(values.year), dateCreated: new Date().toISOString(), addedBy: "admin" }
    await globalMutate(
      "http://127.0.0.1:8080/api/students/",
      async (current: Students[] = []) => {
        const res = await fetch("http://127.0.0.1:8080/api/students/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        })
        const created = await res.json()
        return [...current, created]
      },
      { revalidate: false, optimisticData: (current?: Students[]) => [...(current ?? []), newItem], rollbackOnError: true }
    )
    toast.success("Student added successfully!")
  }

  async function handleEdit(oldId: string, data: { idNo: string; firstName: string; lastName: string; course: string; year: string; gender: string }) {
    const payload = { ...data, year: parseInt(data.year), dateCreated: new Date().toISOString(), addedBy: "admin" }
    await globalMutate(
      "http://127.0.0.1:8080/api/students/",
      async (current: Students[] = []) => {
        const res = await fetch(`http://127.0.0.1:8080/api/students/${oldId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to update student")
        const updated = await res.json()
        return current.map((s: Students) => (s.idNo === oldId ? updated : s))
      },
      {
        revalidate: false,
        optimisticData: (current?: Students[]) => (current ?? []).map((s: Students) => (s.idNo === oldId ? { ...s, ...payload } as Students : s)),
        rollbackOnError: true,
      }
    )
    toast.success("Student updated successfully!")
  }

  async function handleDelete(id_no: string) {
    await globalMutate(
      "http://127.0.0.1:8080/api/students/",
      async (current: Students[] = []) => {
        const res = await fetch(`http://127.0.0.1:8080/api/students/${id_no}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Failed to delete student")
        await res.json()
        return current.filter((s: Students) => s.idNo !== id_no)
      },
      { revalidate: false, optimisticData: (current?: Students[]) => (current ?? []).filter((s: Students) => s.idNo !== id_no), rollbackOnError: true }
    )
    toast.success("Student deleted successfully!")
  }

  return (
    <>
      <SiteHeader title="Students" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="student"
        />
        <div className="px-4 lg:px-6">
          <DataTable<Students, unknown, Pick<Students, "idNo" | "firstName" | "lastName" | "course" | "year" | "gender">>
            columns={columns(
              handleDelete,
              handleEdit,
              programData.map((p: Programs) => ({ code: p.code, name: p.name })),
              studentData.map((s: Students) => s.idNo.toUpperCase())
            )}
            data={studentData}
            searchPlaceholder="Search students..."
            addTitle="Add Student"
            addDescription="Add a new student to the list."
            addFormId="student-form"
            searchKeys={["idNo", "firstName", "lastName", "course", "year", "gender", "dateCreated", "addedBy"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <StudentForm
                onSubmit={handleAdd}
                existingIds={studentData.map((s: Students) => s.idNo.toUpperCase())}
                programs={programData.map((p: Programs) => ({ code: p.code, name: p.name }))}
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

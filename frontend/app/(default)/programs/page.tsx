"use client"

import * as React from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { SiteHeader } from "@/components/site-header";
import { Colleges } from "../colleges/columns";
import { Programs, columns } from "./columns";
import { Students } from "../students/columns";
import { DataTable } from "@/components/data-table";
import userData from "@/app/(default)/miscellaneous/user-data.json";
import { SectionCards } from "@/components/section-cards";
import { ProgramForm } from "@/components/program-form";
import { toast } from "sonner"

export default function ProgramsPage() {
  const { data: collegeData = [], error: collegesErr } = useSWR<Colleges[], Error>("http://127.0.0.1:8080/api/colleges/")
  const { data: programData = [], error: programsErr } = useSWR<Programs[], Error>("http://127.0.0.1:8080/api/programs/")
  const { data: studentData = [], error: studentsErr } = useSWR<Students[], Error>("http://127.0.0.1:8080/api/students/")
  React.useEffect(() => {
    if (collegesErr) toast.error(`Error fetching colleges: ${collegesErr.message}`)
  }, [collegesErr])
  React.useEffect(() => {
    if (programsErr) toast.error(`Error fetching programs: ${programsErr.message}`)
  }, [programsErr])
  React.useEffect(() => {
    if (studentsErr) toast.error(`Error fetching students: ${studentsErr.message}`)
  }, [studentsErr])

  async function handleAdd(values: { code: string; name: string; college_code: string }) {
    const newItem = { ...values, dateCreated: new Date().toISOString(), addedBy: "admin" }
    await globalMutate(
      "http://127.0.0.1:8080/api/programs/",
      async (current: Programs[] = []) => {
        const res = await fetch("http://127.0.0.1:8080/api/programs/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        })
        const created = await res.json()
        return [...current, created]
      },
      { revalidate: false, optimisticData: (current?: Programs[]) => [...(current ?? []), newItem], rollbackOnError: true }
    )
    toast.success("Program added successfully!")
  }

  async function handleEdit(oldCode: string, data: { code: string; name: string; college_code: string }) {
    const payload = { ...data, dateCreated: new Date().toISOString(), addedBy: "admin" }
    await globalMutate(
      "http://127.0.0.1:8080/api/programs/",
      async (current: Programs[] = []) => {
        const res = await fetch(`http://127.0.0.1:8080/api/programs/${oldCode}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to update program")
        const updated = await res.json()
        return current.map((p: Programs) => (p.code === oldCode ? updated : p))
      },
      {
        revalidate: false,
        optimisticData: (current?: Programs[]) => (current ?? []).map((p: Programs) => (p.code === oldCode ? { ...p, ...payload } as Programs : p)),
        rollbackOnError: true,
      }
    )
    toast.success("Program updated successfully!")
  }

  async function handleDelete(code: string) {
    await globalMutate(
      "http://127.0.0.1:8080/api/programs/",
      async (current: Programs[] = []) => {
        const res = await fetch(`http://127.0.0.1:8080/api/programs/${code}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Failed to delete program")
        await res.json()
        return current.filter((p: Programs) => p.code !== code)
      },
      { revalidate: false, optimisticData: (current?: Programs[]) => (current ?? []).filter((p: Programs) => p.code !== code), rollbackOnError: true }
    )
    toast.success("Program deleted successfully!")
  }
  return (
    <>
      <SiteHeader title="Programs" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="program"
        />
        <div className="px-4 lg:px-6">
          <DataTable<Programs, unknown, Pick<Programs, "code" | "name" | "college_code">>
            columns={columns(
              handleDelete,
              handleEdit,
              collegeData.map((c: Colleges) => ({ code: c.code, name: c.name })),
              programData.map((p: Programs) => p.code.toUpperCase())
            )}
            data={programData}
            searchPlaceholder="Search programs..."
            addTitle="Add Program"
            addDescription="Add a new program to the list."
            addFormId="program-form"
            searchKeys={["code", "name", "college_code", "dateCreated", "addedBy"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <ProgramForm
                onSubmit={handleAdd}
                existingCodes={programData.map((p: Programs) => p.code.toUpperCase())}
                colleges={collegeData.map((c: Colleges) => ({ code: c.code, name: c.name }))}
                onSuccess={onSuccess}
                onValidityChange={onValidityChange}
              />
            )}
          />
        </div>
      </div>
    </>
  );
}

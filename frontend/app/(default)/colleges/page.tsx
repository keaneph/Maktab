"use client"

import * as React from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { SiteHeader } from "@/components/site-header"
import { Colleges, columns } from "./columns"
import { Programs } from "../programs/columns"
import { Students } from "../students/columns"
import { Miscellaneous } from "../miscellaneous/columns"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { CollegeForm } from "@/components/college-form"
import { toast } from "sonner"

export default function CollegesPage() {
  const { data: collegeData = [], error: collegesErr } = useSWR<Colleges[], Error>("http://localhost:8080/api/colleges/")
  const { data: programData = [], error: programsErr } = useSWR<Programs[], Error>("http://localhost:8080/api/programs/")
  const { data: studentData = [], error: studentsErr } = useSWR<Students[], Error>("http://localhost:8080/api/students/")
  const { data: userData = [], error: userErr } = useSWR<Miscellaneous[], Error>("http://localhost:8080/api/users/")
  
  React.useEffect(() => {
    if (collegesErr) toast.error(`Error fetching colleges: ${collegesErr.message}`)
  }, [collegesErr])
  React.useEffect(() => {
    if (programsErr) toast.error(`Error fetching programs: ${programsErr.message}`)
  }, [programsErr])
  React.useEffect(() => {
    if (studentsErr) toast.error(`Error fetching students: ${studentsErr.message}`)
  }, [studentsErr])
  React.useEffect(() => {
    if (userErr) toast.error(`Error fetching users: ${userErr.message}`)
  }, [userErr])

  // handler for adding a college
  // this makes sure that when i call this function, it passes the right values
  async function handleAdd(values: { code: string; name: string }) {
    const newItem: Colleges = {
      ...values,
      dateCreated: new Date().toISOString(),
      addedBy: "(you)",
    }
    // optimistic update
    await globalMutate(
      "http://localhost:8080/api/colleges/",
      async (current: Colleges[] = []) => {
        const res = await fetch("http://localhost:8080/api/colleges/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: newItem.code, name: newItem.name, dateCreated: newItem.dateCreated }),
        })
        if (!res.ok) throw new Error("Failed to add")
        const created = await res.json()
        return [...current, created]
      },
      { revalidate: false, optimisticData: (current?: Colleges[]) => [...(current ?? []), newItem], rollbackOnError: true }
    )
    toast.success("College added successfully!")
  }

  // handler for editing a college
  async function handleEdit(oldCode: string, data: { code: string; name: string }) {
    const payload = {
      ...data,
      dateCreated: new Date().toISOString(),
    }
    await globalMutate(
      "http://localhost:8080/api/colleges/",
      async (current: Colleges[] = []) => {
        const res = await fetch(`http://localhost:8080/api/colleges/${oldCode}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to update college")
        const updated = await res.json()
        return current.map((c: Colleges) => (c.code === oldCode ? updated : c))
      },
      {
        revalidate: false,
        optimisticData: (current?: Colleges[]) => (current ?? []).map((c: Colleges) => (c.code === oldCode ? { ...c, ...payload } as Colleges : c)),
        rollbackOnError: true,
      }
    )
    toast.success("College updated successfully!")
  }

  // handler for deleting a college
  async function handleDelete(code: string) {
    await globalMutate(
      "http://localhost:8080/api/colleges/",
      async (current: Colleges[] = []) => {
        const res = await fetch(`http://localhost:8080/api/colleges/${code}`, { method: "DELETE", credentials: "include" })
        if (!res.ok) throw new Error("Failed to delete college")
        await res.json()
        return current.filter((c: Colleges) => c.code !== code)
      },
      {
        revalidate: false,
        optimisticData: (current?: Colleges[]) => (current ?? []).filter((c: Colleges) => c.code !== code),
        rollbackOnError: true,
      }
    )
    toast.success("College deleted successfully!")
  }

  // bulk delete for colleges with single mutate for optimistic UI
  async function handleBulkDelete(codes: string[]) {
    const setCodes = new Set(codes)
    await globalMutate(
      "http://localhost:8080/api/colleges/",
      async (current: Colleges[] = []) => {
        await Promise.all(
          codes.map((code) =>
            fetch(`http://localhost:8080/api/colleges/${code}`, { method: "DELETE", credentials: "include" })
          )
        )
        return current.filter((c: Colleges) => !setCodes.has(c.code))
      },
      {
        revalidate: false,
        optimisticData: (current?: Colleges[]) => (current ?? []).filter((c: Colleges) => !setCodes.has(c.code)),
        rollbackOnError: true,
      }
    )
    toast.success(`${codes.length} college(s) deleted successfully!`)
  }

  return (
    <>
      <SiteHeader title="Colleges"/>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="college"/>
        <div className="px-4 lg:px-6">
          {/* renders the data table compo, meaning its a College objects, unknown for the filter, 
          Pick is a utility type, it makes a new type by picking only specific fields from
          another type, in this case just code and name, so that means i can just add code
          and name without adding dateCreated and addedBy */}
          <DataTable<Colleges, unknown, Pick<Colleges, "code" | "name">>
            columns={columns(
              handleDelete, 
              handleEdit, 
              handleBulkDelete,
              collegeData.map((c: Colleges) => c.code.toUpperCase()))}
            data={collegeData}
            searchPlaceholder="Search colleges..."
            addTitle="Add College"
            addDescription="Add a new college to the list."
            searchKeys={["code", "name", "dateCreated", "addedBy"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <CollegeForm
                onSubmit={handleAdd}
                existingCodes={collegeData.map((c: Colleges) => c.code.toUpperCase())}
                onSuccess={onSuccess}
                onValidityChange={onValidityChange}/>
            )}
          />        
        </div>
      </div>
    </>
  )
}

"use client"

import * as React from "react"
import { SiteHeader } from "@/components/site-header";
import { Programs, columns } from "./columns";
import { DataTable } from "@/components/data-table";
import collegeData from "@/app/(default)/colleges/college-data.json";
import programDataJson from "@/app/(default)/programs/program-data.json";
import studentData from "@/app/(default)/students/student-data.json";
import userData from "@/app/(default)/miscellaneous/user-data.json";

import { SectionCards } from "@/components/section-cards";
import { ProgramForm } from "@/components/program-form";
import { toast } from "sonner"

export default function ProgramsPage() {
  const [collegeDataState, setCollegeData] = React.useState<typeof collegeData>([]);
  const [programData, setProgramData] = React.useState<Programs[]>([])
  React.useEffect(() => {
    fetch("http://127.0.0.1:8080/api/colleges/")
      .then((res) => res.json())
      .then((json) => {
        setCollegeData(json)
      })
      .catch((err) => {
        toast.error(`Error fetching colleges: ${err.message}`)
      })
  }, [])
  React.useEffect(() => {
    fetch("http://127.0.0.1:8080/api/programs/")
      .then((res) => res.json())
      .then((json) => {
        setProgramData(json)
      })
      .catch((err) =>
        toast.error(`Error fetching programs: ${err.message}`)
      )
  }, [])

  async function handleAdd(values: { code: string; name: string; college_code: string }) {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/programs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dateCreated: new Date().toISOString(),
          addedBy: "admin",
        }),
      })
      const newProgram = await res.json()
      setProgramData((prev) => [...prev, newProgram])
      toast.success("Program added successfully!")
    } catch (err) {
      console.error("Error adding program:", err)
      toast.error("Failed to add program.")
      throw err
    }
  }

  async function handleEdit(oldCode: string, data: { code: string; name: string; college_code: string }) {
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/programs/${oldCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateCreated: new Date().toISOString(),
          addedBy: "admin",
        }),
      })
      if (!res.ok) throw new Error("Failed to update program")
      const updatedProgram = await res.json()
      setProgramData((prev) => 
        prev.map((p) => (p.code === oldCode ? updatedProgram : p))
    )
      toast.success("Program updated successfully!")
    } catch (err) {
      console.error("Error updating program:", err)
      toast.error("Failed to update program.")
    }
  }

  async function handleDelete(code: string) {
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/programs/${code}`, { 
        method: "DELETE", 
      })
      if (!res.ok) throw new Error("Failed to delete program")
      setProgramData((prev) => 
        prev.filter((p) => p.code !== code))
      toast.success("Program deleted successfully!")
    } catch (err) {
      console.error("Error deleting program:", err)
      toast.error("Failed to delete program.")
    }
  }
  return (
    <>
      <SiteHeader title="Programs" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeDataState.length}
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
              collegeDataState.map((c) => ({ code: c.code, name: c.name })),
              programData.map((p) => p.code.toUpperCase())
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
                existingCodes={programData.map((p) => p.code.toUpperCase())}
                colleges={collegeDataState.map((c) => ({ code: c.code, name: c.name }))}
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

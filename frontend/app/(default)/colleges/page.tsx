"use client"

import * as React from "react"
import { SiteHeader } from "@/components/site-header"
import { Colleges, columns } from "./columns"
import { DataTable } from "@/components/data-table"
import programData from "@/app/(default)/programs/program-data.json"
import studentData from "@/app/(default)/students/student-data.json"
import userData from "@/app/(default)/miscellaneous/user-data.json"
import { SectionCards } from "@/components/section-cards"
import { CollegeForm } from "@/components/college-form"
import { toast } from "sonner"

export default function CollegesPage() {
  // state for college data; basically, it will start as an empty array
  // and then it makes it so that collegeData will always be an array of Colleges objects
  const [collegeData, setCollegeData] = React.useState<Colleges[]>([])
  // fetch college data from the backend API when the component mounts; 
  // [] means it only runs once after the first render. 
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

  // handler for adding a college
  // this makes sure that when i call this function, it passes the right values
  async function handleAdd(values: { code: string; name: string }) {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/colleges/", {
        method: "POST",
        // headers says im sending json data
        headers: { "Content-Type": "application/json" },
        // the actual data im sending
        body: JSON.stringify({
          ... values,
          dateCreated: new Date().toISOString(),
          addedBy: "admin", // NOTE: replace with logged-in user later
        }),
      })

      const newCollege = await res.json()

      // update state immediately
      // setCollegeData takes the previous state (prev) and adds the new college to it
      setCollegeData((prev) => [...prev, newCollege])
    } catch (err) {
      console.error("Error adding college:", err)
      throw err
    }
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
            columns={columns}
            data={collegeData}
            searchPlaceholder="Search colleges..."
            addTitle="Add College"
            addDescription="Add a new college to the list."
            searchKeys={["code", "name", "dateCreated", "addedBy"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <CollegeForm
                onSubmit={handleAdd}
                existingCodes={collegeData.map(c => c.code.toUpperCase())}
                onSuccess={onSuccess}
                onValidityChange={onValidityChange}/>
            )}
          />
        </div>
      </div>
    </>
  )
}

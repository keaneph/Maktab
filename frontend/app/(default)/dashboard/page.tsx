"use client"

import * as React from "react"
import useSWR from "swr"
import { SiteHeader } from "@/components/site-header"
import { Colleges } from "../colleges/columns"
import { Programs } from "../programs/columns"
import { Students } from "../students/columns"
import userData from "@/app/(default)/miscellaneous/user-data.json"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/interactive-chart"
import { toast } from "sonner"

export default function DashboardPage() {
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

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
        />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </>
  )
}
"use client"

import * as React from "react"
import useSWR from "swr"
import { SiteHeader } from "@/components/site-header"
import { Colleges } from "../colleges/columns"
import { Programs } from "../programs/columns"
import { Students } from "../students/columns"
import { Miscellaneous } from "../miscellaneous/columns"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/interactive-chart"
import { toast } from "sonner"

export default function DashboardPage() {
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
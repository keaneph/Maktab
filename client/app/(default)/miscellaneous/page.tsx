"use client"

import * as React from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { authFetch } from "@/lib/api"
import { toast } from "sonner"
import { SiteHeader } from "@/components/layout/site-header"
import { columns, Miscellaneous } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { Colleges } from "../colleges/columns"
import { Programs } from "../programs/columns"
import { Students } from "../students/columns"
import { SectionCards } from "@/components/data/section-cards"

export default function MiscellaneousPage() {
  const { data: collegeData = [], error: collegesErr } = useSWR<
    Colleges[],
    Error
  >("http://localhost:8080/api/colleges/")
  const { data: programData = [], error: programsErr } = useSWR<
    Programs[],
    Error
  >("http://localhost:8080/api/programs/")
  const { data: studentData = [], error: studentsErr } = useSWR<
    Students[],
    Error
  >("http://localhost:8080/api/students/")
  const { data: userData = [], error: userErr } = useSWR<
    Miscellaneous[],
    Error
  >("http://localhost:8080/api/users/")

  React.useEffect(() => {
    if (collegesErr)
      toast.error(`Error fetching colleges: ${collegesErr.message}`)
  }, [collegesErr])
  React.useEffect(() => {
    if (programsErr)
      toast.error(`Error fetching programs: ${programsErr.message}`)
  }, [programsErr])
  React.useEffect(() => {
    if (studentsErr)
      toast.error(`Error fetching students: ${studentsErr.message}`)
  }, [studentsErr])
  React.useEffect(() => {
    if (userErr) toast.error(`Error fetching users: ${userErr.message}`)
  }, [userErr])

  async function handleDelete(username: string) {
    await globalMutate(
      "http://localhost:8080/api/users/",
      async (current: Miscellaneous[] = []) => {
        const res = await authFetch(
          `http://localhost:8080/api/users/${username}`,
          { method: "DELETE" }
        )
        if (!res.ok) throw new Error("Failed to delete user")
        await res.json()
        return current.filter((u: Miscellaneous) => u.username !== username)
      },
      {
        revalidate: false,
        optimisticData: (current?: Miscellaneous[]) =>
          (current ?? []).filter((u: Miscellaneous) => u.username !== username),
        rollbackOnError: true,
      }
    )
    toast.success("User deleted successfully")
  }

  async function handleBulkDelete(usernames: string[]) {
    const setUsers = new Set(usernames)
    await globalMutate(
      "http://localhost:8080/api/users/",
      async (current: Miscellaneous[] = []) => {
        await Promise.all(
          usernames.map((u) =>
            authFetch(`http://localhost:8080/api/users/${u}`, {
              method: "DELETE",
            })
          )
        )
        return current.filter((u: Miscellaneous) => !setUsers.has(u.username))
      },
      {
        revalidate: false,
        optimisticData: (current?: Miscellaneous[]) =>
          (current ?? []).filter(
            (u: Miscellaneous) => !setUsers.has(u.username)
          ),
        rollbackOnError: true,
      }
    )
    toast.success(`${usernames.length} user(s) deleted successfully`)
  }

  return (
    <>
      <SiteHeader title="Miscellaneous" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="miscellaneous"
        />
        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns(handleDelete, handleBulkDelete)}
            data={userData}
            searchPlaceholder="Search users..."
            searchKeys={["username", "email", "dateLogged"]}
            hideAddButton
          />
        </div>
      </div>
    </>
  )
}

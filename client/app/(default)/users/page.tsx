"use client"

import React from "react"
import { toast } from "sonner"
import { SiteHeader } from "@/components/layout/site-header"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { Users, columns } from "./columns"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { getUsers } from "@/lib/user-service"

export default function UsersPage() {
  const [userData, setUserData] = React.useState<Users[]>([])
  const hasLoaded = React.useRef(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!hasLoaded.current) {
      loadUsers({ showSkeleton: true })
      hasLoaded.current = true
    }
  }, [])

  async function loadUsers(options: { showSkeleton?: boolean } = {}) {
    const { showSkeleton = false } = options
    if (showSkeleton) setIsLoading(true)
    try {
      const data = await getUsers()
      setUserData(data)
    } catch (err) {
      toast.error(`Error fetching users: ${(err as Error).message}`)
    } finally {
      if (showSkeleton) {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <SiteHeader title="Users" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="users" />
        <div className="px-4 lg:px-6">
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : (
            <DataTable
              columns={columns}
              data={userData}
              searchKeys={["email"]}
              searchPlaceholder="Search users..."
              hideAddButton
            />
          )}
        </div>
      </div>
    </>
  )
}

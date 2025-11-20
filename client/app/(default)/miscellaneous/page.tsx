"use client"

import React from "react"
import { toast } from "sonner"
import { SiteHeader } from "@/components/layout/site-header"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { useCounts } from "@/components/data/counts-context"
import { Miscellaneous, columns } from "./columns"
import { TableSkeleton } from "@/components/data/table-skeleton"

import {
  getUsers,
  deleteUser,
  bulkDeleteUsers,
} from "@/lib/miscellaneous-service"

export default function MiscellaneousPage() {
  const [userData, setUserData] = React.useState<Miscellaneous[]>([])
  const { refreshCounts } = useCounts()
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

  async function refresh() {
    await loadUsers()
    await refreshCounts()
  }

  const handleDelete = async (email: string) => {
    try {
      await deleteUser(email)
      await refresh()
      toast.success("User deleted successfully")
    } catch (err) {
      toast.error(`Failed to delete user: ${(err as Error).message}`)
      throw err
    }
  }

  const handleBulkDelete = async (email: string[]) => {
    try {
      await bulkDeleteUsers(email)
      await refresh()
      toast.success(`${email.length} user(s) deleted successfully`)
    } catch (err) {
      toast.error(`Failed to delete users: ${(err as Error).message}`)
      throw err
    }
  }

  return (
    <>
      <SiteHeader title="Users" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="miscellaneous" />
        <div className="px-4 lg:px-6">
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : (
            <DataTable
              columns={columns(handleDelete, handleBulkDelete)}
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

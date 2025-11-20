"use client"

import React from "react"
import { toast } from "sonner"
import { SiteHeader } from "@/components/layout/site-header"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { useCounts } from "@/components/data/counts-context"
import { Miscellaneous, columns } from "./columns"

import {
  getUsers,
  deleteUser,
  bulkDeleteUsers,
} from "@/lib/miscellaneous-service"

export default function MiscellaneousPage() {
  const [userData, setUserData] = React.useState<Miscellaneous[]>([])
  const { refreshCounts } = useCounts()
  const hasLoaded = React.useRef(false)

  React.useEffect(() => {
    if (!hasLoaded.current) {
      loadUsers()
      hasLoaded.current = true
    }
  }, [])

  async function loadUsers() {
    try {
      const data = await getUsers()
      setUserData(data)
    } catch (err) {
      toast.error(`Error fetching users: ${(err as Error).message}`)
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
    }
  }

  const handleBulkDelete = async (email: string[]) => {
    try {
      await bulkDeleteUsers(email)
      await refresh()
      toast.success(`${email.length} user(s) deleted successfully`)
    } catch (err) {
      toast.error(`Failed to delete users: ${(err as Error).message}`)
    }
  }

  return (
    <>
      <SiteHeader title="Users" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="miscellaneous" />
        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns(handleDelete, handleBulkDelete)}
            data={userData}
            searchKeys={["email"]}
            searchPlaceholder="Search users..."
            hideAddButton
          />
        </div>
      </div>
    </>
  )
}

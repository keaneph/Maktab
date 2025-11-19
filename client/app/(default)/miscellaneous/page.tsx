"use client"

import * as React from "react"
import { authFetch } from "@/lib/api"
import { toast } from "sonner"
import { SiteHeader } from "@/components/layout/site-header"
import { columns, Miscellaneous } from "./columns"
import { DataTable } from "@/components/data/data-table"
import { SectionCards } from "@/components/data/section-cards"
import { useCounts } from "@/components/data/counts-context"

export default function MiscellaneousPage() {
  const [userData, setUserData] = React.useState<Miscellaneous[]>([])
  const { refreshCounts } = useCounts()

  const fetchUsers = React.useCallback(async (init?: RequestInit) => {
    const res = await fetch("http://localhost:8080/api/users/", init)
    if (!res.ok) {
      const message = await res.text().catch(() => "")
      throw new Error(message || "Failed to fetch users")
    }
    return (await res.json()) as Miscellaneous[]
  }, [])

  // Fetch only what we need: users (for table)
  React.useEffect(() => {
    const abortController = new AbortController()
    
    async function fetchData() {
      try {
        const users = await fetchUsers({
          signal: abortController.signal,
        })
        if (!abortController.signal.aborted) {
          setUserData(users)
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        const err = error as Error
        toast.error(`Error fetching data: ${err.message}`)
      }
    }
    fetchData()
    
    return () => {
      abortController.abort()
    }
  }, [])

  // Refetch function
  const refetchData = React.useCallback(async () => {
    try {
      const users = await fetchUsers()
      setUserData(users)
      // Refresh counts after data changes
      await refreshCounts()
    } catch (error) {
      const err = error as Error
      toast.error(`Error fetching data: ${err.message}`)
    }
  }, [refreshCounts])

  async function handleDelete(username: string) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/users/${username}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed to delete user")
      await refetchData()
      toast.success("User deleted successfully")
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete user: ${err.message}`)
      throw error
    }
  }

  async function handleBulkDelete(usernames: string[]) {
    try {
      await Promise.all(
        usernames.map((u) =>
          authFetch(`http://localhost:8080/api/users/${u}`, {
            method: "DELETE",
          })
        )
      )
      await refetchData()
      toast.success(`${usernames.length} user(s) deleted successfully`)
    } catch (error) {
      const err = error as Error
      toast.error(`Failed to delete users: ${err.message}`)
      throw error
    }
  }

  return (
    <>
      <SiteHeader title="Miscellaneous" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards active="miscellaneous" />
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

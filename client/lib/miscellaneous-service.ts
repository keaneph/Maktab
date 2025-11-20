import { authFetch } from "@/lib/api"
import { apiUrl } from "@/lib/config"

export interface MiscUser {
  email: string
}

const BASE_URL = `${apiUrl("/api/users")}/`

export async function getUsers(): Promise<MiscUser[]> {
  const res = await fetch(`${BASE_URL}`)
  if (!res.ok) throw new Error("Failed to fetch users")
  return await res.json()
}

export async function deleteUser(email: string) {
  const res = await authFetch(`${BASE_URL}${encodeURIComponent(email)}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete user")
}

export async function bulkDeleteUsers(email: string[]) {
  await Promise.all(email.map((u) => deleteUser(u)))
}

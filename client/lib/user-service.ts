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

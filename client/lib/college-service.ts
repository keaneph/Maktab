import { authFetch } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { Colleges } from "@/app/(default)/colleges/columns"

const BASE_URL = `${apiUrl("/api/colleges")}/`

export async function getColleges(): Promise<Colleges[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to fetch colleges")
  }
  return res.json()
}

export async function addCollege(data: { code: string; name: string }) {
  const res = await authFetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to add college")
  }
}

export async function editCollege(
  oldCode: string,
  data: { code: string; name: string }
) {
  const res = await authFetch(`${BASE_URL}${oldCode}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to update college")
  }
}

export async function deleteCollege(code: string) {
  const res = await authFetch(`${BASE_URL}${code}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to delete college")
  }
}

export async function bulkDeleteColleges(codes: string[]) {
  const res = await authFetch(`${apiUrl("/api/colleges/bulk-delete")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codes }),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to bulk delete colleges")
  }
}

import { authFetch } from "@/lib/api"
import { Colleges } from "@/app/(default)/colleges/columns"

const BASE_URL = "http://localhost:8080/api/colleges/"

export async function getColleges(): Promise<Colleges[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error("Failed to fetch colleges")
  return await res.json()
}

export async function addCollege(data: { code: string; name: string }) {
  const res = await authFetch(`${BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to add college")
}

export async function editCollege(
  oldCode: string,
  data: { code: string; name: string }
) {
  const res = await authFetch(`${BASE_URL}${oldCode}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update college")
}

export async function deleteCollege(code: string) {
  const res = await authFetch(`${BASE_URL}${code}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete college")
}

export async function bulkDeleteColleges(codes: string[]) {
  await Promise.all(codes.map((c) => deleteCollege(c)))
}

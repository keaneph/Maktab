import { authFetch } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { Programs } from "@/app/(default)/programs/columns"

const BASE_URL = `${apiUrl("/api/programs")}/`

export async function getPrograms(): Promise<Programs[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to fetch programs")
  }
  return res.json()
}

export async function addProgram(data: {
  code: string
  name: string
  college_code: string
}) {
  const res = await authFetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to add program")
  }
}

export async function updateProgram(
  oldCode: string,
  data: { code: string; name: string; college_code: string }
) {
  const res = await authFetch(`${BASE_URL}${oldCode}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to update program")
  }
}

export async function deleteProgram(code: string) {
  const res = await authFetch(`${BASE_URL}${code}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to delete program")
  }
}

export async function bulkDeletePrograms(codes: string[]) {
  const res = await authFetch(`${apiUrl("/api/programs/bulk-delete")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codes }),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to bulk delete programs")
  }
}

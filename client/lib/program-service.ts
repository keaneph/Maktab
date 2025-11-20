import { authFetch } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { Programs } from "@/app/(default)/programs/columns"

const BASE_URL = `${apiUrl("/api/programs")}/`

export async function getPrograms(): Promise<Programs[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error("Failed to fetch programs")
  return await res.json()
}

export async function addProgram(data: {
  code: string
  name: string
  college_code: string
}) {
  const res = await authFetch(`${BASE_URL}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to add program")
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
  if (!res.ok) throw new Error("Failed to update program")
}

export async function deleteProgram(code: string) {
  const res = await authFetch(`${BASE_URL}${code}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete program")
}

export async function bulkDeletePrograms(codes: string[]) {
  await Promise.all(codes.map((c) => deleteProgram(c)))
}

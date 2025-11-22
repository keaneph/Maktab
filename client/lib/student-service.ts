import { authFetch } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { Students } from "@/app/(default)/students/columns"

const BASE_URL = `${apiUrl("/api/students")}/`

export async function getStudents(): Promise<Students[]> {
  const res = await fetch(`${BASE_URL}`)
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to fetch students")
  }
  return res.json()
}

export async function addStudent(values: {
  idNo: string
  firstName: string
  lastName: string
  course: string
  year: string
  gender: string
  photo_path?: string
}) {
  const payload = { ...values, year: parseInt(values.year) }

  const res = await authFetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to add student")
  }
}

export async function editStudent(
  oldIdNo: string,
  values: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
    photo_path?: string
  }
) {
  const payload = { ...values, year: parseInt(values.year) }

  const res = await authFetch(`${BASE_URL}${oldIdNo}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to update student")
  }
}

export async function deleteStudent(idNo: string) {
  const res = await authFetch(`${BASE_URL}${idNo}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to delete student")
  }
}

export async function bulkDeleteStudents(ids: string[]) {
  const res = await authFetch(`${apiUrl("/api/students/bulk-delete")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to bulk delete students")
  }
}

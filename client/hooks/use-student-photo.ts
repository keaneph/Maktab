import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"

/**
 * Hook to fetch and manage student photo URLs from Supabase storage
 * @param photoPath - The path to the photo in Supabase storage
 * @returns The public URL of the photo or null if no path provided
 */
export function useStudentPhoto(photoPath?: string | null) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!photoPath) {
      setPhotoUrl(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data } = supabase.storage
        .from("student-photos")
        .getPublicUrl(photoPath)

      setPhotoUrl(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load photo"))
      setPhotoUrl(null)
    } finally {
      setIsLoading(false)
    }
  }, [photoPath])

  return { photoUrl, isLoading, error }
}

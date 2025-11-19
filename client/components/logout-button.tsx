'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { clearTokenCache } from '@/lib/api'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearTokenCache()
    router.push('/auth/login')
  }

  return <Button onClick={logout}>Logout</Button>
}

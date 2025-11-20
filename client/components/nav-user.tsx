"use client"

import { useEffect, useState, useTransition } from "react"
import { ChevronsUpDown, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { clearTokenCache } from "@/lib/api"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [userInfo, setUserInfo] = useState({
    email: "",
    avatar: "",
  })

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getClaims()

      // Claims structure example:
      // data.claims.email
      // data.claims.user_metadata.full_name
      // data.claims.user_metadata.avatar_url

      if (data?.claims) {
        setUserInfo({
          email: data.claims.email || "",
          avatar: data.claims.user_metadata?.avatar_url || "",
        })
      }
    }

    loadUser()
  }, [])

  const avatarSrc =
    userInfo.avatar && userInfo.avatar.trim().length > 0
      ? userInfo.avatar
      : "/ent.jpg"

  const logout = async () => {
    if (isLoggingOut) return // Prevent double-clicks

    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      clearTokenCache()
      startTransition(() => {
        router.push("/auth/login")
        router.refresh()
      })
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="rounded-lg">MT</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs">{userInfo.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback className="rounded-lg">MT</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs">{userInfo.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={logout}
              disabled={isLoggingOut}
            >
              <LogOut />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

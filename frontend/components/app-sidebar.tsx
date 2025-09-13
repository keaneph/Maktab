"use client"

import Link from "next/link"

import { usePathname } from "next/navigation"

import { 
  TreePalm, 
  Home, 
  School, 
  GraduationCap, 
  User, 
  Settings,  
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Colleges",
    url: "/colleges",
    icon: School,
  },
  {
    title: "Programs",
    url: "/programs",
    icon: GraduationCap,
  },
  {
    title: "Students",
    url: "/students",
    icon: User,
  },
  {
    title: "Miscellaneous",
    url: "/miscellaneous",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
            asChild 
            className="flex items-center gap-2 peer-data-[active=true]/menu-button:opacity-100">
              <Link href={items[0].url}>
                <TreePalm className="!size-5" />
                  <span className="text-base font-semibold">Maktab</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
                {items.map((item) => {
                  const isActive = pathname.startsWith(item.url) // highlight current
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
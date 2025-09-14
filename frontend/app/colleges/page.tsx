import { columns } from "./columns"
import { DataTable } from "./datatable"
import collegeData from "./college-data.json"
import programData from "@/app/programs/program-data.json"
import studentData from "@/app/students/student-data.json"
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header"; 
import { cookies } from "next/headers";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { SectionCards } from "@/components/section-cards";

export default async function CollegesPage() {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider 
        defaultOpen={defaultOpen}
        style={
            {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
        }>
        <AppSidebar variant="inset"/>
        <SidebarInset>
            <SiteHeader title="Colleges"/>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <SectionCards 
                  collegeCount={collegeData.length} 
                  programCount={programData.length}
                  studentCount={studentData.length}
                 />
                <div className="px-4 lg:px-6">
                  <DataTable columns={columns} data={collegeData} />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
    </SidebarProvider>
  )
}
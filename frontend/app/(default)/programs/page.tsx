import { SiteHeader } from "@/components/site-header";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import collegeData from "@/app/(default)/colleges/college-data.json";
import programData from "@/app/(default)/programs/program-data.json";
import studentData from "@/app/(default)/students/student-data.json";
import { SectionCards } from "@/components/section-cards";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProgramsPage() {
  return (
    <>
      <SiteHeader title="Programs" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
        />
        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns}
            data={programData}
            searchPlaceholder="Search programs..."
            addTitle="Add Program"
            addDescription="Add a new program to the list."
            searchKeys={["code", "name", "college", "dateCreated", "addedBy"]}
            renderAddForm={
              <>
                <div className="grid gap-3">
                  <Label htmlFor="program-code-1">Code</Label>
                  <Input
                    id="program-code-1"
                    name="program-code"
                    defaultValue=""
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="program-name-1">Name</Label>
                  <Input
                    id="program-name-1"
                    name="program-name"
                    defaultValue=""
                  />
                </div>
              </>
            }
          />
        </div>
      </div>
    </>
  );
}

import { SiteHeader } from "@/components/site-header";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import collegeData from "@/app/(default)/colleges/college-data.json";
import programData from "@/app/(default)/programs/program-data.json";
import studentData from "@/app/(default)/students/student-data.json";
import { SectionCards } from "@/components/section-cards";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CollegesPage() {
  return (
    <>
      <SiteHeader title="Colleges" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
        />
        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns}
            data={collegeData}
            searchPlaceholder="Search colleges..."
            addTitle="Add College"
            addDescription="Add a new college to the list."
            renderAddForm={
              <>
                <div className="grid gap-3">
                  <Label htmlFor="college-code-1">Code</Label>
                  <Input
                    id="college-code-1"
                    name="college-code"
                    defaultValue=""
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="college-name-1">Name</Label>
                  <Input
                    id="college-name-1"
                    name="college-name"
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

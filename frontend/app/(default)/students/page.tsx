import { SiteHeader } from "@/components/site-header";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import collegeData from "@/app/(default)/colleges/college-data.json";
import programData from "@/app/(default)/programs/program-data.json";
import studentData from "@/app/(default)/students/student-data.json";
import userData from "@/app/(default)/miscellaneous/user-data.json";
import { SectionCards } from "@/components/section-cards";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function StudentsPage() {
  return (
    <>
      <SiteHeader title="Students" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="student"
        />
        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns}
            data={studentData}
            searchPlaceholder="Search students..."
            addTitle="Add Student"
            addDescription="Add a new student to the list."
            searchKeys={["id_no", "first_name", "last_name", "course", "year", "gender", "dateCreated", "addedBy"]}
            renderAddForm={
              <>
                <div className="grid gap-3">
                  <Label htmlFor="student-id-1">ID</Label>
                  <Input
                    id="student-id-1"
                    name="student-id"
                    defaultValue=""
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="student-name-1">Name</Label>
                  <Input
                    id="student-name-1"
                    name="student-name"
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

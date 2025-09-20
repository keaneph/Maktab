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

export default function MiscellaneousPage() {
  return (
    <>
      <SiteHeader title="Miscellaneous" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="miscellaneous"
        />
        <div className="px-4 lg:px-6">
          <DataTable
            columns={columns}
            data={userData}
            searchPlaceholder="Search users..."
            addTitle="Add User"
            addDescription="Add a new user to the list."
            searchKeys={["user", "email", "password", "dateLogged"]}
            renderAddForm={
              <>
                <div className="grid gap-3">
                  <Label htmlFor="user-user-1">User</Label>
                  <Input
                    id="user-user-1"
                    name="user-user"
                    defaultValue=""
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="user-password-1">Password</Label>
                  <Input
                    id="user-password-1"
                    name="user-password"
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

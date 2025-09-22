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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
                  <Label htmlFor="student-idnumber">ID Number</Label>
                  <Input
                    id="student-idnumber"
                    name="student-idnumber"
                    defaultValue=""
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="student-firstname">First Name</Label>
                  <Input
                    id="student-firstname"
                    name="student-firstname"
                    defaultValue=""
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="student-lastname">Last Name</Label>
                  <Input
                    id="student-lastname"
                    name="student-lastname"
                    defaultValue=""
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="program-select">Course / Program</Label>
                  <Select name="program">
                    <SelectTrigger id="program-select">
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programData.map((program, index) => (
                        <SelectItem
                          key={`${program.code}-${index}`}
                          value={program.code} // store program code
                        >
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="student-year">Year</Label>
                  <Select name="year">
                    <SelectTrigger id="year-select">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="gender-select">Gender</Label>
                  <Select name="gender">
                    <SelectTrigger id="gender-select">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            }
          />
        </div>
      </div>
    </>
  );
}

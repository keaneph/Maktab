import { SiteHeader } from "@/components/site-header";
import collegeData from "@/app/(default)/colleges/college-data.json";
import programData from "@/app/(default)/programs/program-data.json";
import studentData from "@/app/(default)/students/student-data.json";
import { SectionCards } from "@/components/section-cards";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
        />
      </div>
    </>
  );
}

import { SiteHeader } from "@/components/site-header";

export default function StudentPage() {
  return (
    <>
      <SiteHeader title="Students" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          {/* Students data table goes here */}
        </div>
      </div>
    </>
  );
}

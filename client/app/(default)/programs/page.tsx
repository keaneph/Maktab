"use client";

import * as React from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { SiteHeader } from "@/components/site-header";
import { Colleges } from "../colleges/columns";
import { Programs, columns } from "./columns";
import { Students } from "../students/columns";
import { Miscellaneous } from "../miscellaneous/columns";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { ProgramForm } from "@/components/program-form";
import { toast } from "sonner";

export default function ProgramsPage() {
  const { data: collegeData = [], error: collegesErr } = useSWR<
    Colleges[],
    Error
  >("http://localhost:8080/api/colleges/");
  const { data: programData = [], error: programsErr } = useSWR<
    Programs[],
    Error
  >("http://localhost:8080/api/programs/");
  const { data: studentData = [], error: studentsErr } = useSWR<
    Students[],
    Error
  >("http://localhost:8080/api/students/");
  const { data: userData = [], error: userErr } = useSWR<
    Miscellaneous[],
    Error
  >("http://localhost:8080/api/users/");
  React.useEffect(() => {
    if (collegesErr)
      toast.error(`Error fetching colleges: ${collegesErr.message}`);
  }, [collegesErr]);
  React.useEffect(() => {
    if (programsErr)
      toast.error(`Error fetching programs: ${programsErr.message}`);
  }, [programsErr]);
  React.useEffect(() => {
    if (studentsErr)
      toast.error(`Error fetching students: ${studentsErr.message}`);
  }, [studentsErr]);
  React.useEffect(() => {
    if (userErr) toast.error(`Error fetching users: ${userErr.message}`);
  }, [userErr]);

  async function handleAdd(values: {
    code: string;
    name: string;
    college_code: string;
  }) {
    const newItem: Programs = {
      ...values,
    };
    await globalMutate(
      "http://localhost:8080/api/programs/",
      async (current: Programs[] = []) => {
        const res = await fetch("http://localhost:8080/api/programs/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code: newItem.code,
            name: newItem.name,
            college_code: newItem.college_code,
          }),
        });
        const created = await res.json();
        return [...current, created];
      },
      {
        revalidate: false,
        optimisticData: (current?: Programs[]) => [...(current ?? []), newItem],
        rollbackOnError: true,
      }
    );
    toast.success("Program added successfully!");
  }

  async function handleEdit(
    oldCode: string,
    data: { code: string; name: string; college_code: string }
  ) {
    const payload = { ...data };
    await globalMutate(
      "http://localhost:8080/api/programs/",
      async (current: Programs[] = []) => {
        const res = await fetch(
          `http://localhost:8080/api/programs/${oldCode}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Failed to update program");
        const updated = await res.json();
        return current.map((p: Programs) => (p.code === oldCode ? updated : p));
      },
      {
        revalidate: false,
        optimisticData: (current?: Programs[]) =>
          (current ?? []).map((p: Programs) =>
            p.code === oldCode ? ({ ...p, ...payload } as Programs) : p
          ),
        rollbackOnError: true,
      }
    );
    toast.success("Program updated successfully!");
  }

  async function handleDelete(code: string) {
    await globalMutate(
      "http://localhost:8080/api/programs/",
      async (current: Programs[] = []) => {
        const res = await fetch(`http://localhost:8080/api/programs/${code}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete program");
        await res.json();
        return current.filter((p: Programs) => p.code !== code);
      },
      {
        revalidate: false,
        optimisticData: (current?: Programs[]) =>
          (current ?? []).filter((p: Programs) => p.code !== code),
        rollbackOnError: true,
      }
    );
    toast.success("Program deleted successfully!");
  }

  async function handleBulkDelete(codes: string[]) {
    const setCodes = new Set(codes);
    await globalMutate(
      "http://localhost:8080/api/programs/",
      async (current: Programs[] = []) => {
        await Promise.all(
          codes.map((code) =>
            fetch(`http://localhost:8080/api/programs/${code}`, {
              method: "DELETE",
              credentials: "include",
            })
          )
        );
        return current.filter((p: Programs) => !setCodes.has(p.code));
      },
      {
        revalidate: false,
        optimisticData: (current?: Programs[]) =>
          (current ?? []).filter((p: Programs) => !setCodes.has(p.code)),
        rollbackOnError: true,
      }
    );
    toast.success(`${codes.length} program(s) deleted successfully!`);
  }
  return (
    <>
      <SiteHeader title="Programs" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          collegeCount={collegeData.length}
          programCount={programData.length}
          studentCount={studentData.length}
          userCount={userData.length}
          active="program"
        />
        <div className="px-4 lg:px-6">
          <DataTable<
            Programs,
            unknown,
            Pick<Programs, "code" | "name" | "college_code">
          >
            columns={columns(
              handleDelete,
              handleEdit,
              collegeData.map((c: Colleges) => ({
                code: c.code,
                name: c.name,
              })),
              programData.map((p: Programs) => p.code.toUpperCase()),
              handleBulkDelete
            )}
            data={programData}
            searchPlaceholder="Search programs..."
            addTitle="Add Program"
            addDescription="Add a new program to the list."
            addFormId="program-form"
            searchKeys={["code", "name", "college_code"]}
            renderAddForm={({ onSuccess, onValidityChange }) => (
              <ProgramForm
                onSubmit={handleAdd}
                existingCodes={programData.map((p: Programs) =>
                  p.code.toUpperCase()
                )}
                colleges={collegeData.map((c: Colleges) => ({
                  code: c.code,
                  name: c.name,
                }))}
                onSuccess={onSuccess}
                onValidityChange={onValidityChange}
              />
            )}
          />
        </div>
      </div>
    </>
  );
}

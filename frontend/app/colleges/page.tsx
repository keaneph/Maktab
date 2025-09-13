import { columns, Colleges } from "./columns"
import { DataTable } from "./datatable"


async function getData(): Promise<Colleges[]> {
  return [
    {
      code: "CS101",
      name: "Computer Science 101",
    },
    {
      code: "MATH102",
      name: "Mathematics 101",
    },
    {
      code: "MATH103",
      name: "Mathematics 101",
    },
    {
      code: "MATH104",
      name: "Mathematics 101",
    },
    {
      code: "MATH105",
      name: "Mathematics 101",
    },
    {
      code: "MATH106",
      name: "Mathematics 101",
    },
    {
      code: "MATH107",
      name: "Mathematics 101",
    },
    {
      code: "MATH108",
      name: "Mathematics 101",
    },
    {
      code: "MATH109",
      name: "Mathematics 101",
    },
    {
      code: "MATH110",
      name: "Mathematics 101",
    },
    {
      code: "MATH111",
      name: "Mathematics 101",
    },
    {
      code: "MATH112",
      name: "Mathematics 101",
    },

    {
      code: "MATH113",
      name: "Mathematics 101",
    },
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto p-4 py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
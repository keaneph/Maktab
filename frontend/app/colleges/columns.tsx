"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Colleges = {
  code: string
  name: string
}

export const columns: ColumnDef<Colleges>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const college = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(college.code)}
            >
              Copy college code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit college</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
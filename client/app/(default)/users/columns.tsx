"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Users = {
  email: string
}

function ActionsCell({ user }: { user: Users }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(user.email)}
        >
          Copy user email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// main column definition
export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
]

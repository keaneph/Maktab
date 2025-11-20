"use client"

import { ColumnDef, Table } from "@tanstack/react-table"
import { ArrowUpDown, Loader2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Miscellaneous = {
  email: string
}

// local component for confirming deletion
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  email,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  email: string
}) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await onConfirm?.()
      onClose()
    } catch {
      // handled upstream
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <b>{email}</b>? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// component for rendering dropdown + dialog safely with useState (mirrors Colleges)
// confirmation dialog for bulk delete
function BulkDeleteDialog({
  open,
  onClose,
  onConfirm,
  count,
  noun,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  count: number
  noun: string
}) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleBulkDelete() {
    try {
      setIsDeleting(true)
      await onConfirm?.()
      onClose()
    } catch {
      // handled upstream
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete {noun}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} {noun.toLowerCase()}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={isDeleting}
            onClick={handleBulkDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ActionsCell({
  user,
  onDelete,
  onBulkDelete,
  table,
}: {
  user: Miscellaneous
  onDelete?: (email: string) => void
  onBulkDelete?: (email: string[]) => void
  table: Table<Miscellaneous>
}) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isBulkOpen, setIsBulkOpen] = React.useState(false)
  const [pendingEmails, setPendingEmails] = React.useState<string[]>([])
  return (
    <>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const selected = table.getFilteredSelectedRowModel().rows
              if (selected.length > 0) {
                const email = selected.map((r) => r.original.email)
                setPendingEmails(email)
                setIsBulkOpen(true)
              } else {
                setIsDeleteOpen(true)
              }
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        email={user.email}
        onConfirm={() => onDelete?.(user.email)}
      />
      <BulkDeleteDialog
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        count={pendingEmails.length}
        noun="Users"
        onConfirm={async () => {
          if (pendingEmails.length === 0) return
          if (onBulkDelete) {
            await onBulkDelete(pendingEmails)
          } else {
            await Promise.all(pendingEmails.map((u) => onDelete?.(u)))
          }
          table.resetRowSelection()
          setPendingEmails([])
        }}
      />
    </>
  )
}

// main column definition
export const columns = (
  onDelete?: (email: string) => void,
  onBulkDelete?: (email: string[]) => void
): ColumnDef<Miscellaneous>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
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
    cell: ({ row, table }) => (
      <ActionsCell
        user={row.original}
        onDelete={onDelete}
        onBulkDelete={onBulkDelete}
        table={table}
      />
    ),
  },
]

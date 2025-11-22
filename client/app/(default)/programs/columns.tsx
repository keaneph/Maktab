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
import { ProgramForm } from "@/components/forms/program-form"

export type Programs = {
  code: string
  name: string
  college_code: string
}

function DeleteDialog({
  open,
  onClose,
  onConfirm,
  programName,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  programName: string
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
          <DialogTitle>Delete Program</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <b>{programName}</b>? This action
            cannot be undone.
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

// local component for editing program
function EditDialog({
  open,
  onClose,
  onConfirm,
  program,
  colleges,
  existingCodes = [],
}: {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    code: string
    name: string
    college_code: string
  }) => void
  program: Programs
  colleges: Array<{ code: string; name: string }>
  existingCodes?: string[]
}) {
  const [isFormValid, setIsFormValid] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(values: {
    code: string
    name: string
    college_code: string
  }) {
    try {
      await onConfirm(values)
      onClose()
    } catch {
      // Error handling is done in the parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
          <DialogDescription>Update the program information.</DialogDescription>
        </DialogHeader>

        <ProgramForm
          onSubmit={handleSubmit}
          existingCodes={existingCodes}
          colleges={colleges}
          onValidityChange={setIsFormValid}
          defaultValues={{
            code: program.code,
            name: program.name,
            college_code: program.college_code,
          }}
          onSubmittingChange={setIsSubmitting}
        />

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="program-form"
            disabled={!isFormValid || isSubmitting}
            className={
              !isFormValid || isSubmitting
                ? "bg-gray-400 hover:bg-gray-400"
                : "cursor-pointer"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// bulk confirmation dialog
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
  program,
  onDelete,
  onEdit,
  colleges,
  existingCodes = [],
  onBulkDelete,
  table,
}: {
  program: Programs
  onDelete?: (code: string) => void
  onEdit?: (
    oldCode: string,
    data: { code: string; name: string; college_code: string }
  ) => void
  colleges: Array<{ code: string; name: string }>
  existingCodes?: string[]
  onBulkDelete?: (codes: string[]) => void
  table: Table<Programs>
}) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isBulkOpen, setIsBulkOpen] = React.useState(false)
  const [pendingCodes, setPendingCodes] = React.useState<string[]>([])
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigator.clipboard.writeText(program.code)}
          >
            Copy program code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsEditOpen(true)}
          >
            Edit program
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              const selected = table.getFilteredSelectedRowModel().rows
              if (selected.length > 0) {
                const codes = selected.map((r) => r.original.code)
                setPendingCodes(codes)
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

      <EditDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        program={program}
        colleges={colleges}
        existingCodes={existingCodes}
        onConfirm={async (data) => {
          await onEdit?.(program.code, data)
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        programName={program.name}
        onConfirm={() => onDelete?.(program.code)}
      />
      <BulkDeleteDialog
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        count={pendingCodes.length}
        noun="Programs"
        onConfirm={async () => {
          if (pendingCodes.length === 0) return
          if (onBulkDelete) {
            await onBulkDelete(pendingCodes)
          } else {
            await Promise.all(pendingCodes.map((c) => onDelete?.(c)))
          }
          table.resetRowSelection()
          setPendingCodes([])
        }}
      />
    </>
  )
}

export const columns = (
  onDelete?: (code: string) => void,
  onEdit?: (
    oldCode: string,
    data: { code: string; name: string; college_code: string }
  ) => void,
  colleges: Array<{ code: string; name: string }> = [],
  existingCodes: string[] = [],
  onBulkDelete?: (codes: string[]) => void
): ColumnDef<Programs>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="cursor-pointer"
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
        className="cursor-pointer"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "college_code",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          College Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => (
      <ActionsCell
        program={row.original}
        onDelete={onDelete}
        onEdit={onEdit}
        colleges={colleges}
        existingCodes={existingCodes}
        onBulkDelete={onBulkDelete}
        table={table}
      />
    ),
  },
]

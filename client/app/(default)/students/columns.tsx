"use client"

import { ColumnDef, Table } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"
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
import { StudentForm } from "@/components/forms/student-form"

export type Students = {
  idNo: string
  firstName: string
  lastName: string
  course: string
  year: number
  gender: string
}

// local component for confirming deletion
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  studentName,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  studentName: string
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <b>{studentName}</b>? This action
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
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// local component for editing student
function EditDialog({
  open,
  onClose,
  onConfirm,
  student,
  programs,
  existingIds = [],
}: {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
  }) => void
  student: Students
  programs: Array<{ code: string; name: string }>
  existingIds?: string[]
}) {
  const [isFormValid, setIsFormValid] = React.useState(false)

  async function handleSubmit(values: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
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
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update the student information.</DialogDescription>
        </DialogHeader>

        <StudentForm
          onSubmit={handleSubmit}
          existingIds={existingIds}
          programs={programs}
          onSuccess={onClose}
          onValidityChange={setIsFormValid}
          defaultValues={{
            idNo: student.idNo,
            firstName: student.firstName,
            lastName: student.lastName,
            course: student.course,
            year: student.year.toString(),
            gender: student.gender,
          }}
        />

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="student-form"
            disabled={!isFormValid}
            className={
              !isFormValid ? "bg-gray-400 hover:bg-gray-400" : "cursor-pointer"
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// component for rendering dropdown + dialog safely with useState
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
  onConfirm: () => void
  count: number
  noun: string
}) {
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
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ActionsCell({
  student,
  onDelete,
  onEdit,
  programs,
  existingIds = [],
  onBulkDelete,
  table,
}: {
  student: Students
  onDelete?: (idNo: string) => void
  onEdit?: (
    oldId: string,
    data: {
      idNo: string
      firstName: string
      lastName: string
      course: string
      year: string
      gender: string
    }
  ) => void
  programs: Array<{ code: string; name: string }>
  existingIds?: string[]
  onBulkDelete?: (ids: string[]) => void
  table: Table<Students>
}) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isBulkOpen, setIsBulkOpen] = React.useState(false)
  const [pendingIds, setPendingIds] = React.useState<string[]>([])

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
            onClick={() => navigator.clipboard.writeText(student.idNo)}
          >
            Copy student ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            Edit student
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const selected = table.getFilteredSelectedRowModel().rows
              if (selected.length > 0) {
                const ids = selected.map((r) => r.original.idNo)
                setPendingIds(ids)
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
        student={student}
        programs={programs}
        existingIds={existingIds}
        onConfirm={(data) => {
          onEdit?.(student.idNo, data)
          setIsEditOpen(false)
        }}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        studentName={`${student.firstName} ${student.lastName}`}
        onConfirm={() => onDelete?.(student.idNo)}
      />
      <BulkDeleteDialog
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        count={pendingIds.length}
        noun="Students"
        onConfirm={async () => {
          if (pendingIds.length === 0) return
          if (onBulkDelete) {
            await onBulkDelete(pendingIds)
          } else {
            await Promise.all(pendingIds.map((i) => onDelete?.(i)))
          }
          table.resetRowSelection()
          setPendingIds([])
        }}
      />
    </>
  )
}

// main column definition
export const columns = (
  onDelete?: (idNo: string) => void,
  onEdit?: (
    oldId: string,
    data: {
      idNo: string
      firstName: string
      lastName: string
      course: string
      year: string
      gender: string
    }
  ) => void,
  programs: Array<{ code: string; name: string }> = [],
  existingIds?: string[],
  onBulkDelete?: (ids: string[]) => void
): ColumnDef<Students>[] => [
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
    accessorKey: "idNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "course",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Course
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "year",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "gender",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gender
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
        student={row.original}
        onDelete={onDelete}
        onEdit={onEdit}
        programs={programs}
        existingIds={existingIds}
        onBulkDelete={onBulkDelete}
        table={table}
      />
    ),
  },
]

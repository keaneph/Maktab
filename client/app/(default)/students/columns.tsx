"use client"

import { ColumnDef, Table } from "@tanstack/react-table"
import { ArrowUpDown, Loader2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useStudentPhoto } from "@/hooks/use-student-photo"

export type Students = {
  idNo: string
  firstName: string
  lastName: string
  college_code: string
  course: string
  year: number
  gender: string
  photo_path?: string
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
  onConfirm: () => Promise<void> | void
  studentName: string
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
    photo_path?: string
  }) => void
  student: Students
  programs: Array<{ code: string; name: string }>
  existingIds?: string[]
}) {
  const [isFormValid, setIsFormValid] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(values: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
    photo_path?: string
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
          onValidityChange={setIsFormValid}
          onSubmittingChange={setIsSubmitting}
          defaultValues={{
            idNo: student.idNo,
            firstName: student.firstName,
            lastName: student.lastName,
            course: student.course,
            year: student.year.toString(),
            gender: student.gender,
            photo_path: student.photo_path,
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

function PhotoCell({ student }: { student: Students }) {
  const { photoUrl } = useStudentPhoto(student.photo_path)
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`

  return (
    <div className="flex justify-center">
      <Avatar className="ring-border h-10 w-10 ring-2">
        <AvatarImage
          src={photoUrl || undefined}
          alt={`${student.firstName} ${student.lastName}`}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
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
          <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigator.clipboard.writeText(student.idNo)}
          >
            Copy student ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsEditOpen(true)}
          >
            Edit student
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
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
        onConfirm={async (data) => {
          await onEdit?.(student.idNo, data)
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
      photo_path?: string
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
    id: "photo",
    header: () => <div className="flex justify-center">Photo</div>,
    cell: ({ row }) => <PhotoCell student={row.original} />,
  },
  {
    accessorKey: "idNo",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
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
          className="cursor-pointer"
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
          className="cursor-pointer"
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
    accessorKey: "college_code",
    filterFn: "arrIncludesSome",
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
    accessorKey: "course",
    filterFn: "arrIncludesSome",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
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
    filterFn: "arrIncludesSome",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
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
    filterFn: "arrIncludesSome",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
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

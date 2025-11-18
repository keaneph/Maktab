"use client";

import { ColumnDef, Table } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollegeForm } from "@/components/college-form";

// type definition
export type Colleges = {
  code: string;
  name: string;
};

// local component for confirming deletion
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  collegeName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  collegeName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete College</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <b>{collegeName}</b>? This action
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
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// local component for editing college
function EditDialog({
  open,
  onClose,
  onConfirm,
  college,
  existingCodes = [],
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { code: string; name: string }) => void;
  college: Colleges;
  existingCodes?: string[];
}) {
  const [isFormValid, setIsFormValid] = React.useState(false);

  async function handleSubmit(values: { code: string; name: string }) {
    try {
      await onConfirm(values);
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit College</DialogTitle>
          <DialogDescription>Update the college information.</DialogDescription>
        </DialogHeader>

        <CollegeForm
          onSubmit={handleSubmit}
          existingCodes={existingCodes}
          onSuccess={onClose}
          onValidityChange={setIsFormValid}
          defaultValues={{ code: college.code, name: college.name }}
        />

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="college-form"
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
  );
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
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  noun: string;
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
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionsCell({
  college,
  onDelete,
  onEdit,
  onBulkDelete,
  existingCodes = [],
  table,
}: {
  college: Colleges;
  onDelete?: (code: string) => void;
  onEdit?: (code: string, data: { code: string; name: string }) => void;
  onBulkDelete?: (codes: string[]) => void;
  existingCodes?: string[];
  table: Table<Colleges>;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);
  const [pendingCodes, setPendingCodes] = React.useState<string[]>([]);

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
            onClick={() => navigator.clipboard.writeText(college.code)}
          >
            Copy college code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            Edit college
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const selected = table.getFilteredSelectedRowModel().rows;
              if (selected.length > 0) {
                const codes = selected.map((r) => r.original.code);
                setPendingCodes(codes);
                setIsBulkOpen(true);
              } else {
                setIsDeleteOpen(true);
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
        college={college}
        existingCodes={existingCodes}
        onConfirm={(data) => {
          onEdit?.(college.code, data);
          setIsEditOpen(false);
        }}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        collegeName={college.name}
        onConfirm={() => onDelete?.(college.code)}
      />
      <BulkDeleteDialog
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        count={pendingCodes.length}
        noun="Colleges"
        onConfirm={async () => {
          if (pendingCodes.length === 0) return;
          if (onBulkDelete) {
            await onBulkDelete(pendingCodes);
          } else {
            await Promise.all(pendingCodes.map((c) => onDelete?.(c)));
          }
          table.resetRowSelection();
          setPendingCodes([]);
        }}
      />
    </>
  );
}

// main column definition
export const columns = (
  onDelete?: (code: string) => void,
  onEdit?: (code: string, data: { code: string; name: string }) => void,
  onBulkDelete?: (codes: string[]) => void,
  existingCodes?: string[]
): ColumnDef<Colleges>[] => [
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
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => (
      <ActionsCell
        college={row.original}
        onDelete={onDelete}
        onEdit={onEdit}
        onBulkDelete={onBulkDelete}
        existingCodes={existingCodes}
        table={table}
      />
    ),
  },
];

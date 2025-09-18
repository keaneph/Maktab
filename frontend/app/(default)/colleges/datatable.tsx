"use client"

import * as React from "react"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Search,
} from "lucide-react"

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])

    const [globalFilter, setGlobalFilter] = React.useState("")

    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
      data, 
      columns, 
      state: {
        sorting, 
        globalFilter,
        rowSelection,
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(), onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), 
      onGlobalFilterChange: setGlobalFilter, onRowSelectionChange: setRowSelection,

      globalFilterFn: (row, columnId, filterValue) => {
      // Search across multiple columns
      const search = filterValue.toLowerCase()
      const code = (row.getValue("code") as string)?.toLowerCase() ?? ""
      const name = (row.getValue("name") as string)?.toLowerCase() ?? ""
      const dateCreated = (row.getValue("dateCreated") as string)?.toLowerCase() ?? ""
      const addedBy = (row.getValue("addedBy") as string)?.toLowerCase() ?? ""

      return code.includes(search) || name.includes(search) || dateCreated.includes(search) || addedBy.includes(search)
  },
  })

  return (
    <div>
      {/* search and add div */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"> 
        <div className="flex items-center py-4 w-full md:max-w-sm relative">
          <Input
            placeholder="Search colleges..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm pr-10" // add padding-right for icon space
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-center py-4">
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
                  <Plus />
                  <span>Add College</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add College</DialogTitle>
                  <DialogDescription>
                    Add a new college to the list.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="college-code-1">Code</Label>
                    <Input id="college-code-1" name="college-code" defaultValue="CCS" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="college-name-1">Name</Label>
                    <Input id="college-name-1" name="college-name" defaultValue="College of Computer Studies" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit">Save changes</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-gradient-to-l from-primary/5 to-card shadow-xs">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id} className="text-center"
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    {/**pagination*/}
    <div className="text-muted-foreground flex-1 text-sm px-0 py-2">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center justify-end space-x-6 lg:space-x-8 py-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
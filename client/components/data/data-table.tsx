"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
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

interface AddFormHandlers {
  onSuccess: () => void
  onValidityChange: (isValid: boolean) => void
  setIsSubmitting: (isSubmitting: boolean) => void
}

interface DataTableProps<TData, TValue, TFormData = Partial<TData>> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** placeholder text for search input */
  searchPlaceholder?: string
  /** dialog title (e.g. "Add College") */
  addTitle?: string
  /** dialog description */
  addDescription?: string
  /** hide the add button and dialog entirely */
  hideAddButton?: boolean
  /** custom form fields for the dialog */
  renderAddForm?: (props: AddFormHandlers) => React.ReactNode
  /** id of the form element inside add dialog; used by submit button */
  addFormId?: string
  /** keys in row to search through */
  searchKeys?: string[]
  // omissible function to handle form submission
  onAdd?: (formData: TFormData) => void
  onDelete?: (code: string) => Promise<void> | void
}

export function DataTable<TData, TValue, TFormData = Partial<TData>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  addTitle = "Add Item",
  addDescription = "Add a new item to the list.",
  hideAddButton = false,
  renderAddForm,
  addFormId = "college-form",
  searchKeys = [],
}: DataTableProps<TData, TValue, TFormData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isFormValid, setIsFormValid] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!isDialogOpen) {
      setIsFormValid(false)
      setIsSubmitting(false)
    }
  }, [isDialogOpen])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      return searchKeys.some((key) => {
        const val = (row.getValue(key) as string) ?? ""
        return val.toString().toLowerCase().includes(search)
      })
    },
  })

  return (
    <div>
      {/* search and add div */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="relative flex w-full items-center py-4 md:max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm pr-10"
          />
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <Search className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-center py-4">
          {!hideAddButton && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 min-w-8 cursor-pointer duration-200 ease-linear">
                  <Plus />
                  <span>{addTitle}</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{addTitle}</DialogTitle>
                  <DialogDescription>{addDescription}</DialogDescription>
                </DialogHeader>

                {renderAddForm?.({
                  onSuccess: () => setIsDialogOpen(false),
                  onValidityChange: setIsFormValid,
                  setIsSubmitting,
                })}

                <DialogFooter className="flex justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" className="cursor-pointer">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    form={addFormId}
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
                      "Save changes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="from-primary/5 to-card bg-gradient-to-l shadow-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="text-center"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-muted-foreground flex-1 px-0 py-2 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center justify-end space-x-6 py-2 lg:space-x-8">
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

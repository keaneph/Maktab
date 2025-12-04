"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Plus,
  Search,
  X,
  Check,
} from "lucide-react"
import {
  ColumnDef,
  ColumnFiltersState,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AddFormHandlers {
  onSuccess: () => void
  onValidityChange: (isValid: boolean) => void
  setIsSubmitting: (isSubmitting: boolean) => void
}

export interface FilterableColumn {
  id: string
  label: string
  options: { label: string; value: string }[]
}

interface DataTableProps<TData, TValue, TFormData = Partial<TData>> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  addTitle?: string
  addDescription?: string
  hideAddButton?: boolean
  renderAddForm?: (props: AddFormHandlers) => React.ReactNode
  addFormId?: string
  searchKeys?: string[]
  filterableColumns?: FilterableColumn[]
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
  filterableColumns = [],
}: DataTableProps<TData, TValue, TFormData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
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
      columnFilters,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      return searchKeys.some((key) => {
        const val = (row.getValue(key) as string) ?? ""
        return val.toString().toLowerCase().includes(search)
      })
    },
    filterFns: {
      arrIncludesSome: (row, columnId, filterValue: string[]) => {
        if (!filterValue || filterValue.length === 0) return true
        const value = String(row.getValue(columnId))
        return filterValue.includes(value)
      },
    },
  })

  const getSelectedValues = (columnId: string): string[] => {
    const filter = columnFilters.find((f) => f.id === columnId)
    if (!filter?.value) return []
    return Array.isArray(filter.value) ? filter.value : [filter.value as string]
  }

  const toggleFilterValue = (columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.find((f) => f.id === columnId)
      const currentValues = existing?.value
        ? Array.isArray(existing.value)
          ? existing.value
          : [existing.value as string]
        : []

      let newValues: string[]
      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v: string) => v !== value)
      } else {
        newValues = [...currentValues, value]
      }

      const otherFilters = prev.filter((f) => f.id !== columnId)
      if (newValues.length === 0) return otherFilters
      return [...otherFilters, { id: columnId, value: newValues }]
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pr-9 pl-9"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 cursor-pointer"
                onClick={() => setGlobalFilter("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Multiselect Filter Dropdowns */}
          {filterableColumns.map((filterCol) => {
            const selectedValues = getSelectedValues(filterCol.id)
            return (
              <Popover key={filterCol.id}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 w-[180px] cursor-pointer justify-between",
                      selectedValues.length > 0 && "border-primary"
                    )}
                  >
                    <span className="max-w-[90px] truncate">
                      {selectedValues.length === 0
                        ? filterCol.label
                        : selectedValues.length === 1
                          ? filterCol.options.find(
                              (o) => o.value === selectedValues[0]
                            )?.label
                          : `${selectedValues.length} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2" align="start">
                  <div className="max-h-[200px] space-y-1 overflow-y-auto">
                    {filterCol.options.map((opt) => {
                      const isSelected = selectedValues.includes(opt.value)
                      return (
                        <div
                          key={opt.value}
                          onClick={() =>
                            toggleFilterValue(filterCol.id, opt.value)
                          }
                          className={cn(
                            "hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                            isSelected && "bg-accent"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-input"
                            )}
                          >
                            {isSelected && (
                              <Check className="text-primary-foreground h-3 w-3" />
                            )}
                          </div>
                          <span className="truncate">{opt.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )
          })}
        </div>

        {/* Add Button */}
        <div className="flex items-center">
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
            <SelectTrigger className="h-8 w-[70px] cursor-pointer">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  className="cursor-pointer"
                  key={pageSize}
                  value={`${pageSize}`}
                >
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
            className="hidden size-8 cursor-pointer lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 cursor-pointer lg:flex"
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

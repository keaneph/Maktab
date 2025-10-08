"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Search,
} from "lucide-react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DataTableProps<TData, TValue, TFormData = Partial<TData>> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** placeholder text for search input */
  searchPlaceholder?: string;
  /** dialog title (e.g. "Add College") */
  addTitle?: string;
  /** dialog description */
  addDescription?: string;
  /** custom form fields for the dialog */
  renderAddForm?: (props: { 
    onSuccess: () => void;
    onValidityChange: (isValid: boolean) => void;
  }) => React.ReactNode;
  /** keys in row to search through */
  searchKeys?: string[];
  // omissible function to handle form submission
  onAdd?: (formData: TFormData) => void;
  onDelete?: (code: string) => Promise<void> | void
}

export function DataTable<TData, TValue, TFormData = Partial<TData>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  addTitle = "Add Item",
  addDescription = "Add a new item to the list.",
  renderAddForm,
  searchKeys = [],
}: DataTableProps<TData, TValue, TFormData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isFormValid, setIsFormValid] = React.useState(false);

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
        const search = filterValue.toLowerCase();
        return searchKeys.some((key) => {
    const val = (row.getValue(key) as string) ?? "";
    return val.toString().toLowerCase().includes(search);
    });
    },
    });

  return (
    <div>
      {/* search and add div */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center py-4 w-full md:max-w-sm relative">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-center py-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}> 
            <DialogTrigger asChild>
              <Button className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 active:bg-primary/90 min-w-8 duration-200 ease-linear">
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
                })}

              <DialogFooter className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline" className="cursor-pointer">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  form="college-form"
                  disabled={!isFormValid}
                  className={!isFormValid ? "bg-gray-400 hover:bg-gray-400" : "cursor-pointer"}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gradient-to-l from-primary/5 to-card shadow-xs">
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
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue
                placeholder={table.getState().pagination.pageSize}
              />
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
  );
}

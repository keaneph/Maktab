"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const currentYear = new Date().getFullYear()

export const studentSchema = z.object({
  idNo: z
    .string()
    .min(1, { message: "ID number is required" })
    .regex(/^\d{4}-\d{4}$/, { message: "Format must be YYYY-NNNN" })
    .refine(
      (val) => {
        const year = parseInt(val.slice(0, 4), 10)
        return year >= 2015 && year <= currentYear
      },
      { message: `Year must be between 2015 and ${currentYear}` }
    ),
  firstName: z
    .string()
    .min(2, { message: "First name is required" })
    .max(50, { message: "First name must be at most 50 characters" })
    .regex(/^[A-Za-z\s,-]+$/, {
      message: "First name must contain only letters and spaces",
    }),
  lastName: z
    .string()
    .min(2, { message: "Last name is required" })
    .max(50, { message: "Last name must be at most 50 characters" })
    .regex(/^[A-Za-z\s,-]+$/, {
      message: "Last name must contain only letters and spaces",
    }),
  course: z.string().min(1, { message: "Course is required" }),
  year: z.string().min(1, { message: "Year is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
})

export type StudentFormValues = z.infer<typeof studentSchema>

export function StudentForm({
  onSubmit,
  existingIds = [],
  programs = [],
  onSuccess,
  onValidityChange,
  defaultValues = {
    idNo: "",
    firstName: "",
    lastName: "",
    course: "",
    year: "",
    gender: "",
  },
}: {
  onSubmit: (values: StudentFormValues) => Promise<void>
  existingIds?: string[]
  programs: Array<{ code: string; name: string }>
  onSuccess?: () => void
  onValidityChange?: (isValid: boolean) => void
  defaultValues?: {
    idNo: string
    firstName: string
    lastName: string
    course: string
    year: string
    gender: string
  }
}) {
  const schemaWithDuplicateCheck = studentSchema.extend({
    idNo: studentSchema.shape.idNo
      .refine(
        (val) =>
          !existingIds.includes(val.toUpperCase()) ||
          val.toUpperCase() === defaultValues.idNo.toUpperCase(),
        { message: "This ID number already exists" }
      )
      .transform((val) => val.toUpperCase()),
  })

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(schemaWithDuplicateCheck),
    defaultValues: defaultValues,
    mode: "onChange",
  })

  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    onValidityChange?.(form.formState.isValid)
  }, [form.formState.isValid, onValidityChange])

  React.useEffect(() => {
    return () => {
      onValidityChange?.(false)
    }
  }, [onValidityChange])

  async function handleSubmit(values: StudentFormValues) {
    try {
      onSuccess?.()
      await onSubmit(values)
      form.reset()
    } catch {
      toast.error("Failed to add student")
    }
  }

  const filteredPrograms = React.useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return programs
    return programs.filter(
      (p) =>
        p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s)
    )
  }, [search, programs])

  return (
    <Form {...form}>
      <form
        id="student-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="idNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number</FormLabel>
              <FormControl>
                <Input placeholder="2023-0001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Keane Pharelle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Ledesma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search courses..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {filteredPrograms.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}{" "}
                      <span className="text-muted-foreground">({p.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

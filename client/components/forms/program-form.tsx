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

export const programSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Program code is required" })
    .max(10, { message: "Program code must be at most 10 characters" })
    .regex(/^[A-Za-z]+$/i, {
      message: "Program code must contain only letters",
    }),
  name: z
    .string()
    .min(2, { message: "Program name is required" })
    .max(100, { message: "Program name must be at most 100 characters" })
    .regex(/^[A-Za-z\s,]+$/, {
      message: "Program name must contain only letters and spaces",
    }),
  college_code: z.string().min(1, { message: "College is required" }),
})

export type ProgramFormValues = z.infer<typeof programSchema>

export function ProgramForm({
  onSubmit,
  existingCodes = [],
  colleges = [],
  onSuccess,
  onValidityChange,
  defaultValues = { code: "", name: "", college_code: "" },
}: {
  onSubmit: (values: ProgramFormValues) => Promise<void>
  existingCodes?: string[]
  colleges: Array<{ code: string; name: string }>
  onSuccess?: () => void
  onValidityChange?: (isValid: boolean) => void
  defaultValues?: { code: string; name: string; college_code: string }
}) {
  const schemaWithDuplicateCheck = programSchema.extend({
    code: programSchema.shape.code
      .refine(
        (val) =>
          !existingCodes.includes(val.toUpperCase()) ||
          val.toUpperCase() === defaultValues.code.toUpperCase(),
        { message: "This program code already exists" }
      )
      .transform((val) => val.toUpperCase()),
  })

  const form = useForm<ProgramFormValues>({
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

  async function handleSubmit(values: ProgramFormValues) {
    try {
      onSuccess?.()
      await onSubmit(values)
      form.reset()
    } catch {
      toast.error("Failed to add program")
    }
  }

  const filteredColleges = React.useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return colleges
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)
    )
  }, [search, colleges])

  return (
    <Form {...form}>
      <form
        id="program-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="BSCS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bachelor of Science in Computer Science"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="college_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search colleges..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {filteredColleges.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}{" "}
                      <span className="text-muted-foreground">({c.code})</span>
                    </SelectItem>
                  ))}
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

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

// defining the college schema using zod, required in each form
export const collegeSchema = z.object({
  code: z
    .string()
    .min(1, { message: "College code is required" })
    .max(10, { message: "College code must be at most 10 characters" })
    .regex(/^[A-Za-z]+$/i, {
      message: "College code must contain only letters",
    }),
  name: z
    .string()
    .min(2, { message: "College name is required" })
    .max(50, { message: "College name must be at most 50 characters" })
    .regex(/^[A-Za-z\s,]+$/, {
      message: "College name must contain only letters and spaces",
    }),
})

// inferred type from the schema
export type CollegeFormValues = z.infer<typeof collegeSchema>

// requires four props, onSubmit = what happens when the form is submitted
// existingCodes = array of existing college codes to check for duplicates
// onSuccess = callback function when the form is successfully submitted
// onValidityChange = callback function to report form validity to parent component
export function CollegeForm({
  onSubmit,
  existingCodes = [],
  onSuccess,
  onValidityChange,
  defaultValues = { code: "", name: "" },
}: {
  onSubmit: (values: CollegeFormValues) => Promise<void>
  existingCodes?: string[]
  onSuccess?: () => void
  onValidityChange?: (isValid: boolean) => void
  defaultValues?: { code: string; name: string }
}) {
  // extend (copies) the collegeSchema to add a custom validation
  const schemaWithDuplicateCheck = collegeSchema.extend({
    // only the code will have extended validation
    // shape means i can pick any field, and code means im picking the code field
    code: collegeSchema.shape.code
      .refine(
        // checks if value is NOT in existingCodes (case insensitive)
        // OR if it's the same as the current default value (for edit mode)
        (val) =>
          !existingCodes.includes(val.toUpperCase()) ||
          val.toUpperCase() === defaultValues.code.toUpperCase(),
        { message: "This college code already exists" }
        // transform makes sure that the code is always stored in uppercase
      )
      .transform((val) => val.toUpperCase()),
  })

  // useForm is a hook from react-hook-form
  // CollegeFormValues is the type of the form data, meaning
  // it tells the form that the form will have code and name fields only
  const form = useForm<CollegeFormValues>({
    // zodResolver connects the zod schema to react-hook-form
    // notice i didnt use collegeSchema, but schemaWithDuplicateCheck
    // because i want to include the duplicate check validation
    resolver: zodResolver(schemaWithDuplicateCheck),
    // use provided defaultValues or empty strings
    defaultValues: defaultValues,
    // mode onChange means validation only happens when the user types
    // other modes are onBlur (when user leaves the field) and onSubmit (only when user submits)
    mode: "onChange",
  })

  // acts like a messenger between the form and its parent component
  // whenever validity changes, it calls the parent’s onValidityChange function (if provided)
  // this allows the parent to, enable/disable the Save changes button based on whether the form is valid
  React.useEffect(() => {
    onValidityChange?.(form.formState.isValid)
  }, [form.formState.isValid, onValidityChange])

  // since form is inside a modal dialog:
  // when i close the dialog, the form component unmounts.
  // without cleanup, the parent might still think the form is “valid” from before.
  // cleanup ensures the parent is reset → form validity = false after closing.
  React.useEffect(() => {
    return () => {
      onValidityChange?.(false)
    }
  }, [onValidityChange])

  async function handleSubmit(values: CollegeFormValues) {
    try {
      onSuccess?.()
      await onSubmit(values)
      form.reset()
    } catch {
      toast.error("Failed to add college")
    }
  }

  return (
    <Form {...form}>
      <form
        id="college-form"
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
                <Input placeholder="CCS" {...field} />
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
                <Input placeholder="College of Computer Studies" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

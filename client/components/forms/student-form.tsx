"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadIcon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dropzone } from "@/components/dropzone"
import { useSupabaseUpload } from "@/hooks/use-supabase-upload"
import { useStudentPhoto } from "@/hooks/use-student-photo"
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
  photo_path: z.string().optional(),
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
    photo_path: "",
  },
  onSubmittingChange,
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
    photo_path?: string
  }
  onSubmittingChange?: (isSubmitting: boolean) => void
}) {
  const [isPhotoRemoved, setIsPhotoRemoved] = React.useState(false)
  const { photoUrl: currentPhotoUrl } = useStudentPhoto(
    isPhotoRemoved ? null : defaultValues.photo_path
  )

  const props = useSupabaseUpload({
    bucketName: "student-photos",
    path: `students/${defaultValues.idNo || "temp"}`,
    allowedMimeTypes: ["image/*"],
    maxFiles: 1,
    maxFileSize: 1000 * 1000 * 6, // 6MB,
  })
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
      onSubmittingChange?.(true)

      // Upload photo if files are selected
      let photoPath = values.photo_path || ""
      if (props.files.length > 0) {
        const studentPath = `students/${values.idNo}`
        const file = props.files[0]

        // Upload directly using Supabase client
        const { createClient } = await import("@/lib/client")
        const supabase = createClient()

        const { error } = await supabase.storage
          .from("student-photos")
          .upload(`${studentPath}/${file.name}`, file, {
            cacheControl: "3600",
            upsert: true,
          })

        if (error) {
          throw new Error(error.message)
        }

        photoPath = `${studentPath}/${file.name}`
      }

      // Submit form with photo path
      await onSubmit({ ...values, photo_path: photoPath })
      form.reset()
      props.setFiles([]) // Clear uploaded files
      onSuccess?.()
    } catch (error) {
      throw error
    } finally {
      onSubmittingChange?.(false)
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
                      {(() => {
                        const displayName = `${p.name} (${p.code})`
                        return displayName.length > 50
                          ? displayName.slice(0, 50) + "..."
                          : displayName
                      })()}
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
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Student Photo (Optional)
          </label>
          <Dropzone className="min-h-[200px]" {...props}>
            {props.files.length === 0 && !currentPhotoUrl ? (
              <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
                <div className="mb-1 flex justify-center">
                  <UploadIcon className="text-muted-foreground h-10 w-10" />
                </div>
                <div className="text-md mb-2 font-semibold">
                  Upload Student Photo
                </div>
                <div className="text-sm">
                  <p>
                    Drag and drop or{" "}
                    <button
                      type="button"
                      className="hover:text-foreground cursor-pointer underline transition"
                      onClick={props.open}
                    >
                      select files
                    </button>{" "}
                    to upload
                  </p>
                </div>
                <div className="text-muted-foreground text-sm">
                  Maximum file size: 6MB
                </div>
              </div>
            ) : props.files.length > 0 ? (
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                  {props.files[0].type.startsWith("image/") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={props.files[0].preview}
                      alt="Preview"
                      className="h-20 w-20 rounded-lg border object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{props.files[0].name}</p>
                    <p className="text-muted-foreground text-xs">
                      {(props.files[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => props.setFiles([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : currentPhotoUrl ? (
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPhotoUrl}
                    alt="Current photo"
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Photo</p>
                    <p className="text-muted-foreground text-xs">
                      {defaultValues.photo_path?.split("/").pop()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={props.open}
                      className="text-primary cursor-pointer text-sm hover:underline"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        props.setFiles([])
                        form.setValue("photo_path", "")
                        setIsPhotoRemoved(true)
                      }}
                      className="text-destructive cursor-pointer text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </Dropzone>
        </div>
      </form>
    </Form>
  )
}

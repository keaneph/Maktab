"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FieldError } from "@/components/ui/field"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { TreePalm } from "lucide-react"

const schema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

type SignupValues = z.infer<typeof schema>

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(values: SignupValues) {
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: values.username, email: values.email, password: values.password }),
      })
      if (!res.ok) {
        let msg = "Signup failed"
        try {
          const data = await res.json()
          if (data?.field === "username") {
            msg = data.error || msg
          } else if (data?.field === "email") {
            msg = data.error || msg
          } else if (data?.error) {
            msg = data.error
          }
        } catch {}
        throw new Error(msg)
      }
      await res.json()
      toast.success("Account created. Please log in.")
      router.replace("/login")
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Signup failed")
    }
  }
  return (
    <div>
      <div className="flex items-center justify-center gap-2 peer-data-[active=true]/menu-button:opacity-100">
          <div className="mb-6 mr-2 text-center flex items-center justify-center gap-2">
            <TreePalm className="!size-8" />
            <h1 className="text-2xl font-bold">Welcome back to Maktab!</h1>
          </div>
      </div>
      <Card {...props}>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input id="name" type="text" placeholder="admin" {...register("username")} />
                <FieldError errors={[errors.username]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nearpharelle@gmail.com"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" placeholder="********" {...register("password")} />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input id="confirm-password" type="password" placeholder="********" {...register("confirmPassword")} />
                <FieldDescription>Please confirm your password.</FieldDescription>
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Account"}</Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account? <Link href="/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

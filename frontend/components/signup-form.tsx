"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
    criteriaMode: "all",
  })
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting, isValid }, watch } = form

  // async uniqueness check (debounced)
  React.useEffect(() => {
    const sub = setTimeout(async () => {
      const username = watch("username")
      const email = watch("email")
      if (!username && !email) return
      try {
        const params = new URLSearchParams()
        const checkUsername = !!username
        const checkEmail = !!email
        if (checkUsername) params.set("username", username)
        if (checkEmail) params.set("email", email)
        const res = await fetch(`http://localhost:8080/api/auth/check?${params}`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
         if (checkUsername) {
            if (data.usernameTaken) {
              setError("username", { message: "Username already in use" })
            }
          }
          if (checkEmail) {
            if (data.emailTaken) {
              setError("email", { message: "Email already in use" })
            }
          }
        }
      } catch {
        // ignore network errors for UX
      }
    }, 300)
    return () => clearTimeout(sub)
  }, [watch("username"), watch("email"), setError, clearErrors])

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
            <h1 className="text-2xl font-bold">Sign up to Maktab!</h1>
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
          <Form {...form}>
            <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nearpharelle@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  form="signup-form"
                  disabled={!isValid || isSubmitting}
                  className={!isValid || isSubmitting ? "bg-gray-400 hover:bg-gray-400" : "cursor-pointer"}
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
                <p className="px-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login">Sign in</Link></p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

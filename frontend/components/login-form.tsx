"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FieldError } from "@/components/ui/field"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { 
  TreePalm,  
} from "lucide-react"

const schema = z.object({
  usernameOrEmail: z.string().min(1, "Username or Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginValues = z.infer<typeof schema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { usernameOrEmail: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    try {
      await login(values, searchParams.get("next") || undefined)
      toast.success("Logged in successfully")
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Login failed")
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
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle> 
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="usernameOrEmail">Username or Email</FieldLabel>
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="nearpharelle@gmail.com"
                    {...register("usernameOrEmail")}
                  />
                  <FieldError errors={[errors.usernameOrEmail]} />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input id="password" type="password" placeholder="********" {...register("password")} />
                  <FieldError errors={[errors.password]} />
                </Field>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

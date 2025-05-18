import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormValues } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RegisterForm({
  onSubmit,
  onLogin
}: {
  onSubmit: (data: RegisterFormValues) => void
  onLogin: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user"
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} placeholder="username" />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input id="email" {...register("email")} placeholder="user@example.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register("role")} placeholder="user 或 admin" />
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div> */}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <a onClick={onLogin} className="underline underline-offset-4">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
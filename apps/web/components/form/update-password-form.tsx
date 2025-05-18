import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UpdatePasswordFormValues, updatePasswordSchema } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UpdatePasswordForm({
  onSubmit,
  onLogin
}: {
  onSubmit: (data: UpdatePasswordFormValues) => void
  onLogin: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema)
  })
  const searchParams = new URLSearchParams(location.search)
  const email = searchParams.get("email") ?? ''

  return (
    <div className={"flex flex-col gap-6"} >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input id="email" {...register("email")} placeholder="user@example.com" defaultValue={email!} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" {...register("password")} placeholder="password" />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "发送中..." : "Reset 密码"}
            </Button>

            <div className="text-center text-sm">
              Already to login? {" "}
              <a onClick={onLogin} className="underline underline-offset-4">
                Login
              </a>
            </div>
            {/* {isSuccess && <p className="text-green-600 text-sm mt-2">邮件已发送，请查收！</p>} */}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
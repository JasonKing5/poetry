import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, ResetPasswordFormValues } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ResetPasswordForm({
  onSubmit,
  onLogin
}: {
  onSubmit: (data: ResetPasswordFormValues) => void
  onLogin: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema)
  })

  return (
    <div className={"flex flex-col gap-6"} >
      <Card className="card-ink">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">重置密码</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input id="email" {...register("email")} placeholder="user@example.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "发送中..." : "重置密码"}
            </Button>

            <div className="text-center text-sm">
              已有账号？ {" "}
              <a onClick={onLogin} className="underline underline-offset-4">
                登录
              </a>
            </div>
            {/* {isSuccess && <p className="text-green-600 text-sm mt-2">邮件已发送，请查收！</p>} */}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
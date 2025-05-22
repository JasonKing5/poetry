'use client';

import { useLogin, useRegister, useResetEmail } from "@/services/user.service"
import { AuthStatus, LoginResponse, RegisterFormValues, ResetPasswordFormValues } from "@/types/user"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { BrainCircuit } from "lucide-react"
import { LoginForm } from "@/components/form/login-form"
import { loginSchema } from "@/schemas/loginSchema"
import * as z from "zod"
import { RegisterForm } from "@/components/form/register-form"
import { ResetPasswordForm } from "@/components/form/reset-password-form"
import Link from "next/link";

export type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { setUser } = useAuth()
  const [authStatus, setAuthStatus] = useState(AuthStatus.Login)
  const navigate = useRouter()

  const { mutate: loginMutate } = useLogin({
    successMessage: "Login successful",
    onSuccess: (data: LoginResponse) => {
      console.log('login success:', data)
      setUser({...data.user, roles: data.roles.map((role: any) => role.name)})
      navigate.push("/")
    },
  })

  const { mutate: resetEmailMutate } = useResetEmail({
    successMessage: "Reset email sent successfully",
  })

  const { mutate: registerMutate } = useRegister({
    successMessage: "Register successful",
    onSuccess: () => {
      setAuthStatus(AuthStatus.Login)
    },
  })

  const handleLogin = (data: LoginFormValues) => {
    loginMutate(data)
  }

  const handleRegister = (data: RegisterFormValues) => {
    registerMutate(data)
  }

  const handleResetPassword = (data: ResetPasswordFormValues) => {
    console.log('handleResetPassword:', data)
    resetEmailMutate(data)
  }

  return (
    <div className="w-full h-full flex flex-1 flex-col justify-center items-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BrainCircuit className="size-4" />
          </div>
          醉诗词
        </Link>
        {authStatus === AuthStatus.Register && (
          <RegisterForm 
            onSubmit={handleRegister}
            onLogin={() => setAuthStatus(AuthStatus.Login)}
          />
        )}
        {authStatus === AuthStatus.Login && (
          <LoginForm 
            // @ts-ignore
            onSubmit={handleLogin} 
            onRegister={() => setAuthStatus(AuthStatus.Register)}
            onReset={() => setAuthStatus(AuthStatus.ResetPassword)}
          />
        )}
        {authStatus === AuthStatus.ResetPassword && (
          <ResetPasswordForm
            // @ts-ignore
            onSubmit={handleResetPassword}
            onLogin={() => setAuthStatus(AuthStatus.Login)}
          />
        )}
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          点击继续，代表您同意 <a href="#" className="underline underline-offset-4">服务条款</a>{" "}
          和 <a href="#" className="underline underline-offset-4">隐私政策</a>.
        </div>
      </div>
    </div>
  )
}
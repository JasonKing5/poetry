'use client';

import { useResetPassword } from "@/services/user.service"
import { UpdatePasswordFormValues } from "@/types/user"
import { useRouter, useSearchParams } from "next/navigation"
import { BrainCircuit } from "lucide-react"
import { UpdatePasswordForm } from '@/components/form/update-password-form'
import Link from "next/link";
import { Suspense } from 'react';

function ResetPassword() {
  const navigate = useRouter()
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); 

  const { mutate: resetPasswordMutate } = useResetPassword({
    successMessage: "Password updated successfully",
    onSuccess: () => navigate.push("/login"),
  })

  const handleUpdatePassword = (data: UpdatePasswordFormValues) => {
    resetPasswordMutate({
      ...data,
      token,
    })
  }

  return (
    <div className="flex min-h-svh min-w-svw flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium text-3xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[url('/logo.png')] bg-center bg-contain">
          </div>
          醉诗词
        </Link>
        <UpdatePasswordForm
          // @ts-ignore
          onSubmit={handleUpdatePassword}
          onLogin={() => navigate.push("/login")}
        />
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          点击继续，代表您同意 <a href="/terms-of-service" className="underline underline-offset-4">服务条款</a>{" "}
          和 <a href="/privacy-policy" className="underline underline-offset-4">隐私政策</a>.
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
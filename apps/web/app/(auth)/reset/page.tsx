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
    <div className="flex min-h-svh min-w-svw flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BrainCircuit className="size-4" />
          </div>
          Highland Population Cohort Database
        </Link>
        <UpdatePasswordForm
          // @ts-ignore
          onSubmit={handleUpdatePassword}
          onLogin={() => navigate.push("/login")}
        />
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking continue, you agree to our <a href="#" className="underline underline-offset-4">Terms of Service</a>{" "}
          and <a href="#" className="underline underline-offset-4">Privacy Policy</a>.
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
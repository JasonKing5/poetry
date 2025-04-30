'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      toast.success('登录成功');
      router.push('/');
    },
    onError: () => {
      toast.error('登录失败，请检查账号密码');
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({ email: 'root@example.com', password: '123456' });
      }}
    >
      <Button disabled={isPending}>登录</Button>
    </form>
  );
}
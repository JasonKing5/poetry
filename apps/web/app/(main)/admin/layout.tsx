import { Metadata } from 'next';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const metadata: Metadata = {
  title: '管理后台-醉诗词',
  description: '醉诗词管理后台',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}

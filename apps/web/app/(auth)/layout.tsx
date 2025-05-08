import "@/app/globals.css";
import { geistMono, geistSans } from "@/app/(main)/layout";
import { Providers } from '@/providers'
import AuthLayoutComp from "@/components/layout/AuthLayout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AuthLayoutComp>
            {children}
          </AuthLayoutComp>
        </Providers>
      </body>
    </html>
  );
}

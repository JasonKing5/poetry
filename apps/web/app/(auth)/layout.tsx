import "@/app/globals.css";
import { Providers } from '@/providers'
import AuthLayoutComp from "@/components/layout/AuthLayout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthLayoutComp>
            {children}
          </AuthLayoutComp>
        </Providers>
      </body>
    </html>
  );
}

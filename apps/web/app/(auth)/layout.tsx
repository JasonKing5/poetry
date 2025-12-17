import "@/app/globals.css";
import { Providers } from '@/providers'
import Script from "next/script";
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
        <Script
          src="https://analytics.codefe.cn/script.js"
          async
          defer
          data-website-id="1f32c8c2-8a60-482c-99b7-d6db36cd43a8"
        />
      </body>
    </html>
  );
}

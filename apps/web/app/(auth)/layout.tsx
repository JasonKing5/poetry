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
          data-website-id="5591c5cd-9139-4779-acca-d4fef1aecf37"
        />
      </body>
    </html>
  );
}

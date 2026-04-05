import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { SocketProvider } from "@/hooks/useSocket";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const beVietnamPro = Be_Vietnam_Pro({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro"
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Đồ án - KLTN",
  description: "Hệ thống quản lý Báo cáo Thực tập và Khóa luận Tốt nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn(inter.variable, beVietnamPro.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              {children}
              <Toaster />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

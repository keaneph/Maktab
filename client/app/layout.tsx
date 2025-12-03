import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/themes/theme-provider"
import { ActiveThemeProvider } from "@/components/themes/active-theme"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Maktab",
  description: "A student information system for CCC181",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("bg-background overscroll-none font-sans antialiased")}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider>
            {children}
            <Toaster position="top-center" />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

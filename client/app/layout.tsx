import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/themes/theme-provider"
import { ActiveThemeProvider } from "@/components/themes/active-theme"
import { Toaster } from "sonner"
import { cookies } from "next/headers"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Maktab",
  description: "A student information system for CCC181",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const activeThemeValue = cookieStore.get("theme")?.value
  const isScaled = activeThemeValue?.endsWith("-scaled")

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            {children}
            <Toaster position="top-center" />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

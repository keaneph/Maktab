import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ActiveThemeProvider } from "@/components/active-theme"
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Maktab",
  description: "A student information system for CCC181",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore= await cookies();
  const activeThemeValue = cookieStore.get("theme")?.value
  const isScaled = activeThemeValue?.endsWith("-scaled")

  return (
    <html lang="en" suppressHydrationWarning>
        <body className={cn ("bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
        )}>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme>
            <ActiveThemeProvider initialTheme={activeThemeValue}>
              {children}
        </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

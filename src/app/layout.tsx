import type { Metadata } from 'next';
import { Inter, Nunito_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from "@/lib/utils";

const manropeHeading = Manrope({subsets:['latin'],variable:'--font-heading'});

const nunitoSans = Nunito_Sans({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kognit - Task Alignment for PMs and Teams',
  description: 'A platform to capture, organize, and communicate tasks to your engineering teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", nunitoSans.variable, manropeHeading.variable)}>
      <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-primary/20`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

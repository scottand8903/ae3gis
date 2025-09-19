
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Test App",
  description: "A simple Next.js app with Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > */}
      <body className="flex flex-col min-h-screen font-sans bg-white text-black dark:bg-black dark:text-white antialiased">
        {/* Navbar */}
        <header className="w-full border-b border-solid border-black/[.08] dark:border-white/[.145]">
          <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <h1 className="text-lg font-medium">My Test App</h1>
            <ul className="ml-auto flex items-center space-x-4">
              <li>
                <Link
                  href="/landing"
                  className="text-sm font-medium hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm font-medium hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm font-medium hover:underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="w-full border-t border-solid border-black/[.08] dark:border-white/[.145]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
            <p className="text-sm text-gray-500">
              &copy; 2024 My Test App. All rights reserved.
            </p>
          </div>
        </footer>
        {/* {children} */}
      </body>
    </html>
  );
}

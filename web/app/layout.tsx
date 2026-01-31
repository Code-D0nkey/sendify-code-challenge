import "./globals.css";
import type { Metadata } from "next";
import Logo from "@/public/db_logo.png";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DB Schenker tracker",
    description: "A simple app that tracks DB Schenker shipments",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <header className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                    <Image
                        src={Logo}
                        alt="DB Schenker Logo"
                        width={200}
                        height={40}
                    />
                </header>
                {children}
                <Toaster />
            </body>
        </html>
    );
}

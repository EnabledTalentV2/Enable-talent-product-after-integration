import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import icon from "@/public/logo/ET Logo-01.webp";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Enable Talent",
  description: "Enabled Talent is an inclusive career platform connecting people with disabilities to accessible jobs, skills training, and supportive employers worldwide.",
  icons: {
    icon: icon.src,
    apple: icon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { inter, poppins } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alunyte",
  description: "Alunyte — illuminate your data, empower your decisions.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body
        className={`font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

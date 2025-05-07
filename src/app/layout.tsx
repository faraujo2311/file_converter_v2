'use client';

import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';

const geistSans = GeistSans;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [year, setYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <title>SCA - Sistema para conversão de arquivos</title>
        <meta name="description" content="Converta seus arquivos Excel ou PDF (em teste) para layouts TXT ou CSV personalizados." />
        {/* Add other meta tags if needed, like favicon, etc. */}
      </head>
      <body className={`${geistSans.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        {/* AppHeader removed */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="py-6 text-muted-foreground text-sm border-t">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
            <span className="mb-2 sm:mb-0 text-center sm:text-left">
              © {year} SCA. Ferramenta de conversão de dados. - Desenvolvido por <a href="mailto:faraujo@gmail.com" className="text-primary hover:underline">Fábio Araújo</a>
            </span>
            <span>v1.1.0</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

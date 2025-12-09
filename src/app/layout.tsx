import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Guia Importação Xianyu',
  description: 'Plataforma de curadoria de produtos da China',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={inter.className}>
          {children}

          {/* Toast Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1A1A1A',
                color: '#E0E0E0',
                border: '1px solid #333',
              },
              success: {
                iconTheme: {
                  primary: '#00ff9d',
                  secondary: '#0F0F0F',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF455F',
                  secondary: '#0F0F0F',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

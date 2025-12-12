import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['600', '700'],
});

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
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={`${inter.className} ${outfit.variable}`}>
          <ThemeProvider>
            <CurrencyProvider>
              {children}

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: 'var(--surface)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: 'var(--surface)',
                    },
                  },
                }}
              />
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

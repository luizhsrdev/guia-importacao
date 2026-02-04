import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SuggestionProvider, SuggestionWrapper } from '@/components/suggestions';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

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
      <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
        <body className={`${inter.className} ${outfit.variable}`}>
          <ThemeProvider>
            <CurrencyProvider>
              <SuggestionProvider>
                {children}
                <SuggestionWrapper />

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
              </SuggestionProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

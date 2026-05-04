import type { Metadata } from 'next';
import './globals.css'
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { Toaster } from 'react-hot-toast';


export const metadata: Metadata = {
  title: 'Go Shop — Backoffice',
  description: 'Administration platform for Go Shop delivery & transport',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  borderRadius: '12px',
                  boxShadow: 'var(--glass-shadow)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: 'white' } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

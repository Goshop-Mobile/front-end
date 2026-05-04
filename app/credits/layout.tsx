'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Tableau de bord',
  '/drivers':    'Conducteurs',
  '/users':      'Utilisateurs',
  '/orders':     'Commandes',
  '/vehicles':   'Véhicules',
  '/credits':    'Gestion des crédits',
  '/ads':        'Publicités',
  '/referrals':  'Parrainage',
  '/moderation': 'Modération',
  '/settings':   'Configuration',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-blue)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
      {/* Sidebar */}
      <div
        className="flex-shrink-0 h-full glass border-r"
        style={{ borderColor: 'var(--border)', position: 'relative', zIndex: 40 }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

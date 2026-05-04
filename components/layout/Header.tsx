'use client';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { initials } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-30"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Title */}
      {title && (
        <h1 className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto mr-2 relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="search"
          placeholder="Rechercher…"
          className="input-glass w-full rounded-xl pl-9 pr-4 py-2 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          onClick={toggle}
          className="btn-glass p-2 rounded-xl"
          whileTap={{ scale: 0.9 }}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            : <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          }
        </motion.button>

        {/* Notifications */}
        <button className="btn-glass p-2 rounded-xl relative">
          <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--accent-red)' }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-700 text-white"
          style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}
        >
          {initials(user?.full_name)}
        </div>
      </div>
    </header>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard, Users, Truck, ShoppingCart, Car,
  CreditCard, Megaphone, GitBranch, Settings, LogOut,
  Shield, Zap, ChevronRight, X, Menu
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Tableau de bord',  role: 'any'       },
  { href: '/moderation',  icon: Shield,           label: 'Modération',        role: 'any'       },
  { href: '/drivers',     icon: Truck,            label: 'Conducteurs',       role: 'admin'     },
  { href: '/users',       icon: Users,            label: 'Utilisateurs',      role: 'admin'     },
  { href: '/orders',      icon: ShoppingCart,     label: 'Commandes',         role: 'admin'     },
  { href: '/vehicles',    icon: Car,              label: 'Véhicules',         role: 'admin'     },
  { href: '/credits',     icon: CreditCard,       label: 'Crédits',           role: 'admin'     },
  { href: '/ads',         icon: Megaphone,        label: 'Publicités',        role: 'admin'     },
  { href: '/referrals',   icon: GitBranch,        label: 'Parrainage',        role: 'admin'     },
  { href: '/settings',    icon: Settings,         label: 'Configuration',     role: 'admin'     },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const visibleNav = adminNav.filter(n => n.role === 'any' || isAdmin);

  return (
    <aside
      className="flex flex-col h-full relative"
      style={{ width: collapsed ? '64px' : '260px', transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #9B1C1C 100%)',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}
        >
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-display font-700 text-lg leading-none">
                <span style={{ color: 'var(--accent-red)' }}>Go</span>
                <span style={{ color: 'var(--text-primary)' }}>Shop</span>
              </span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="glass-sm rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="online-dot flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-600 truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.full_name}
              </p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                {user?.role === 'admin' ? 'Administrateur' : 'Modérateur'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {!collapsed && (
          <p className="text-xs uppercase tracking-widest px-2 py-2 mb-1" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
            Navigation
          </p>
        )}
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', active && 'active', collapsed && 'justify-center px-2')}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && active && (
                <ChevronRight className="w-3 h-3 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={logout}
          className={cn('sidebar-link w-full', collapsed && 'justify-center px-2')}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-red-400" />
          {!collapsed && <span className="text-sm text-red-400">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus, DriverStatus, DocumentStatus, AdStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'FCFA') {
  return new Intl.NumberFormat('fr-TG', { maximumFractionDigits: 0 }).format(amount) + ' ' + currency;
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('fr-TG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    ...options,
  }).format(new Date(dateStr));
}

export function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'À l\'instant';
  if (mins < 60)   return `Il y a ${mins}min`;
  if (hours < 24)  return `Il y a ${hours}h`;
  if (days < 7)    return `Il y a ${days}j`;
  return formatDate(dateStr, { day: '2-digit', month: 'short', year: undefined, hour: undefined, minute: undefined });
}

// ─── Status helpers ───────────────────────────────────────────────────────────
export function orderStatusBadge(status: OrderStatus): { label: string; cls: string } {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    pending:     { label: 'En attente',    cls: 'badge-yellow'  },
    accepted:    { label: 'Acceptée',      cls: 'badge-blue'    },
    pickup:      { label: 'En route',      cls: 'badge-blue'    },
    collected:   { label: 'Colis collecté',cls: 'badge-purple'  },
    in_progress: { label: 'En cours',      cls: 'badge-orange'  },
    arrived:     { label: 'Arrivé',        cls: 'badge-blue'    },
    completed:   { label: 'Terminée',      cls: 'badge-green'   },
    cancelled:   { label: 'Annulée',       cls: 'badge-red'     },
  };
  return map[status] ?? { label: status, cls: 'badge-gray' };
}

export function driverStatusBadge(status: DriverStatus): { label: string; cls: string } {
  const map: Record<DriverStatus, { label: string; cls: string }> = {
    unverified:     { label: 'Non vérifié',    cls: 'badge-gray'   },
    pending_review: { label: 'En révision',    cls: 'badge-yellow' },
    verified:       { label: 'Vérifié',        cls: 'badge-green'  },
    suspended:      { label: 'Suspendu',       cls: 'badge-red'    },
  };
  return map[status] ?? { label: status, cls: 'badge-gray' };
}

export function docStatusBadge(status: DocumentStatus): { label: string; cls: string } {
  const map: Record<DocumentStatus, { label: string; cls: string }> = {
    pending:  { label: 'En attente', cls: 'badge-yellow' },
    approved: { label: 'Approuvé',  cls: 'badge-green'  },
    rejected: { label: 'Refusé',    cls: 'badge-red'    },
  };
  return map[status] ?? { label: status, cls: 'badge-gray' };
}

export function adStatusBadge(status: AdStatus): { label: string; cls: string } {
  const map: Record<AdStatus, { label: string; cls: string }> = {
    active:    { label: 'Active',     cls: 'badge-green'  },
    scheduled: { label: 'Planifiée',  cls: 'badge-blue'   },
    expired:   { label: 'Expirée',    cls: 'badge-gray'   },
    paused:    { label: 'En pause',   cls: 'badge-yellow' },
  };
  return map[status] ?? { label: status, cls: 'badge-gray' };
}

export function docTypeLabel(type: string): string {
  const map: Record<string, string> = {
    id_card_front:  "Carte d'identité (recto)",
    selfie_with_id: "Selfie avec CNI",
    profile_photo:  "Photo de profil",
    vehicle_photo:  "Photo du véhicule",
    license_plate:  "Plaque d'immatriculation",
  };
  return map[type] ?? type;
}

export function truncate(str: string, n = 30) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function initials(name: string | null | undefined) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export function generateMockChartData(days = 14): Array<{ label: string; value: number; value2: number }> {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      label: d.toLocaleDateString('fr-TG', { day: '2-digit', month: 'short' }),
      value:  Math.floor(Math.random() * 80 + 20),
      value2: Math.floor(Math.random() * 50000 + 10000),
    };
  });
}

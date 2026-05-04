# GoShop Admin — Backoffice

Interface d'administration pour la plateforme **Go Shop** (Next.js 15 + TypeScript).

## Stack
- **Next.js 15** (App Router, Turbopack)
- **TypeScript strict**
- **Tailwind CSS** avec thème personnalisé GoShop
- **Framer Motion** pour les animations et effet Liquid Glass
- **Recharts** pour les graphiques
- **React Hook Form + Zod** pour les formulaires
- **Axios** avec intercepteur de refresh JWT automatique
- **React Hot Toast** pour les notifications

## Installation

```bash
npm install
cp .env.example .env.local
# Modifier NEXT_PUBLIC_API_URL si nécessaire
npm run dev
```

## Pages disponibles

| Route | Rôle | Description |
|---|---|---|
| `/login` | Public | Connexion admin/modérateur |
| `/dashboard` | Admin/Modo | Tableau de bord temps réel |
| `/moderation` | Admin/Modo | Révision documents conducteurs |
| `/drivers` | Admin | Liste et gestion conducteurs |
| `/users` | Admin | Liste et gestion clients |
| `/orders` | Admin | Liste et gestion commandes |
| `/vehicles` | Admin | Types véhicules & tarifs |
| `/credits` | Admin | Ajustement crédits conducteurs |
| `/ads` | Admin | Bannières publicitaires |
| `/referrals` | Admin | Parrainage & classement |
| `/settings` | Admin | Configuration plateforme |

## Thèmes
- Mode **sombre** (défaut) et **clair** — toggle en haut à droite
- Effet **Liquid Glass** sur tous les composants
- Palette : Bleu `#1E3A8A`, Rouge `#9B1C1C`, Noir/Blanc
- Fonts : **Syne** (display) + **DM Sans** (body) + **JetBrains Mono** (mono)

## Architecture
```
src/
├── app/             # Pages (App Router)
│   ├── login/
│   ├── dashboard/
│   ├── drivers/
│   ├── users/
│   ├── orders/
│   ├── vehicles/
│   ├── credits/
│   ├── ads/
│   ├── referrals/
│   ├── moderation/
│   └── settings/
├── components/
│   ├── ui/          # Composants réutilisables (GlassCard, Modal, Badge…)
│   ├── layout/      # Sidebar, Header
│   └── charts/      # Recharts wrappers
├── lib/
│   ├── api.ts       # Client Axios + endpoints
│   ├── auth.tsx     # Context auth + JWT
│   ├── theme.tsx    # Dark/Light mode
│   └── utils.ts     # Helpers, formatters
└── types/           # Types TypeScript partagés
```

## Connexion
Le backoffice accepte uniquement les comptes avec le rôle `admin` ou `moderator`.  
Les conducteurs et clients ne peuvent pas s'y connecter.

## Déploiement (Vercel)
```bash
npm run build
# Déployer sur Vercel avec la variable NEXT_PUBLIC_API_URL configurée
```

# 🌿 DZAN Lawu Heritage

> Heritage crafts from Karanganyar, Central Java — connecting traditional Indonesian artisans with international markets.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-cyan)](https://tailwindcss.com/)

## 🌏 About

**DZAN Lawu Heritage** is a curated platform showcasing handcrafted products from artisans in Karanganyar, Central Java, Indonesia. Our mission is to bridge traditional craftsmanship with global markets while preserving cultural heritage.

**Live Demo:** [dzanlawu.com](https://dzanlawu.com) *(coming soon)*

---

## ✨ Features

### For Buyers
- 🛍️ Browse curated catalog of heritage products
- 🎨 View detailed product galleries with artisan stories
- 💌 Send inquiries with pre-filled buyer information
- 📱 Direct WhatsApp integration for personalized conversations

### For Admin Team
- 👥 Multi-role team management (super_admin, admin, freelancer)
- 📦 Product & artisan CRUD with multi-language support
- 🎬 Hero video & gallery management
- 💌 Inquiry pipeline management (new → contacted → closed)
- ⚙️ Dynamic settings (WhatsApp, contact, social media)
- 🔒 Row-level security via Supabase RLS

### Authentication
- 📧 Email/password login
- 🔐 Google OAuth
- 🔑 Password reset via magic link
- 👤 Onboarding flow for new buyers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (SSR) |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/dzan-project.git
cd dzan-project

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your Supabase credentials in .env.local

# Run development server
npm run dev

📁 Project Structure
dzan-project/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Landing
│   │   ├── catalog/       # Product catalog
│   │   ├── product/[slug] # Product detail
│   │   ├── about/         # About DZAN
│   │   └── contact/       # Contact info
│   ├── (auth)/            # Authentication
│   │   ├── login/
│   │   ├── signup/
│   │   ├── onboarding/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── account/           # Buyer account
│   │   └── change-password/
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Dashboard menu
│   │   ├── products/
│   │   ├── artisans/
│   │   ├── team/
│   │   ├── inquiries/
│   │   └── settings/
│   ├── api/               # API routes
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── account/
│   │   └── inquiries/
│   ├── auth/confirm/      # Auth callback
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature components
├── lib/
│   ├── supabase.ts        # Public data client
│   ├── supabase-browser.ts # Client-side auth
│   ├── supabase-server.ts # Server-side auth
│   ├── settings.ts        # Settings helper
│   └── permissions.ts     # Role permissions
├── proxy.ts               # Next.js middleware (Supabase SSR)
└── ...

🗄️ Database Schema
Core Tables
profiles — User profiles (extends auth.users)
products — Product catalog with bilingual content
artisans — Artisan profiles and stories
product_photos — Multi-photo galleries
inquiries — Buyer inquiries with status tracking
settings — Dynamic app configuration
activity_log — Admin action audit trail
RLS (Row Level Security)
All tables have RLS enabled with role-based policies:
Public: Read-only access to products, artisans
Buyer: Own inquiries, own profile
Admin (scoped): Manage per scope (sales, creative, product)
Super Admin: Full access

🎨 Design System
Brand Colors
--dzan-cream: #FDF9F0   /* Background */
--dzan-earth: #3E2C1C   /* Primary text */
--dzan-brown: #6B4423   /* Accent */
--dzan-amber: #C9A961   /* Highlight */
--dzan-stone: #8B8378   /* Muted */
--dzan-warm: #E8DCC4    /* Soft background */
--dzan-sage: #7B8471    /* Secondary accent */

Typography
Display: Cormorant Garamond (italic serif for headings)
Body: System sans-serif
Uppercase tracking: Wide letter-spacing for labels

🌐 Multi-Language Support
Currently supports:
🇬🇧 English (default)
🇮🇩 Indonesian (partial, database-driven)
Roadmap: German (DE) support post-launch for European buyer market.

🔐 Authentication Flow
Buyer Journey
Landing → Login/Signup → Onboarding → Account

Inquiry Flow
Product → Login required → Modal (pre-filled) → Submit → WhatsApp

Password Reset
Forgot Password → Email → verifyOtp → Reset → Login

🚢 Deployment
Automated deployment via Vercel:
Production: Push to main branch
Preview: Any PR gets preview URL
Environment: Configured in Vercel Dashboard
See deployment guide for detailed steps.

🤝 Team
DZAN Lawu Heritage is powered by:
Mas Edi — Founder & Developer
Mbak Nur — Sales & Customer Relations
Mbak Priyan — Product & Artisan Coordinator
Mas Danang — Creative & Content

📄 License
Copyright © 2026 DZAN Lawu Heritage. All rights reserved.

🌿 Acknowledgments
Artisans of Karanganyar for their timeless craft
Mount Lawu — the eternal source of inspiration
Open source community for excellent tools

"Heritage of Karanganyar to the World" 🌏✨

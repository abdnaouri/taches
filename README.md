# tâches (Tâches Marketplace)

A modern, high-trust micro-task and freelance services marketplace built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Role-based Experience**: Seamless switching between Customer (ordering & posting tasks) and Performer (earning & completing tasks).
- **Escrow-Secured Payments**: Multi-tier balance management (Available vs. Escrow), milestone releases, automated commission calculation, and transaction history.
- **Qualification & Performer Tiers**: Gamified 5-tier progression with experience points (XP), completion rating thresholds, and qualification tests.
- **Detailed Task Flow**:
  - Dynamic task filtering (categories, level requirements, reward ranges)
  - Interactive task creation with escrow budget calculator
  - Proposal & bid submission
  - Proof of work submission with file/link attachment
  - Arbitration and revision workflows
- **Supabase Backend**: Fully relational schema with Row Level Security (RLS) policies, triggers, and automated balance management (`supabase/schema.sql`).
- **Responsive UI/UX**: Designed with Tailwind CSS, Lucide icons, and Framer Motion micro-interactions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Motion**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)

---

## 📦 Getting Started

### 1. Prerequisites

- Node.js (v18.17+ or v20+)
- npm / yarn / pnpm

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/elmehdibadaoui/taches.git
cd taches
npm install
```

### 3. Environment Variables

Copy the example environment configuration:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Database Setup

Execute the SQL script located in `supabase/schema.sql` in your Supabase project's SQL editor to set up tables, types, RLS policies, and triggers.

### 5. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
├── app/
│   ├── globals.css         # Global styles and Tailwind directives
│   ├── layout.tsx          # Root layout with fonts & metadata
│   └── page.tsx            # Main marketplace view and state controller
├── components/
│   ├── Header.tsx          # Top navigation, role toggle & wallet summary
│   ├── TaskCard.tsx        # Task item card component
│   ├── TaskDetailModal.tsx # Task overview, requirements, & bidding
│   ├── CreateTaskModal.tsx # New task creation with escrow calculator
│   ├── ProofSubmissionDrawer.tsx # Performer proof of work submission
│   ├── QualificationModal.tsx    # Performer onboarding test
│   └── WalletModal.tsx     # Escrow & balance manager
├── lib/
│   ├── mockData.ts         # Initial mock tasks and user profile
│   └── supabase.ts         # Supabase client initializer
├── supabase/
│   └── schema.sql          # Supabase SQL DDL, RLS, and functions
└── types/
    └── database.ts         # TypeScript data contracts & database models
```

---

## 📄 License

MIT

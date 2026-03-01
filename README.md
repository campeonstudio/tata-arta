# Budgetly

A modern personal budgeting web app built with React + Vite + Supabase.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: CSS Modules (Modern Skeuomorphism design)
- **Auth + DB**: Supabase
- **Deploy**: Netlify

## Project Structure

```
src/
├── features/
│   ├── auth/          # Login, signup, auth context
│   ├── onboarding/    # Multi-step onboarding flow
│   ├── budget/        # Budget management (coming next)
│   ├── expenses/      # Expense tracking (coming next)
│   └── dashboard/     # Main dashboard (coming next)
├── components/
│   ├── ui/            # Shared UI components
│   └── layout/        # Layout components (ProtectedRoute, etc.)
├── hooks/             # Custom React hooks
├── lib/
│   ├── supabase.js    # Supabase client
│   └── constants.js   # App constants (default categories, etc.)
└── styles/
    ├── global.css     # CSS variables, reset, base styles
    └── components.css # Reusable component styles
```

## Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd budgetly
npm install
```

### 2. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Copy your project URL and anon key

### 3. Environment Variables
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials in `.env.local`.

### 4. Run Locally
```bash
npm run dev
```

### 5. Deploy to Netlify
1. Push to GitHub
2. Connect repo to Netlify
3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command: `npm run build`
5. Publish directory: `dist`

## Roadmap

- [x] Auth (sign up / sign in)
- [x] Onboarding (income, budget allocation, goals)
- [ ] Dashboard overview
- [ ] Budget management (edit groups, categories, subcategories)
- [ ] Expense tracking & input
- [ ] Monthly reports & insights
- [ ] Goals tracking

# MoneyTrack

A calm, sky-blue money tracker for everyday spending, income, monthly budgets, bills, and gentle insights. Built as a responsive web app for mobile, tablet, and laptop/desktop.

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime, RLS)
- **Auth:** email + password, Google OAuth, and 6-digit email OTP
- **Deploy:** Vercel (SPA rewrite included in `vercel.json`)
- **Design:** Plus Jakarta Sans, Phosphor icons, custom 3D-style SVG illustrations
- **Money in and out:** income entries (`salary`, `freelance`, `business`, `investment`, `gift`, `other`) plus expenses, both editable month by month
- **Currency:** MMK default, with USD, EUR, THB, SGD, EGP, SAR, GBP, JPY, MYR, CNY, INR, AUD, CAD

> **Live:** [moneytrack-one-sable.vercel.app](https://moneytrack-one-sable.vercel.app)
>
> **No credentials are bundled.** Until you add your own Supabase env values, the app shows a setup notice instead of the sign-in screen. This is intentional.

---

## 1. Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

If the app shows the “Supabase is not connected yet” page, `VITE_SUPABASE_URL` or the publishable/anon key is missing. Add them to `.env.local` and restart the dev server. The publishable key is the newer name for the browser-safe key; `VITE_SUPABASE_ANON_KEY` still works as a fallback.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check with `tsc -b`, then build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint on `src/` |

---

## 2. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create **one** project.
2. Open **Project Settings → API**.
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable key** (or legacy **anon public** key) → `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)
4. Put them in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

> Only the **publishable / anon public** key belongs in the browser. Never put a `service_role` key in a Vite env variable.

5. Open **SQL Editor**, paste the contents of [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql), and run it once.
6. If your project was created before income support, also run [`supabase/migrations/002_income.sql`](supabase/migrations/002_income.sql). It is idempotent, so re-running is safe.

The migrations create:

- `profiles`, `expenses`, `incomes`, `bills` tables
- indexes and updated-at trigger
- auto-profile creation on sign-up
- owner-only row-level security policies
- the atomic `mark_bill_paid(p_bill_id uuid)` function
- realtime publication for expenses, incomes, bills, and profiles
- a private `receipts` storage bucket with per-user policies

### Verify the database

In **Table Editor**, you should see the four tables. In **Storage**, you should see a private `receipts` bucket with an 8MB file limit and image MIME types.

---

## 3. Authentication setup

### 3.1 Email provider

Open **Authentication → Providers → Email**:

- Enable **Email**
- Keep **Enable email confirmations**:
  - **OFF** for local development → sign-up returns a session immediately, so the OTP screen is skipped.
  - **ON** for production → sign-up sends a 6-digit code, and the app shows the OTP screen.
- Keep the minimum password length at 6 (the app validates 6+ too).

### 3.2 Email OTP (6-digit code)

MoneyTrack verifies emails with a **6-digit code**, not a magic link. You must customize the Supabase **Confirm signup** email template so it includes `{{ .Token }}`.

Go to **Authentication → Email Templates → Confirm signup** and use something like:

```html
<h2>Confirm your MoneyTrack email</h2>
<p>Your verification code is:</p>
<h1 style="letter-spacing: 8px">{{ .Token }}</h1>
<p>This code expires in 1 hour. If you did not create an account, ignore this email.</p>
```

The app uses:

```ts
// verify
supabase.auth.verifyOtp({ email, token, type: 'signup' })

// resend
supabase.auth.resend({ type: 'signup', email })
```

> In local development with confirmations OFF, the OTP screen is not shown. To test OTP locally, temporarily turn confirmations ON, or test against your production project.

### 3.3 SMTP for production (recommended)

Supabase’s built-in email sender is heavily rate-limited and meant for testing. For production, add your own SMTP provider under **Authentication → SMTP Settings**.

Example with [Resend](https://resend.com):

| Setting | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your Resend API key |
| Sender email | `onboarding@resend.dev` for testing, or `noreply@yourdomain.com` |
| Sender name | MoneyTrack |

Verify your domain in Resend before using a custom sender address.

### 3.4 Google OAuth

1. In **Google Cloud Console → APIs & Services → Credentials**, create an **OAuth client ID** of type **Web application**.
2. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://your-app.vercel.app`
   - your custom domain, if any
3. Add **Authorized redirect URI**:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. In Supabase, open **Authentication → Providers → Google**:
   - Enable Google
   - Paste the Client ID and Client Secret
5. In Supabase **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:5173` for development, `https://your-app.vercel.app` for production
   - **Redirect URLs** (add all that apply):
     - `http://localhost:5173/auth/callback`
     - `http://localhost:5173/reset-password`
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/reset-password`

The app sends OAuth users to `/auth/callback`, which exchanges the code and routes them to setup or the dashboard.

### 3.5 Password reset

The app calls:

```ts
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

Make sure `/reset-password` is included in the Supabase redirect allow-list for every environment. The **Reset password** email template can stay default; only the redirect URL matters.

`/reset-password` intentionally sits outside the public-only route guard because a recovery link creates an authenticated session.

---

## 4. Data model

### `profiles`

One row per auth user, created automatically by a trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | references `auth.users(id)` |
| `display_name` | text | from Google/full name metadata |
| `email` | text | |
| `phone` | text | optional |
| `currency` | text | default `MMK` |
| `budget_total` | numeric | default 0 |
| `budget_allocations` | jsonb | defaults to food 30, transport 15, shopping 20, bills 25, other 10 |
| `setup_complete` | boolean | true after the currency step |
| `created_at`, `updated_at` | timestamptz | |

> `monthly_income` and `income_source` remain in the table for backwards compatibility, but the app no longer uses them. Monthly income is calculated from the `incomes` table.

### `expenses`

`id`, `user_id`, `amount > 0`, `category`, `date`, `payment_method`, `note`, `receipt_path`, `created_at`.

### `incomes`

`id`, `user_id`, `amount > 0`, `source` (`salary` / `freelance` / `business` / `investment` / `gift` / `other`), `date`, `note`, `created_at`.

### `bills`

`id`, `user_id`, `title`, `amount > 0`, `due_date`, `frequency` (`once` / `monthly` / `weekly`), `category`, `active`, `last_paid_at`, `created_at`.

### Dashboard math

```text
monthlyExpenses  = sum of expenses in the selected month
monthlyIncome    = sum of income entries in the selected month
totalBalance     = monthlyIncome - monthlyExpenses
remainingBudget  = profile.budget_total - monthlyExpenses
budgetUsed%      = monthlyExpenses / profile.budget_total
savingsRate      = (monthlyIncome - monthlyExpenses) / monthlyIncome
```

Currency switching changes labels only. Saved amounts are never converted.

### Marking a bill paid

`mark_bill_paid` runs in one transaction:

1. Locks the bill row.
2. Inserts an expense with `payment_method = 'Bill payment'` and `note = 'Bill: <title>'`.
3. For one-time bills: sets `active = false`.
4. For monthly/weekly bills: advances `due_date` until it is in the future.
5. Sets `last_paid_at = now()`.
6. Returns the updated bill.

The client has a fallback if the RPC is missing, but run the migration so the atomic version is used.

---

## 5. Responsive layout

| Width | Layout |
|---|---|
| `< 640px` | Single column, 6-item bottom navigation, full-screen forms, bottom sheets |
| `640–1023px` | Two-column grids, centered auth cards, bottom navigation |
| `1024px+` | Left sidebar (`w-72`), 12-column content grid, centered dialogs |
| `1280px+` | Wider dashboard content, right-side cards |

Key behavior:

- Bottom nav is hidden at `lg` and replaced by the sidebar. It includes Home, Expenses, Income, Bills, Analytics, and Profile.
- Sheets become centered dialogs on `lg+`.
- Auth and setup pages use split layouts on desktop.
- Onboarding is a single currency step. Income and budget setup are optional and available later from the dashboard or profile.
- Dashboard uses a 12-column grid on desktop and merges income + expenses in Recent activity.
- Expenses and income switch from day-grouped cards to tables on desktop.
- Categories use 3 / 4 / 6 columns across mobile / tablet / desktop.
- Charts are responsive SVGs with `viewBox`.

Test at 320, 375, 390, 414, 768, 1024, 1280, and 1440px widths, including very large amounts such as `MMK 1,234,567,890`.

---

## 6. Deploy to Vercel

1. Push the repository to GitHub/GitLab.
2. Import it in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variables in **Vercel → Project → Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)
7. Deploy. `vercel.json` already rewrites all routes to `/index.html` for React Router.
8. After you know the production domain, update:
   - Supabase **Site URL**
   - Supabase **Redirect URLs** (`/auth/callback` and `/reset-password`)
   - Google Cloud **Authorized JavaScript origins**
9. Turn **Enable email confirmations ON** in Supabase for production.
10. Configure production SMTP (Resend or another provider).

### Production checklist

- [ ] Migration `001_init.sql` has been run
- [ ] Migration `002_income.sql` has been run on older projects
- [ ] RLS enabled on all four tables (`profiles`, `expenses`, `incomes`, `bills`)
- [ ] `receipts` bucket exists and is private
- [ ] Email confirmation is ON
- [ ] Confirm signup template contains `{{ .Token }}`
- [ ] SMTP configured
- [ ] Google provider configured
- [ ] Site URL and redirect URLs include the production domain
- [ ] Vercel env variables set
- [ ] Test data cleaned up before launch
- [ ] `npm run build` passes locally
- [ ] Sign-up → OTP → currency setup → dashboard tested on production
- [ ] Add / delete income tested on production
- [ ] Password reset tested on production
- [ ] Two accounts verified to be isolated by RLS
- [ ] Realtime tested in two browser tabs

---

## 7. Project structure

```text
src/
  App.tsx                 route map, guards, providers
  components/
    art/                  custom 3D-style SVG illustrations
    charts/               DonutChart, TrendChart
    ui/                   Button, Input, Sheet, Avatar, etc.
  contexts/               Auth, Profile, Finance, Toast
  layouts/                AppShell, AuthShell, SetupShell, ConfigNotice
  lib/                    Supabase client, constants, formatting, errors
  pages/
    app/                  Dashboard, Expenses, AddExpense, Income,
                          AddIncome, Categories, Bills, Analytics, Profile
    auth/                 SignIn, SignUp, VerifyOtp, ForgotPassword,
                          ResetPassword, AuthCallback
    public/               Splash, Onboarding
    setup/                SetupCurrency, SetupBudget (edit-only)
    NotFound.tsx
  types.ts
supabase/migrations/001_init.sql
supabase/migrations/002_income.sql
```

---

## 8. Troubleshooting

**The app shows the setup notice**
- Confirm `.env.local` exists and `VITE_SUPABASE_URL` plus `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`) are set.
- Restart `npm run dev` after changing env values.

**“Email not confirmed” on sign-in**
- Confirmations are ON. Use the “Verify my email instead” link on the sign-in error, or resend the code from the OTP screen.

**OTP email has no 6-digit code**
- Edit the **Confirm signup** template and include `{{ .Token }}`. A magic link alone will not work with the OTP screen.

**“Email rate limit exceeded”**
- Supabase’s default SMTP is rate-limited. Wait, or configure custom SMTP (Resend recommended).

**Google sign-in redirects back with an error**
- The redirect URI in Google Cloud must be `https://<project-ref>.supabase.co/auth/v1/callback`.
- The app URL must be in Supabase **Redirect URLs** and Google **Authorized JavaScript origins**.
- `http://localhost:5173` and the Vercel domain are different origins; add both.

**Password reset says the link is inactive**
- Reset links are single-use and expire. Request a new one.
- Make sure `/reset-password` is in the Supabase redirect allow-list.

**`bucket not found` when uploading a receipt**
- Re-run the storage section of the migration, or create a private `receipts` bucket with an 8MB limit and image MIME types.

**RLS / permission errors**
- Re-run the migration. Every table policy must compare the owner column to `auth.uid()`.
- Do not disable RLS in production.

**Realtime does not update**
- Confirm `expenses`, `incomes`, and `bills` are in the `supabase_realtime` publication.
- Realtime requires the table to have a replica identity; the migrations set `full`.
- The app also refetches on focus of actions, so a refresh button is always available.

**Build fails after install**
- Node 20+ is required.
- If esbuild’s postinstall script was blocked, run `npm rebuild esbuild`, then `npm run build`.

---

## 9. Notes

- Currency switching changes the **label only**; it does not convert saved amounts. The setup screen states this clearly.
- Onboarding asks only for a currency. Income and budget are optional and can be added later from the dashboard, Income page, or Profile.
- Income entries and expenses are separate records. Both feed the dashboard, analytics, and monthly totals.
- Apple and Facebook sign-in buttons show a “coming soon” toast. Google and email auth are fully wired.
- Receipt images are compressed client-side before upload and opened with one-hour signed URLs.
- Demo mode is available when Supabase is not configured: choose **Preview with demo data** on the setup notice. In development it also works with Supabase configured if `localStorage['moneytrack.demo']` is `1`. Demo data (profile, expenses, incomes, bills) stays in this browser.
- No test data or credentials are included in this repository.

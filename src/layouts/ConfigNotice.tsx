import { ArrowRight, CheckCircle, Database, EnvelopeSimple, Sparkle, WarningCircle } from '@phosphor-icons/react'
import { Blobs } from '@/components/ui/Blobs'
import { Logo } from '@/components/ui/Logo'
import { WalletArt } from '@/components/art/Illustrations'
import { enterDemoMode } from '@/lib/demo'

const STEPS = [
  {
    title: 'Create a Supabase project',
    body: 'Open supabase.com, create one project, then copy the Project URL and anon public key from Project Settings → API.',
  },
  {
    title: 'Add your environment values',
    body: 'Copy .env.example to .env.local and fill in VITE_SUPABASE_URL plus VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy VITE_SUPABASE_ANON_KEY).',
  },
  {
    title: 'Run the database migrations',
    body: 'Open the Supabase SQL editor and run supabase/migrations/001_init.sql. If your project was created before income support, also run 002_income.sql.',
  },
  {
    title: 'Restart the dev server',
    body: 'Stop and run npm run dev again so Vite picks up the new environment variables.',
  },
]

export function ConfigNotice() {
  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <Blobs />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold text-amber-700">
            Setup required
          </span>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="animate-fade-up">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
              <WarningCircle size={15} weight="fill" />
              Supabase is not connected yet
            </p>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] text-slate-900 sm:text-5xl">
              One small setup, then your money app is live.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              MoneyTrack is ready, but it needs your own Supabase project before
              sign-in and data can work. No credentials are bundled with this app —
              that is intentional, so nothing leaks.
            </p>

            <div className="mt-7 rounded-[24px] border border-amber-200/70 bg-amber-50/80 p-5">
              <p className="flex items-start gap-2 text-[13px] font-semibold leading-relaxed text-amber-900">
                <WarningCircle size={18} weight="duotone" className="mt-0.5 shrink-0" />
                Until you add env values, the app shows this notice instead of the
                sign-in screen. Real accounts and data only work after Supabase is
                connected — but you can preview the interface with demo data that
                stays in this browser.
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-slate-200 shadow-xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <Database size={15} />
                .env.local
              </div>
              <pre className="overflow-x-auto text-[12px] leading-6 text-sky-200">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key`}
              </pre>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
              >
                Reload check
                <ArrowRight size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => enterDemoMode()}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-sky-200 bg-white px-5 text-sm font-extrabold text-sky-700 shadow-sm transition hover:bg-sky-50"
              >
                <Sparkle size={16} weight="fill" />
                Preview with demo data
              </button>
              <span className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600">
                <EnvelopeSimple size={17} weight="duotone" />
                Full guide: README.md
              </span>
            </div>
          </div>

          <div className="animate-fade-up rounded-[30px] border border-white/80 bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgba(2,132,199,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mb-5 w-full max-w-[220px]">
              <WalletArt className="w-full" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Setup checklist
            </h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 text-[11px] font-extrabold text-sky-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-slate-800">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-700">
              <CheckCircle size={17} weight="fill" />
              The SQL file is included in the repository.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft, House } from '@phosphor-icons/react'
import { Logo } from '@/components/ui/Logo'
import { Blobs } from '@/components/ui/Blobs'
import { EmptyArt } from '@/components/art/Illustrations'

export function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-10">
      <Blobs />
      <div className="relative z-10 w-full max-w-md text-center">
        <Logo className="justify-center" />
        <div className="mx-auto mt-6 w-56">
          <EmptyArt className="w-full" />
        </div>
        <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-sky-600">
          404 · Not found
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">
          This page slipped away.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The link may be old, or the page may have moved. Your money data is safe.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            to="/home"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-extrabold text-white transition hover:bg-sky-700"
          >
            <House size={16} weight="duotone" />
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} weight="bold" />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}

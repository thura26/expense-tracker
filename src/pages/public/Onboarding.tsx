import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CaretLeft } from '@phosphor-icons/react'
import { Blobs } from '@/components/ui/Blobs'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ReceiptArt, TargetArt, WalletArt } from '@/components/art/Illustrations'
import { ONBOARDED_KEY } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    eyebrow: 'Track money in and out',
    title: 'Know where every kyat goes.',
    body: 'Log spending and income in seconds, attach a receipt, and see the full picture without a spreadsheet.',
    art: <WalletArt className="w-full" />,
  },
  {
    eyebrow: 'Stay on budget',
    title: 'Set a budget you can actually keep.',
    body: 'Split your monthly budget across food, transport, shopping, bills, and everything else.',
    art: <TargetArt className="w-full" />,
  },
  {
    eyebrow: 'Never miss a bill',
    title: 'Manage your expenses with less worry.',
    body: 'Get a heads-up before bills are due, mark them paid, and watch your balance update.',
    art: <ReceiptArt className="w-full" />,
  },
]

export function Onboarding() {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()
  const slide = SLIDES[index]!
  const last = index === SLIDES.length - 1

  function finish() {
    localStorage.setItem(ONBOARDED_KEY, '1')
    navigate(user ? '/home' : '/signin', { replace: true })
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-5 sm:px-6 lg:px-10">
      <Blobs />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="MoneyTrack home">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={finish}
            className="rounded-full px-4 py-2 text-xs font-extrabold text-slate-400 transition hover:bg-white hover:text-sky-700"
          >
            Skip
          </button>
        </div>

        <div className="flex flex-1 items-center py-6">
          <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div
              key={`art-${index}`}
              className="animate-fade-up relative mx-auto w-full max-w-md overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br from-sky-100 via-white to-cyan-50 p-5 shadow-[0_30px_80px_-40px_rgba(2,132,199,0.5)] sm:p-8"
            >
              <div className="absolute inset-0 soft-grid opacity-40" />
              <div className="relative">{slide.art}</div>
            </div>

            <div key={`copy-${index}`} className="animate-fade-up">
              <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                {slide.eyebrow}
              </p>
              <h1 className="text-balance text-[34px] font-extrabold leading-[1.05] tracking-[-0.05em] text-slate-900 sm:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
                {slide.body}
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {SLIDES.map((item, dotIndex) => (
                    <button
                      key={item.eyebrow}
                      type="button"
                      onClick={() => setIndex(dotIndex)}
                      aria-label={`Go to slide ${dotIndex + 1}`}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        dotIndex === index
                          ? 'w-7 bg-sky-600'
                          : 'w-2 bg-sky-200 hover:bg-sky-300',
                      )}
                    />
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {index > 0 && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setIndex((current) => current - 1)}
                      leftIcon={<CaretLeft size={16} weight="bold" />}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    size="md"
                    onClick={() => (last ? finish() : setIndex((current) => current + 1))}
                    rightIcon={<ArrowRight size={16} weight="bold" />}
                  >
                    {last ? 'Get started' : 'Next'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-slate-400">
          Already have an account?{' '}
          <Link to="/signin" className="font-extrabold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

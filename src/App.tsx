import { useEffect, type ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext'
import { FinanceProvider } from '@/contexts/FinanceContext'
import { ConfigNotice } from '@/layouts/ConfigNotice'
import { AppShell } from '@/layouts/AppShell'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { Splash } from '@/pages/public/Splash'
import { Onboarding } from '@/pages/public/Onboarding'
import { SignIn } from '@/pages/auth/SignIn'
import { SignUp } from '@/pages/auth/SignUp'
import { VerifyOtp } from '@/pages/auth/VerifyOtp'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { AuthCallback } from '@/pages/auth/AuthCallback'
import { SetupCurrency } from '@/pages/setup/SetupCurrency'
import { SetupBudget } from '@/pages/setup/SetupBudget'
import { Dashboard } from '@/pages/app/Dashboard'
import { Expenses } from '@/pages/app/Expenses'
import { AddExpense } from '@/pages/app/AddExpense'
import { Income } from '@/pages/app/Income'
import { AddIncome } from '@/pages/app/AddIncome'
import { Categories } from '@/pages/app/Categories'
import { Bills } from '@/pages/app/Bills'
import { Analytics } from '@/pages/app/Analytics'
import { Profile } from '@/pages/app/Profile'
import { NotFound } from '@/pages/NotFound'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader label="Checking your session…" />
  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

function RequireSetup({ children }: { children: ReactNode }) {
  const { profile, loading } = useProfile()

  if (loading) return <FullScreenLoader label="Loading your money…" />
  if (!profile?.setupComplete) {
    return <Navigate to="/setup/currency" replace />
  }
  return <>{children}</>
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  if (loading) return <FullScreenLoader label="Checking your session…" />
  if (user) {
    if (profileLoading) return <FullScreenLoader label="Loading your money…" />
    return (
      <Navigate
        to={profile?.setupComplete ? '/home' : '/setup/currency'}
        replace
      />
    )
  }
  return <>{children}</>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  if (!isSupabaseConfigured && !isDemoMode) {
    return <ConfigNotice />
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <ProfileProvider>
          <FinanceProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route
                  path="/signin"
                  element={
                    <PublicOnly>
                      <SignIn />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicOnly>
                      <SignUp />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/verify-otp"
                  element={
                    <PublicOnly>
                      <VerifyOtp />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnly>
                      <ForgotPassword />
                    </PublicOnly>
                  }
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route
                  path="/setup/currency"
                  element={
                    <RequireAuth>
                      <SetupCurrency />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/setup/budget"
                  element={
                    <RequireAuth>
                      <RequireSetup>
                        <SetupBudget />
                      </RequireSetup>
                    </RequireAuth>
                  }
                />

                <Route
                  element={
                    <RequireAuth>
                      <RequireSetup>
                        <AppShell />
                      </RequireSetup>
                    </RequireAuth>
                  }
                >
                  <Route path="home" element={<Dashboard />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="expenses/new" element={<AddExpense />} />
                  <Route path="income" element={<Income />} />
                  <Route path="income/new" element={<AddIncome />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="bills" element={<Bills />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FinanceProvider>
        </ProfileProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

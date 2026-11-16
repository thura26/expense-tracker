import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { addMonths, addWeeks, format, parseISO } from 'date-fns'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  isDemoMode,
  loadDemoBills,
  loadDemoExpenses,
  loadDemoIncomes,
  saveDemoBills,
  saveDemoExpenses,
  saveDemoIncomes,
} from '@/lib/demo'
import { buildReceiptPath, compressImage } from '@/lib/receipts'
import { safeNumber } from '@/lib/format'
import type {
  Bill,
  BillFrequency,
  BillRow,
  CategoryId,
  Expense,
  ExpenseRow,
  Income,
  IncomeRow,
  IncomeSourceId,
  NewBill,
  NewExpense,
  NewIncome,
} from '@/types'
import { useAuth } from './AuthContext'

interface FinanceContextValue {
  expenses: Expense[]
  incomes: Income[]
  bills: Bill[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
  addExpense: (input: NewExpense) => Promise<void>
  deleteExpense: (expense: Expense) => Promise<void>
  addIncome: (input: NewIncome) => Promise<void>
  deleteIncome: (income: Income) => Promise<void>
  addBill: (input: NewBill) => Promise<void>
  updateBill: (bill: Bill, input: NewBill) => Promise<void>
  deleteBill: (bill: Bill) => Promise<void>
  markBillPaid: (bill: Bill) => Promise<void>
  getReceiptUrl: (path: string) => Promise<string | null>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

function fromExpenseRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: safeNumber(row.amount),
    category: row.category as CategoryId,
    date: row.date,
    paymentMethod: row.payment_method,
    note: row.note ?? '',
    receiptPath: row.receipt_path,
    createdAt: row.created_at,
  }
}

function fromIncomeRow(row: IncomeRow): Income {
  return {
    id: row.id,
    amount: safeNumber(row.amount),
    source: row.source as IncomeSourceId,
    date: row.date,
    note: row.note ?? '',
    createdAt: row.created_at,
  }
}

function fromBillRow(row: BillRow): Bill {
  return {
    id: row.id,
    title: row.title,
    amount: safeNumber(row.amount),
    dueDate: row.due_date,
    frequency: row.frequency as BillFrequency,
    category: row.category as CategoryId,
    active: row.active,
    lastPaidAt: row.last_paid_at,
    createdAt: row.created_at,
  }
}

function nextDueDate(dueDate: string, frequency: BillFrequency) {
  if (frequency === 'once') return dueDate
  const today = new Date()
  let cursor = parseISO(dueDate)
  if (Number.isNaN(cursor.getTime())) cursor = today
  do {
    cursor =
      frequency === 'monthly' ? addMonths(cursor, 1) : addWeeks(cursor, 1)
  } while (cursor.getTime() <= today.getTime())
  return format(cursor, 'yyyy-MM-dd')
}

function demoId(prefix: string) {
  const unique =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `demo-${prefix}-${unique}`
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  const loadAll = useCallback(async () => {
    if (!user) {
      setExpenses([])
      setIncomes([])
      setBills([])
      setLoading(false)
      hasLoadedRef.current = false
      return
    }

    if (isDemoMode) {
      setExpenses(
        [...loadDemoExpenses()].sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
        ),
      )
      setIncomes(
        [...loadDemoIncomes()].sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
        ),
      )
      setBills(
        [...loadDemoBills()].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      )
      setError(null)
      setLoading(false)
      setRefreshing(false)
      hasLoadedRef.current = true
      return
    }

    if (!isSupabaseConfigured) {
      setExpenses([])
      setIncomes([])
      setBills([])
      setLoading(false)
      hasLoadedRef.current = false
      return
    }

    if (hasLoadedRef.current) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const errors: string[] = []
      const [expenseResult, incomeResult, billResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.uid)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('incomes')
          .select('*')
          .eq('user_id', user.uid)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.uid)
          .order('due_date', { ascending: true }),
      ])

      if (expenseResult.error) {
        errors.push(`Expenses: ${expenseResult.error.message}`)
      } else {
        setExpenses((expenseResult.data as ExpenseRow[]).map(fromExpenseRow))
      }

      if (incomeResult.error) {
        errors.push(`Income: ${incomeResult.error.message}`)
      } else {
        setIncomes((incomeResult.data as IncomeRow[]).map(fromIncomeRow))
      }

      if (billResult.error) {
        errors.push(`Bills: ${billResult.error.message}`)
      } else {
        setBills((billResult.data as BillRow[]).map(fromBillRow))
      }

      hasLoadedRef.current = true
      if (errors.length > 0) throw new Error(errors.join(' '))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load your money.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!user || !isSupabaseConfigured || isDemoMode) return

    const channel = supabase
      .channel(`finance:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.uid}`,
        },
        () => {
          void loadAll()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incomes',
          filter: `user_id=eq.${user.uid}`,
        },
        () => {
          void loadAll()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `user_id=eq.${user.uid}`,
        },
        () => {
          void loadAll()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, loadAll])

  const addExpense = useCallback(
    async (input: NewExpense) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        // Receipt files are not uploaded in demo mode; everything else persists
        // to localStorage so the preview behaves like the real app.
        const expense: Expense = {
          id: demoId('exp'),
          amount: input.amount,
          category: input.category,
          date: input.date,
          paymentMethod: input.paymentMethod,
          note: input.note?.trim() || '',
          receiptPath: null,
          createdAt: new Date().toISOString(),
        }
        const next = [expense, ...expenses]
        setExpenses(next)
        saveDemoExpenses(next)
        return
      }

      let uploadedPath: string | null = null

      try {
        if (input.receiptFile) {
          const file = await compressImage(input.receiptFile)
          const path = buildReceiptPath(user.uid, file)
          const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(path, file, { cacheControl: '3600', upsert: false })
          if (uploadError) throw uploadError
          uploadedPath = path
        }

        const { error: insertError } = await supabase.from('expenses').insert({
          user_id: user.uid,
          amount: input.amount,
          category: input.category,
          date: input.date,
          payment_method: input.paymentMethod,
          note: input.note?.trim() || null,
          receipt_path: uploadedPath,
        })
        if (insertError) throw insertError
      } catch (insertError) {
        if (uploadedPath) {
          await supabase.storage.from('receipts').remove([uploadedPath])
        }
        throw insertError
      }

      await loadAll()
    },
    [user, loadAll, expenses],
  )

  const deleteExpense = useCallback(
    async (expense: Expense) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const next = expenses.filter((item) => item.id !== expense.id)
        setExpenses(next)
        saveDemoExpenses(next)
        return
      }

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)
        .eq('user_id', user.uid)
      if (deleteError) throw deleteError

      if (expense.receiptPath) {
        await supabase.storage.from('receipts').remove([expense.receiptPath])
      }
      await loadAll()
    },
    [user, loadAll, expenses],
  )

  const addIncome = useCallback(
    async (input: NewIncome) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const income: Income = {
          id: demoId('inc'),
          amount: input.amount,
          source: input.source,
          date: input.date,
          note: input.note?.trim() || '',
          createdAt: new Date().toISOString(),
        }
        const next = [income, ...incomes]
        setIncomes(next)
        saveDemoIncomes(next)
        return
      }

      const { error: insertError } = await supabase.from('incomes').insert({
        user_id: user.uid,
        amount: input.amount,
        source: input.source,
        date: input.date,
        note: input.note?.trim() || null,
      })
      if (insertError) throw insertError
      await loadAll()
    },
    [user, loadAll, incomes],
  )

  const deleteIncome = useCallback(
    async (income: Income) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const next = incomes.filter((item) => item.id !== income.id)
        setIncomes(next)
        saveDemoIncomes(next)
        return
      }

      const { error: deleteError } = await supabase
        .from('incomes')
        .delete()
        .eq('id', income.id)
        .eq('user_id', user.uid)
      if (deleteError) throw deleteError
      await loadAll()
    },
    [user, loadAll, incomes],
  )

  const addBill = useCallback(
    async (input: NewBill) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const bill: Bill = {
          id: demoId('bill'),
          title: input.title.trim(),
          amount: input.amount,
          dueDate: input.dueDate,
          frequency: input.frequency,
          category: input.category,
          active: true,
          lastPaidAt: null,
          createdAt: new Date().toISOString(),
        }
        const next = [...bills, bill]
        setBills(next)
        saveDemoBills(next)
        return
      }

      const { error: insertError } = await supabase.from('bills').insert({
        user_id: user.uid,
        title: input.title.trim(),
        amount: input.amount,
        due_date: input.dueDate,
        frequency: input.frequency,
        category: input.category,
        active: true,
      })
      if (insertError) throw insertError
      await loadAll()
    },
    [user, loadAll, bills],
  )

  const updateBill = useCallback(
    async (bill: Bill, input: NewBill) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const next = bills.map((item) =>
          item.id === bill.id
            ? { ...item, ...input, title: input.title.trim() }
            : item,
        )
        setBills(next)
        saveDemoBills(next)
        return
      }

      const { error: updateError } = await supabase
        .from('bills')
        .update({
          title: input.title.trim(),
          amount: input.amount,
          due_date: input.dueDate,
          frequency: input.frequency,
          category: input.category,
        })
        .eq('id', bill.id)
        .eq('user_id', user.uid)
      if (updateError) throw updateError
      await loadAll()
    },
    [user, loadAll, bills],
  )

  const deleteBill = useCallback(
    async (bill: Bill) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const next = bills.filter((item) => item.id !== bill.id)
        setBills(next)
        saveDemoBills(next)
        return
      }

      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', bill.id)
        .eq('user_id', user.uid)
      if (deleteError) throw deleteError
      await loadAll()
    },
    [user, loadAll, bills],
  )

  const markBillPaid = useCallback(
    async (bill: Bill) => {
      if (!user) throw new Error('You need to sign in first.')

      if (isDemoMode) {
        const paidAt = new Date().toISOString()
        const expense: Expense = {
          id: demoId('exp'),
          amount: bill.amount,
          category: bill.category,
          date: format(new Date(), 'yyyy-MM-dd'),
          paymentMethod: 'Bill payment',
          note: `Bill: ${bill.title}`,
          receiptPath: null,
          createdAt: paidAt,
        }
        const nextExpenses = [expense, ...expenses]
        const nextBills = bills.map((item) =>
          item.id === bill.id
            ? {
                ...item,
                active: item.frequency !== 'once',
                dueDate: nextDueDate(item.dueDate, item.frequency),
                lastPaidAt: paidAt,
              }
            : item,
        )
        setExpenses(nextExpenses)
        setBills(nextBills)
        saveDemoExpenses(nextExpenses)
        saveDemoBills(nextBills)
        return
      }

      const { error: rpcError } = await supabase.rpc('mark_bill_paid', {
        p_bill_id: bill.id,
      })

      if (!rpcError) {
        await loadAll()
        return
      }

      const missingFunction =
        rpcError.code === 'PGRST202' ||
        rpcError.code === '42883' ||
        /could not find the function|does not exist/i.test(rpcError.message)

      if (!missingFunction) throw rpcError

      // Fallback for projects that have not run the SQL migration yet.
      const { error: insertError } = await supabase.from('expenses').insert({
        user_id: user.uid,
        amount: bill.amount,
        category: bill.category,
        date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'Bill payment',
        note: `Bill: ${bill.title}`,
      })
      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from('bills')
        .update({
          active: bill.frequency !== 'once',
          due_date: nextDueDate(bill.dueDate, bill.frequency),
          last_paid_at: new Date().toISOString(),
        })
        .eq('id', bill.id)
        .eq('user_id', user.uid)
      if (updateError) throw updateError

      await loadAll()
    },
    [user, loadAll, bills, expenses],
  )

  const getReceiptUrl = useCallback(async (path: string) => {
    if (isDemoMode) return null
    const { data, error: signedError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 60 * 60)
    if (signedError) throw signedError
    return data?.signedUrl ?? null
  }, [])

  const value = useMemo<FinanceContextValue>(
    () => ({
      expenses,
      incomes,
      bills,
      loading,
      refreshing,
      error,
      refresh: loadAll,
      addExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addBill,
      updateBill,
      deleteBill,
      markBillPaid,
      getReceiptUrl,
    }),
    [
      expenses,
      incomes,
      bills,
      loading,
      refreshing,
      error,
      loadAll,
      addExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addBill,
      updateBill,
      deleteBill,
      markBillPaid,
      getReceiptUrl,
    ],
  )

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinance must be used inside FinanceProvider')
  return context
}

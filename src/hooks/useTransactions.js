// ============================================================
// useTransactions — Fetch transactions with related data
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { todayString, getPeriodDates } from '@/lib/utils'

const TRANSACTION_SELECT = `
  *,
  wallet:wallets!transactions_wallet_id_fkey(id, name, color, type),
  from_wallet:wallets!transactions_from_wallet_id_fkey(id, name, color),
  to_wallet:wallets!transactions_to_wallet_id_fkey(id, name, color),
  group:budget_groups!transactions_group_id_fkey(id, name, color),
  category:budget_categories!transactions_category_id_fkey(id, name, icon)
`

export function useTransactions({ limit = null, periodOnly = false, settings = null } = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [todayStats, setTodayStats] = useState({ income: 0, expense: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('transactions')
        .select(TRANSACTION_SELECT)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (periodOnly && settings) {
        const period = getPeriodDates(settings)
        query = query.gte('date', period.start).lte('date', period.end)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: txErr } = await query
      if (txErr) throw txErr

      setTransactions(data || [])

      // Compute today's stats
      const today = todayString()
      const todayTx = (data || []).filter(tx => tx.date === today)
      const incomeToday = todayTx
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      const expenseToday = todayTx
        .filter(tx => ['expense', 'savings'].includes(tx.type))
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      setTodayStats({ income: incomeToday, expense: expenseToday })

    } catch (err) {
      console.error('useTransactions error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, limit, periodOnly, settings])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (txData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...txData, user_id: user.id })
      .select(TRANSACTION_SELECT)
      .single()

    if (!error) {
      setTransactions(prev => [data, ...prev])

      // Update wallet balance
      if (txData.type === 'expense' || txData.type === 'savings') {
        await supabase.rpc('decrement_wallet_balance', {
          p_wallet_id: txData.wallet_id,
          p_amount: txData.amount
        }).catch(() => {
          supabase.from('wallets')
            .select('balance')
            .eq('id', txData.wallet_id)
            .single()
            .then(({ data: w }) => {
              if (w) supabase.from('wallets')
                .update({ balance: Number(w.balance) - Number(txData.amount) })
                .eq('id', txData.wallet_id)
            })
        })
      } else if (txData.type === 'income') {
        await supabase.from('wallets')
          .select('balance')
          .eq('id', txData.wallet_id)
          .single()
          .then(({ data: w }) => {
            if (w) supabase.from('wallets')
              .update({ balance: Number(w.balance) + Number(txData.amount) })
              .eq('id', txData.wallet_id)
          })
      } else if (txData.type === 'transfer') {
        const [fromW, toW] = await Promise.all([
          supabase.from('wallets').select('balance').eq('id', txData.from_wallet_id).single(),
          supabase.from('wallets').select('balance').eq('id', txData.to_wallet_id).single(),
        ])
        if (fromW.data) {
          await supabase.from('wallets')
            .update({ balance: Number(fromW.data.balance) - Number(txData.amount) - Number(txData.transfer_fee || 0) })
            .eq('id', txData.from_wallet_id)
        }
        if (toW.data) {
          await supabase.from('wallets')
            .update({ balance: Number(toW.data.balance) + Number(txData.amount) })
            .eq('id', txData.to_wallet_id)
        }
      }
    }

    return { data, error }
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions(prev => prev.filter(tx => tx.id !== id))
    return { error }
  }

  return {
    transactions,
    todayStats,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    deleteTransaction,
  }
}

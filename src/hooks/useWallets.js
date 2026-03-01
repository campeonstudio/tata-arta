// ============================================================
// useWallets — Fetch and manage wallets
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'

export function useWallets() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWallets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')

    if (err) {
      setError(err.message)
    } else {
      setWallets(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0)

  const addWallet = async (walletData) => {
    const { data, error } = await supabase
      .from('wallets')
      .insert({ ...walletData, user_id: user.id, sort_order: wallets.length })
      .select()
      .single()
    if (!error) setWallets(prev => [...prev, data])
    return { data, error }
  }

  const updateWallet = async (id, updates) => {
    const { data, error } = await supabase
      .from('wallets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) setWallets(prev => prev.map(w => w.id === id ? data : w))
    return { data, error }
  }

  const deleteWallet = async (id) => {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (!error) setWallets(prev => prev.filter(w => w.id !== id))
    return { error }
  }

  return {
    wallets,
    totalBalance,
    loading,
    error,
    refetch: fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
  }
}

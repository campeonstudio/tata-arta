// ============================================================
// useBudget — Fetch budget settings, groups, categories
// + compute spent per group for current period
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { getPeriodDates } from '@/lib/utils'

export function useBudget() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(null)
  const [groups, setGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [spentByGroup, setSpentByGroup] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      // 1. Budget settings
      const { data: settingsData, error: sErr } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (sErr) throw sErr

      // 2. Budget groups
      const { data: groupsData, error: gErr } = await supabase
        .from('budget_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      if (gErr) throw gErr

      // 3. Budget categories
      const { data: catsData, error: cErr } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      if (cErr) throw cErr

      // 4. Compute spent per group for current period
      const period = getPeriodDates(settingsData)
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('group_id, amount, type')
        .eq('user_id', user.id)
        .in('type', ['expense', 'savings'])
        .gte('date', period.start)
        .lte('date', period.end)
      if (txErr) throw txErr

      const spent = {}
      ;(txData || []).forEach(tx => {
        if (tx.group_id) {
          spent[tx.group_id] = (spent[tx.group_id] || 0) + Number(tx.amount)
        }
      })

      setSettings(settingsData)
      setGroups(groupsData || [])
      setCategories(catsData || [])
      setSpentByGroup(spent)
    } catch (err) {
      console.error('useBudget error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Derived: groups with budget amounts and spent amounts
  const groupsWithStats = groups.map(g => {
    const budgetAmount = ((g.percentage / 100) * Number(settings?.income || 0))
    const spent = spentByGroup[g.id] || 0
    const remaining = budgetAmount - spent
    const percentUsed = budgetAmount > 0 ? Math.min(100, (spent / budgetAmount) * 100) : 0
    const isOverBudget = spent > budgetAmount

    return {
      ...g,
      budgetAmount,
      spent,
      remaining,
      percentUsed,
      isOverBudget,
      categoriesInGroup: categories.filter(c => c.group_id === g.id),
    }
  })

  return {
    settings,
    groups,
    groupsWithStats,
    categories,
    spentByGroup,
    loading,
    error,
    refetch: fetchAll,
  }
}

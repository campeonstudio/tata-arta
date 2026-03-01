import { useState } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { formatCurrency } from '@/lib/utils'
import { WALLET_COLORS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import styles from './BudgetPage.module.css'

export default function BudgetPage() {
  const { user } = useAuth()
  const { settings, groupsWithStats, categories, loading, refetch } = useBudget()
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [addingCategoryTo, setAddingCategoryTo] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [saving, setSaving] = useState(false)

  const currency = settings?.currency || 'IDR'
  const income = Number(settings?.income || 0)

  const handleSaveGroup = async (group) => {
    setSaving(true)
    await supabase
      .from('budget_groups')
      .update({
        name: group.name,
        percentage: group.percentage,
        color: group.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', group.id)
    setSaving(false)
    setEditingGroup(null)
    refetch()
  }

  const handleAddCategory = async (groupId) => {
    if (!newCategoryName.trim()) return
    setSaving(true)
    await supabase.from('budget_categories').insert({
      user_id: user.id,
      group_id: groupId,
      name: newCategoryName.trim(),
      sort_order: categories.filter(c => c.group_id === groupId).length,
    })
    setNewCategoryName('')
    setAddingCategoryTo(null)
    setSaving(false)
    refetch()
  }

  const handleDeleteCategory = async (catId) => {
    await supabase.from('budget_categories').delete().eq('id', catId)
    refetch()
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Budget</h1>
        {settings && (
          <p className={styles.incomeHint}>
            Based on {formatCurrency(income, currency)} / {settings.pay_cycle}
          </p>
        )}
      </div>

      <div className={styles.groups}>
        {groupsWithStats.map(group => {
          const isEditing = editingGroup?.id === group.id
          const isExpanded = expandedGroup === group.id
          const groupCats = group.categoriesInGroup || []

          return (
            <div key={group.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Group header */}
              <div
                className={styles.groupHeader}
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
              >
                <div className={styles.groupLeft}>
                  <span className={styles.groupDot} style={{ background: group.color }} />
                  <div>
                    <p className={styles.groupName}>{group.name}</p>
                    <p className={styles.groupSub}>
                      {group.percentage}% · {formatCurrency(group.budgetAmount, currency)}/period
                    </p>
                  </div>
                </div>
                <div className={styles.groupRight}>
                  <div className={styles.groupProgress}>
                    <div
                      className={styles.groupProgressFill}
                      style={{
                        width: `${group.percentUsed}%`,
                        background: group.isOverBudget ? '#B07A6E' : group.color,
                      }}
                    />
                  </div>
                  <p className={`${styles.groupRemaining} ${group.isOverBudget ? styles.over : ''}`}>
                    {group.isOverBudget
                      ? `−${formatCurrency(group.spent - group.budgetAmount, currency)}`
                      : `${formatCurrency(group.remaining, currency)} left`
                    }
                  </p>
                  <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>›</span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className={styles.groupExpanded}>
                  {/* Edit group */}
                  {isEditing ? (
                    <div className={styles.editForm}>
                      <div className="input-group">
                        <label className="input-label">Group name</label>
                        <input
                          className="input"
                          value={editingGroup.name}
                          onChange={e => setEditingGroup(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="input-group" style={{ marginTop: 'var(--space-3)' }}>
                        <label className="input-label">Percentage</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <input
                            className="input"
                            type="number"
                            min="0"
                            max="100"
                            value={editingGroup.percentage}
                            onChange={e => setEditingGroup(prev => ({ ...prev, percentage: Number(e.target.value) }))}
                            style={{ width: 100 }}
                          />
                          <span className={styles.amountPreview}>
                            = {formatCurrency((editingGroup.percentage / 100) * income, currency)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.colorPicker}>
                        {WALLET_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`${styles.colorSwatch} ${editingGroup.color === c ? styles.colorSwatchActive : ''}`}
                            style={{ background: c }}
                            onClick={() => setEditingGroup(prev => ({ ...prev, color: c }))}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                        <button className="btn btn-secondary" onClick={() => setEditingGroup(null)}>Cancel</button>
                        <button className="btn btn-primary" onClick={() => handleSaveGroup(editingGroup)} disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingGroup({ ...group })}
                    >
                      ✏ Edit group
                    </button>
                  )}

                  {/* Categories */}
                  <div className={styles.categories}>
                    <p className={styles.catLabel}>Categories</p>
                    {groupCats.length === 0 ? (
                      <p className={styles.noCats}>No categories yet.</p>
                    ) : (
                      groupCats.map(cat => (
                        <div key={cat.id} className={styles.catItem}>
                          <span>{cat.icon && `${cat.icon} `}{cat.name}</span>
                          <button
                            className={styles.catDelete}
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}

                    {/* Add category */}
                    {addingCategoryTo === group.id ? (
                      <div className={styles.addCatForm}>
                        <input
                          className="input"
                          placeholder="Category name"
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddCategory(group.id)}
                          autoFocus
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddCategory(group.id)}
                          disabled={!newCategoryName.trim() || saving}
                        >
                          Add
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setAddingCategoryTo(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 'var(--space-2)' }}
                        onClick={() => setAddingCategoryTo(group.id)}
                      >
                        + Add category
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total allocation check */}
      {groupsWithStats.length > 0 && (
        <div className={`card-inset ${styles.totalCheck}`}>
          <span className={styles.totalLabel}>Total allocated</span>
          <span className={`${styles.totalValue} ${
            groupsWithStats.reduce((s, g) => s + g.percentage, 0) === 100
              ? styles.totalOk : styles.totalWarn
          }`}>
            {groupsWithStats.reduce((s, g) => s + g.percentage, 0)}%
          </span>
        </div>
      )}
    </div>
  )
}

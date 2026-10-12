'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { budgetService } from '../../services/budgetService'
import { Budget, BudgetCategoryLimit } from '../../types/Api.types'

const CATEGORIES = ['Groceries', 'Dining', 'Transport', 'Shopping', 'Bills'] // replace with real list later

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [rows, setRows] = useState<BudgetCategoryLimit[]>([{ category: CATEGORIES[0], limit: 0 }])
  const [error, setError] = useState('')

  const load = () => budgetService.getBudgets().then(r => setBudgets(r.budgets))
  useEffect(() => { load() }, [])

  const total = rows.reduce((s, r) => s + (Number(r.limit) || 0), 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !start || !end) return setError('Fill in name and dates.')
    if (new Date(end) <= new Date(start)) return setError('End date must be after start date.')
    if (total <= 0) return setError('Add at least one category limit.')
    setError('')
    await budgetService.createBudget({
      name, startDate: start, endDate: end, totalAmount: total,
      categories: rows, alertThresholds: [80, 100], emailAlerts: true,
    })
    setShowForm(false); setName(''); setRows([{ category: CATEGORIES[0], limit: 0 }])
    load()
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Budgets</h1>
      <button onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : '+ New budget'}</button>

      {showForm && (
        <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 420, margin: '16px 0' }}>
          <input placeholder="Budget name" value={name} onChange={e => setName(e.target.value)} />
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <select value={r.category}
                onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" min={0} value={r.limit}
                onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, limit: Number(e.target.value) } : x))} />
            </div>
          ))}
          <button type="button" onClick={() => setRows([...rows, { category: CATEGORIES[0], limit: 0 }])}>+ Add category</button>
          <strong>Total: {total}</strong>
          {error && <span style={{ color: 'red' }}>{error}</span>}
          <button type="submit">Save budget</button>
        </form>
      )}

      <ul>
        {budgets.map(b => (
          <li key={b.id}>
            <Link href={`/budgets/${b.id}`}>{b.name}</Link> · {b.startDate} → {b.endDate} · {b.totalAmount} · {b.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
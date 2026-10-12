'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { budgetService } from '../../../services/budgetService'
import { BudgetSummary, CategoryPieItem } from '../../../types/Api.types'

function Pie2({ title, data }: { title: string; data: CategoryPieItem[] }) {
  return (
    <div style={{ flex: 1, height: 300 }}>
      <h3>{title}</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95}>
            {data.map(d => <Cell key={d.label} fill={d.color} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function BudgetDetail({ params }: { params: { id: string } }) {
  const [s, setS] = useState<BudgetSummary | null>(null)
  useEffect(() => { budgetService.getBudgetSummary(params.id).then(setS) }, [params.id])
  if (!s) return <p style={{ padding: 24 }}>Loading…</p>

  return (
    <div style={{ padding: 24 }}>
      <h1>{s.budget.name}</h1>
      <p>{s.totalSpent} of {s.budget.totalAmount} spent ({s.percentUsed}%) · {s.daysLeft} days left</p>

      {s.categories.map(c => (
        <div key={c.category} style={{ margin: '8px 0' }}>
          {c.category}: {c.spent} / {c.limit}
          <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
            <div style={{
              width: `${Math.min(c.percentUsed, 100)}%`, height: 8, borderRadius: 4,
              background: c.percentUsed >= 100 ? '#ef4444' : c.percentUsed >= 80 ? '#f59e0b' : '#22c55e',
            }} />
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 24 }}>
        <Pie2 title="Planned" data={s.plannedPie} />
        <Pie2 title="Actual" data={s.actualPie} />
      </div>
    </div>
  )
}
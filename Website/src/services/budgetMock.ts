import { Budget, BudgetSummary, BudgetsResponse, CreateBudgetPayload } from '../types/Api.types'

const COLORS: Record<string, string> = {
  Groceries: '#22c55e', Dining: '#f59e0b', Transport: '#6366f1',
  Shopping: '#ef4444', Bills: '#06b6d4',
}

let budgets: Budget[] = [
  {
    id: 'b1', name: 'October Budget',
    startDate: '2026-10-01', endDate: '2026-10-31',
    totalAmount: 30000,
    categories: [
      { category: 'Groceries', limit: 10000 },
      { category: 'Dining',    limit: 5000 },
      { category: 'Transport', limit: 4000 },
      { category: 'Shopping',  limit: 6000 },
      { category: 'Bills',     limit: 5000 },
    ],
    alertThresholds: [80, 100], emailAlerts: true, status: 'active',
  },
]

const spentMock: Record<string, number> = {
  Groceries: 8200, Dining: 4600, Transport: 1800, Shopping: 2500, Bills: 5000,
}

export const mock = {
  getBudgets(): BudgetsResponse {
    return {
      budgets,
      totalBudget: budgets.reduce((s, b) => s + b.totalAmount, 0),
      totalSpent: Object.values(spentMock).reduce((s, v) => s + v, 0),
    }
  },
  create(p: CreateBudgetPayload): Budget {
    const b: Budget = { ...p, id: 'b' + Date.now(), status: 'active' }
    budgets = [b, ...budgets]
    return b
  },
  summary(id: string): BudgetSummary {
    const budget = budgets.find(b => b.id === id) ?? budgets[0]
    const categories = budget.categories.map(c => {
      const spent = spentMock[c.category] ?? 0
      return { category: c.category, limit: c.limit, spent, percentUsed: Math.round((spent / c.limit) * 100) }
    })
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0)
    const pie = (key: 'limit' | 'spent') =>
      categories.map(c => ({ label: c.category, value: c[key], color: COLORS[c.category] ?? '#999' }))
    return {
      budget, totalSpent,
      percentUsed: Math.round((totalSpent / budget.totalAmount) * 100),
      daysLeft: 19, categories,
      plannedPie: pie('limit'), actualPie: pie('spent'),
    }
  },
}
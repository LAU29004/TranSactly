import { dashboardService } from './dashboardService'
import {
  Budget, BudgetStatus, BudgetSummary, BudgetsResponse,
  CategoryPieItem, CreateBudgetPayload, Transaction,
} from '../types/Api.types'

const STORE_KEY = 'centfluence_budgets'
const PALETTE = ['#F5A800', '#6EE7A0', '#F87171', '#60A5FA', '#C084FC', '#FB923C', '#2DD4BF', '#FACC15', '#F472B6', '#A3E635']

// ─── storage ─────────────────────────────────────────────────────────────────
const read = (): Budget[] => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] }
}
const write = (b: Budget[]) => localStorage.setItem(STORE_KEY, JSON.stringify(b))

// ─── calculations ────────────────────────────────────────────────────────────
const startOf = (d: string) => new Date(`${d}T00:00:00`)
const endOf   = (d: string) => new Date(`${d}T23:59:59.999`)

function spentByCategory(b: Budget, txs: Transaction[]): Record<string, number> {
  const from = startOf(b.startDate).getTime()
  const to   = endOf(b.endDate).getTime()
  const out: Record<string, number> = {}
  for (const t of txs) {
    if (t.type !== 'debit') continue
    const when = new Date(t.dateVal).getTime()
    if (when < from || when > to) continue
    out[t.category] = (out[t.category] ?? 0) + Math.abs(t.amount)
  }
  return out
}

function statusOf(b: Budget, spent: Record<string, number>): BudgetStatus {
  const total = Object.values(spent).reduce((s, v) => s + v, 0)
  const anyOver = b.categories.some(c => (spent[c.category] ?? 0) > c.limit)
  const over = total > b.totalAmount || anyOver
  if (new Date() > endOf(b.endDate)) return over ? 'exceeded' : 'completed'
  return 'active'
}

const colorFor = (cat: string, all: string[]) =>
  PALETTE[Math.max(0, all.indexOf(cat)) % PALETTE.length]

const distinctCategories = (txs: Transaction[]) =>
  Array.from(new Set(txs.filter(t => t.type === 'debit').map(t => t.category))).sort()

let txCache: { at: number; p: Promise<Transaction[]> } | null = null

const getTx = (): Promise<Transaction[]> => {
  if (txCache && Date.now() - txCache.at < 60_000) return txCache.p
  const p = dashboardService.getTransactions().catch(async () => {
    await new Promise((r) => setTimeout(r, 800))          // one retry
    return dashboardService.getTransactions()
  })
  txCache = { at: Date.now(), p }
  p.catch(() => { if (txCache?.p === p) txCache = null }) // don't cache failures
  return p
}

// ─── service ─────────────────────────────────────────────────────────────────
export const budgetService = {
  /** Categories that already exist in the user's spending. */
  async getCategories(): Promise<string[]> {
    return distinctCategories(await dashboardService.getTransactions())
  },

  async getBudgets(): Promise<BudgetsResponse> {
    const txs = await getTx().catch(() => [] as Transaction[])
    const budgets = read().map(b => ({ ...b, status: statusOf(b, spentByCategory(b, txs)) }))
    const totalSpent = budgets.reduce(
      (s, b) => s + Object.values(spentByCategory(b, txs)).reduce((a, v) => a + v, 0), 0)
    return {
      budgets,
      totalBudget: budgets.reduce((s, b) => s + b.totalAmount, 0),
      totalSpent,
    }
  },

  async createBudget(payload: CreateBudgetPayload): Promise<Budget> {
    const b: Budget = { ...payload, id: `b${Date.now()}`, status: 'active' }
    write([b, ...read()])
    return b
  },

  async deleteBudget(id: string): Promise<void> {
    write(read().filter(b => b.id !== id))
  },

  async getBudgetSummary(id: string): Promise<BudgetSummary> {
    const budget = read().find(b => b.id === id)
    if (!budget) throw new Error('Budget not found')
    const txs = await dashboardService.getTransactions()
    const all = distinctCategories(txs)
    const spent = spentByCategory(budget, txs)

    const categories = budget.categories.map(c => {
      const s = Math.round((spent[c.category] ?? 0) * 100) / 100
      return { category: c.category, limit: c.limit, spent: s,
               percentUsed: c.limit > 0 ? Math.round((s / c.limit) * 100) : 0 }
    })
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0)
    const pie = (key: 'limit' | 'spent'): CategoryPieItem[] =>
      categories.filter(c => c[key] > 0)
        .map(c => ({ label: c.category, value: c[key], color: colorFor(c.category, all) }))

    const daysLeft = Math.max(0, Math.ceil((endOf(budget.endDate).getTime() - Date.now()) / 86400000))

    return {
      budget: { ...budget, status: statusOf(budget, spent) },
      totalSpent,
      percentUsed: budget.totalAmount > 0 ? Math.round((totalSpent / budget.totalAmount) * 100) : 0,
      daysLeft, categories,
      plannedPie: pie('limit'), actualPie: pie('spent'),
    }
  },
}
// ─── SHARED ──────────────────────────────────────────────────────────────────

export type SubType = 'up' | 'down' | 'gold'
export type Period  = 'month' | '6months' | '1year'
export type TxType  = 'all' | 'credit' | 'debit'

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export interface SummaryCard {
  label:   string
  value:   string
  sub:     string
  subType: SubType
  icon:    string
}

export interface MonthBar {
  label:  string
  income: number
  spend:  number
}

export interface DonutSegment {
  pct:    number
  label:  string
  amount: string
}

export type InsightType = 'spending' | 'subscription' | 'savings' | 'anomaly'

export interface AIInsight {
  type:        InsightType
  title:       string
  description: string
  confidence:  number
}

export interface DashboardPeriodData {
  summaryCards: SummaryCard[]
  months: MonthBar[]
  donut: DonutSegment[]
  insights: AIInsight[]

  suggestedQuestions?: SuggestedQuestion[]
}

export interface DashboardResponse {
  period: Period
  data:   DashboardPeriodData
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export interface Transaction {
  id:       number
  icon:     string
  name:     string
  category: string
  date:     string
  amount:   number
  dateVal:  string   // ISO string — Date is not JSON-serialisable
  type:     'credit' | 'debit'
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export interface CategoryPieItem {
  label: string
  value: number
  color: string
}

export interface MonthlyTrendItem {
  label: string
  value: number
}

export interface IncomeExpenseItem {
  label:   string
  income:  number
  expense: number
}

export interface TopMerchantItem {
  label: string
  value: number
}

export interface AnalyticsKPI {
  avgDailySpend: string
  topCategory:   string
  savingsRate:   string
}

export interface AnalyticsResponse {
  kpi:            AnalyticsKPI
  categoryPie:    CategoryPieItem[]
  monthlyTrend:   MonthlyTrendItem[]
  incomeExpense:  IncomeExpenseItem[]
  topMerchants:   TopMerchantItem[]
}

// ─── ANALYTICS · MERCHANT INTELLIGENCE ────────────────────────────────────────

export type MerchantClassificationSource =
  | 'merchant_prior'
  | 'keyword_rule'
  | 'database_memory'
  | 'semantic_ai'

export interface MerchantIntelligenceItem {
  id: number
  merchant: string
  category: string
  confidence: number
  source: MerchantClassificationSource
}

export interface MerchantIntelligenceResponse {
  merchants: MerchantIntelligenceItem[]
}

// ─── ANALYTICS · AI CLASSIFICATION MONITOR ────────────────────────────────────

export type TrendDirection = 'up' | 'down' | 'flat'

export interface ClassificationTrend {
  direction: TrendDirection
  value:     string
}

export interface ClassificationSourceMetric {
  label: string
  pct:   number
  trend: ClassificationTrend
}

export interface AIClassificationResponse {
  transactionsProcessed: {
    count: number
    trend: ClassificationTrend
  }
  sources: ClassificationSourceMetric[]
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

export type SubStatus = 'active' | 'due_soon' | 'overdue'

export interface Subscription {
  id:          number
  name:        string
  icon:        string
  iconBg:      string
  monthlyCost: number
  renewalDate: string
  status:      SubStatus
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[]
  monthlyTotal:  number
  yearlyTotal:   number
}

// ─── GOALS ────────────────────────────────────────────────────────────────────

export interface Goal {
  id:       string
  title:    string
  icon:     string
  target:   number
  current:  number
  deadline: string
  note:     string
}

export interface GoalsResponse {
  goals:       Goal[]
  totalTarget: number
  totalSaved:  number
  overallPct:  number
}

// ─── KPI ROW ─────────────────────────────────────────────────────────────────

export interface KPICard {
  label:   string
  value:   string
  sub:     string
  subType: SubType
  icon:    string
}

export interface OverviewKPIResponse {
  kpis: KPICard[]
}

// ─── GENERIC API WRAPPER ─────────────────────────────────────────────────────

export interface ApiError {
  message: string
  status:  number
}

export interface SuggestedQuestion {
  id: string
  text: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  text: string
  insightType: string
  suggestions?: string[]
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface TransactionResponse {
  transactions: Transaction[]
  pagination: Pagination
}
<script setup>
import { ref, computed, onMounted } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import SummaryCard from '../components/SummaryCard.vue'
import MultiBarChart from '../components/MultiBarChart.vue'
import { monthlyBudgetData, categoryBreakdown } from '../data/budgets'
import { getAccountTotals } from '../data/accounts'
import { getTotals } from '../data/investments'
import { GOALS_STORAGE_KEY } from '../data/goals'

const periodOptions = [
  { id: '1m', label: 'This month', months: 1 },
  { id: '3m', label: 'Last 3 months', months: 3 },
  { id: '6m', label: 'Last 6 months', months: 6 },
  { id: '12m', label: 'This year', months: 12 },
]
const selectedPeriod = ref('3m')

const chartData = computed(() => {
  const n = periodOptions.find((p) => p.id === selectedPeriod.value)?.months ?? 3
  return monthlyBudgetData.slice(-n)
})

const reportIncome = computed(() => chartData.value.reduce((s, d) => s + d.income, 0))
const reportExpenses = computed(() => chartData.value.reduce((s, d) => s + d.expenses, 0))
const reportNet = computed(() => reportIncome.value - reportExpenses.value)
const reportSavingsRate = computed(() =>
  reportIncome.value ? Math.round(((reportIncome.value - reportExpenses.value) / reportIncome.value) * 100) : 0
)

const categoryTotal = computed(() => categoryBreakdown.reduce((s, c) => s + c.value, 0) || 1)
const accountTotals = computed(() => getAccountTotals('all'))
const investmentTotals = computed(() => getTotals('all'))

const goals = ref([])
const goalsTotalSaved = computed(() => goals.value.reduce((s, g) => s + Number(g.savedAmount || 0), 0))
const goalsCompleted = computed(() => goals.value.filter((g) => g.savedAmount >= g.targetAmount).length)

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function formatCurrencyFull(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function pct(value) {
  return ((value / categoryTotal.value) * 100).toFixed(1)
}

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY)
    goals.value = raw ? JSON.parse(raw) : []
  } catch {
    goals.value = []
  }
}

function downloadReport() {
  const period = periodOptions.find((p) => p.id === selectedPeriod.value)?.label ?? selectedPeriod.value
  const lines = [
    'Financial Report – ' + period,
    'Generated ' + new Date().toLocaleString(),
    '',
    '--- Income & expenses ---',
    'Total income: ' + formatCurrencyFull(reportIncome.value),
    'Total expenses: ' + formatCurrencyFull(reportExpenses.value),
    'Net cash flow: ' + formatCurrencyFull(reportNet.value),
    'Savings rate: ' + reportSavingsRate.value + '%',
    '',
    '--- Spending by category ---',
    ...categoryBreakdown.map((c) => c.name + ': ' + formatCurrency(c.value) + ' (' + pct(c.value) + '%)'),
    '',
    '--- Snapshot ---',
    'Bank balance: ' + formatCurrency(accountTotals.value.totalInBank),
    'Liabilities: ' + formatCurrency(accountTotals.value.totalLiabilities),
    'Net worth: ' + formatCurrency(accountTotals.value.netWorth),
    'Investments: ' + formatCurrency(investmentTotals.value.total),
    'Goals saved: ' + formatCurrency(goalsTotalSaved.value) + ' (' + goalsCompleted.value + '/' + goals.value.length + ' completed)',
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'financial-report-' + new Date().toISOString().slice(0, 10) + '.txt'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(loadGoals)
</script>

<template>
  <PageContainer title="Reports">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div class="flex gap-1 border-b border-[var(--border)]">
        <button
          v-for="p in periodOptions"
          :key="p.id"
          @click="selectedPeriod = p.id"
          :class="[
            'px-3 py-2 text-sm font-medium transition-colors -mb-px',
            selectedPeriod === p.id
              ? 'text-accent border-b-2 border-accent'
              : 'text-[var(--textMuted)] hover:text-[var(--text)]'
          ]"
        >
          {{ p.label }}
        </button>
      </div>
      <button type="button" class="btn-deposit px-4 py-2 rounded-lg text-sm font-medium" @click="downloadReport">
        Download report
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
      <SummaryCard
        title="Total income"
        :value="formatCurrency(reportIncome)"
        :detail="periodOptions.find(x => x.id === selectedPeriod)?.label"
      />
      <SummaryCard
        title="Total expenses"
        :value="formatCurrency(reportExpenses)"
      />
      <SummaryCard
        title="Net cash flow"
        :value="formatCurrency(reportNet)"
        :detail="reportSavingsRate + '% savings rate'"
        :detail-variant="reportNet >= 0 ? 'accent' : 'negative'"
      />
      <SummaryCard
        title="Savings rate"
        :value="reportSavingsRate + '%'"
        :detail-variant="reportSavingsRate >= 20 ? 'accent' : reportSavingsRate > 0 ? 'muted' : 'negative'"
      />
    </div>

    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Income vs expenses</h3>
      <MultiBarChart :data="chartData" :selected-index="-1" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <div class="card p-5">
        <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Spending by category</h3>
        <ul class="space-y-2">
          <li
            v-for="cat in categoryBreakdown"
            :key="cat.name"
            class="flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-3 h-3 rounded-sm shrink-0" :style="{ background: cat.color }"></span>
              <span class="text-sm text-[var(--text)] truncate">{{ cat.name }}</span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-sm tabular-nums text-[var(--text)]">{{ formatCurrency(cat.value) }}</span>
              <span class="text-xs text-[var(--textMuted)] w-12 text-right">{{ pct(cat.value) }}%</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="card p-5">
        <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Snapshot</h3>
        <ul class="space-y-3 text-sm">
          <li class="flex justify-between">
            <span class="text-[var(--textMuted)]">Bank balance</span>
            <span class="tabular-nums text-[var(--text)]">{{ formatCurrency(accountTotals.totalInBank) }}</span>
          </li>
          <li class="flex justify-between">
            <span class="text-[var(--textMuted)]">Liabilities</span>
            <span class="tabular-nums text-[var(--negative)]">{{ formatCurrency(accountTotals.totalLiabilities) }}</span>
          </li>
          <li class="flex justify-between">
            <span class="text-[var(--textMuted)]">Net worth</span>
            <span class="tabular-nums text-[var(--text)]">{{ formatCurrency(accountTotals.netWorth) }}</span>
          </li>
          <li class="flex justify-between">
            <span class="text-[var(--textMuted)]">Investments</span>
            <span class="tabular-nums text-[var(--text)]">{{ formatCurrency(investmentTotals.total) }}</span>
          </li>
          <li class="flex justify-between pt-2 border-t border-[var(--border)]">
            <span class="text-[var(--textMuted)]">Goals saved</span>
            <span class="tabular-nums text-[var(--text)]">{{ formatCurrency(goalsTotalSaved) }} ({{ goalsCompleted }}/{{ goals.length }} done)</span>
          </li>
        </ul>
      </div>
    </div>
  </PageContainer>
</template>

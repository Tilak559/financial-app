<script setup>
import { ref, computed, onMounted } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import SummaryCard from '../components/SummaryCard.vue'
import { getAccountTotals } from '../data/accounts'
import { budgetsByRegion } from '../data/budgets'
import { getTotals } from '../data/investments'
import { bankTransactions } from '../data/transactions'
import { GOALS_STORAGE_KEY } from '../data/goals'
import { getDisplayPrefs, getDisplayRegionOptions, currencyOptions, regionDefaultCurrency } from '../data/settings'

const goals = ref([])
const displayPrefs = ref(getDisplayPrefs())

const currencyDropdownOptions = computed(() => {
  const enabled = displayPrefs.value.enabledRegions || []
  const rs = displayPrefs.value.regionSettings || {}
  const codes = [...new Set(enabled.map((id) => rs[id]?.currency).filter(Boolean))]
  if (!codes.length) return currencyOptions
  return currencyOptions.filter((c) => codes.includes(c.value))
})

const overviewDropdownOptions = computed(() => {
  const regionList = getDisplayRegionOptions(displayPrefs.value).filter((r) => r.id !== 'all')
  if (!displayPrefs.value.multiRegion) {
    return regionList.map((r) => ({ value: r.id, label: r.label }))
  }
  const allOpts = currencyDropdownOptions.value.map((c) => ({ value: 'all|' + c.value, label: 'All (' + c.label + ')' }))
  const regionOpts = regionList.map((r) => ({ value: r.id, label: r.label }))
  return [...allOpts, ...regionOpts]
})

const overviewSelection = ref('')

const effectiveRegion = computed(() => {
  const v = overviewSelection.value
  if (v.startsWith('all|')) return 'all'
  return v || 'all'
})

const displayCurrency = computed(() => {
  const v = overviewSelection.value
  if (v.startsWith('all|')) return v.slice(5) || 'USD'
  const rs = displayPrefs.value.regionSettings?.[v]
  return rs?.currency || regionDefaultCurrency[v] || 'USD'
})

const singleCountryLabel = computed(() => {
  const list = getDisplayRegionOptions(displayPrefs.value).filter((r) => r.id !== 'all')
  const r = list.find((x) => x.id === displayPrefs.value.singleRegion)
  return r?.label || 'USA'
})

const accountTotals = computed(() => getAccountTotals(effectiveRegion.value))
const investmentTotals = computed(() => getTotals(effectiveRegion.value))

const budgetData = computed(() => budgetsByRegion[effectiveRegion.value] || budgetsByRegion.all)
const totalIncome = computed(() => budgetData.value.totalIncome)
const totalExpenses = computed(() => budgetData.value.totalExpenses)
const totalBudget = computed(() => budgetData.value.totalBudget)
const netCashFlow = computed(() => budgetData.value.netCashFlow)

const remaining = computed(() => accountTotals.value.totalInBank - accountTotals.value.totalLiabilities)

const goalsTotalSavedByCurrency = computed(() => {
  const by = {}
  goals.value.forEach((g) => {
    by[g.currency] = (by[g.currency] || 0) + Number(g.savedAmount)
  })
  return by
})

const goalsSummaryLine = computed(() => {
  return Object.entries(goalsTotalSavedByCurrency.value)
    .map(([code, val]) => formatInCurrency(val, code))
    .join(' · ') || 'Nothing yet'
})

const goalsCount = computed(() => goals.value.length)
const goalsCompleted = computed(() => goals.value.filter((g) => g.savedAmount >= g.targetAmount).length)
const nextGoal = computed(() => {
  const withDeadline = goals.value
    .filter((g) => g.deadline && g.savedAmount < g.targetAmount)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  return withDeadline[0] || null
})

const budgetRemaining = computed(() => Math.max(0, totalBudget.value - totalExpenses.value))
const budgetUsagePct = computed(() => (totalBudget.value ? Math.round((totalExpenses.value / totalBudget.value) * 100) : 0))
const savingsRatePct = computed(() =>
  totalIncome.value ? Math.round(((totalIncome.value - totalExpenses.value) / totalIncome.value) * 100) : 0
)

const pulseMessage = computed(() => {
  if (accountTotals.value.totalLiabilities > accountTotals.value.totalInBank) return 'Cash negative: pay down debts first'
  if (budgetUsagePct.value > 100) return 'Over budget this month'
  if (savingsRatePct.value >= 20) return 'Strong savings rate'
  if (savingsRatePct.value > 0) return 'On track'
  return 'Spending exceeds income'
})

const pulseVariant = computed(() => {
  if (accountTotals.value.totalLiabilities > accountTotals.value.totalInBank || budgetUsagePct.value > 100) return 'negative'
  if (savingsRatePct.value >= 20) return 'accent'
  return 'muted'
})

const recentTransactions = computed(() => [...bankTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4))

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY)
    goals.value = raw ? JSON.parse(raw) : []
  } catch {
    goals.value = []
  }
}

function formatInCurrency(amount, code) {
  if (code === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function formatDisplayCurrency(n) {
  return formatInCurrency(n, displayCurrency.value)
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTxnAmount(amount) {
  const n = Number(amount)
  const s = n >= 0 ? '+' : ''
  const code = displayCurrency.value
  const opts = code === 'INR'
    ? { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }
    : { style: 'currency', currency: code || 'USD', minimumFractionDigits: 2 }
  return s + new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', opts).format(Math.abs(n))
}

onMounted(() => {
  loadGoals()
  displayPrefs.value = getDisplayPrefs()
  const opts = overviewDropdownOptions.value
  if (opts.length && !overviewSelection.value) {
    if (!displayPrefs.value.multiRegion) overviewSelection.value = displayPrefs.value.singleRegion
    else overviewSelection.value = opts[0].value
  }
})
</script>

<template>
  <PageContainer title="Overview">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div class="flex items-center gap-2">
        <select
          v-model="overviewSelection"
          class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] min-w-[10rem]"
        >
          <option v-for="o in overviewDropdownOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <div class="card p-6 mb-5 border-accent/30" style="border-width: 2px;">
      <p class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-1">Available to use</p>
      <p class="text-3xl md:text-4xl font-bold text-accent tracking-tight tabular-nums">
        {{ formatDisplayCurrency(remaining) }}
      </p>
      <p class="text-sm text-[var(--textMuted)] mt-1">Bank balance minus liabilities (credit card debt)</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
      <SummaryCard
        title="Total in bank"
        :value="formatDisplayCurrency(accountTotals.totalInBank)"
        detail="Across all accounts"
      />
      <SummaryCard
        title="Liabilities"
        :value="formatDisplayCurrency(accountTotals.totalLiabilities)"
        detail="Credit card debt"
        :detail-variant="accountTotals.totalLiabilities > 0 ? 'negative' : 'muted'"
      />
      <SummaryCard
        title="Toward goals"
        :value="goalsSummaryLine"
        :detail="goalsCount ? goalsCompleted + ' of ' + goalsCount + ' completed' : 'No goals yet'"
      />
      <SummaryCard
        title="Net worth"
        :value="formatDisplayCurrency(accountTotals.netWorth)"
        detail="Assets minus liabilities"
        :detail-variant="accountTotals.netWorth >= 0 ? 'accent' : 'negative'"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
      <SummaryCard
        title="Budget this month"
        :value="formatDisplayCurrency(totalExpenses) + ' of ' + formatDisplayCurrency(totalBudget)"
        :detail="budgetUsagePct + '% used · ' + formatDisplayCurrency(budgetRemaining) + ' left'"
        :detail-variant="budgetUsagePct > 100 ? 'negative' : budgetUsagePct > 90 ? 'muted' : 'accent'"
      />
      <SummaryCard
        title="Net cash flow"
        :value="formatDisplayCurrency(netCashFlow)"
        :detail="'Income ' + formatDisplayCurrency(totalIncome) + ' minus expenses'"
        :detail-variant="netCashFlow >= 0 ? 'accent' : 'negative'"
      />
      <SummaryCard
        title="Investments"
        :value="formatDisplayCurrency(investmentTotals.total)"
        :detail="investmentTotals.totalChange >= 0 ? '+' + investmentTotals.totalChange.toFixed(1) + '% total change' : investmentTotals.totalChange.toFixed(1) + '%'"
        :detail-variant="investmentTotals.totalChange >= 0 ? 'accent' : 'negative'"
      />
      <SummaryCard
        title="Savings rate"
        :value="savingsRatePct + '%'"
        detail="Of income saved this month"
        :detail-variant="savingsRatePct >= 20 ? 'accent' : savingsRatePct > 0 ? 'muted' : 'negative'"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <div class="card p-5">
        <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-3">Financial pulse</h3>
        <p :class="['text-lg font-semibold', pulseVariant === 'accent' ? 'text-accent' : pulseVariant === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--text)]']">
          {{ pulseMessage }}
        </p>
        <p class="text-sm text-[var(--textMuted)] mt-1">
          {{ remaining >= 0 ? formatDisplayCurrency(remaining) + ' liquid after debts. ' : '' }}
          {{ goalsCount ? goalsCount + ' goals, ' + goalsCompleted + ' completed.' : 'Add goals to track progress.' }}
        </p>
      </div>
      <div class="card p-5" v-if="nextGoal">
        <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-3">Next goal</h3>
        <p class="text-base font-semibold text-[var(--text)]">{{ nextGoal.name }}</p>
        <p class="text-sm text-[var(--textMuted)] mt-0.5">
          {{ formatInCurrency(nextGoal.savedAmount, nextGoal.currency) }} of {{ formatInCurrency(nextGoal.targetAmount, nextGoal.currency) }}
          ({{ nextGoal.targetAmount ? Math.min(100, Math.round((nextGoal.savedAmount / nextGoal.targetAmount) * 100)) : 0 }}%) · Due {{ nextGoal.deadline ? new Date(nextGoal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' }}
        </p>
        <div class="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mt-2">
          <div
            class="h-full rounded-full bg-accent"
            :style="{ width: (nextGoal.targetAmount ? Math.min(100, (nextGoal.savedAmount / nextGoal.targetAmount) * 100) : 0) + '%' }"
          />
        </div>
      </div>
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Recent activity</h3>
      <ul class="space-y-2">
        <li
          v-for="tx in recentTransactions"
          :key="tx.id"
          class="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
        >
          <div>
            <p class="text-sm font-medium text-[var(--text)] truncate">{{ tx.name }}</p>
            <p class="text-xs text-[var(--textMuted)]">{{ formatDate(tx.date) }}</p>
          </div>
          <p :class="['text-sm tabular-nums shrink-0', tx.amount >= 0 ? 'text-accent' : 'text-[var(--text)]']">
            {{ formatTxnAmount(tx.amount) }}
          </p>
        </li>
      </ul>
    </div>
  </PageContainer>
</template>

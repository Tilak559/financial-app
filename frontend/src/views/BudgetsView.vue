<script setup>
import { ref, computed } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import SummaryCard from '../components/SummaryCard.vue'
import MultiBarChart from '../components/MultiBarChart.vue'
import DonutChart from '../components/DonutChart.vue'
import RegionPageHeader from '../components/RegionPageHeader.vue'
import { budgetsByRegion } from '../data/budgets'
import { useRegionDisplay } from '../composables/useRegionDisplay'

const {
  displayPrefs,
  selectedRegion,
  currency,
  regionOptions,
  effectiveRegion,
  singleCountryLabel,
  displayCurrency,
  currencyDropdownOptions,
} = useRegionDisplay()

const selectedMonthIndex = ref(3)

const budgetData = computed(() => budgetsByRegion[effectiveRegion.value] || budgetsByRegion.all)

const monthlyBudgetData = computed(() => budgetData.value.monthlyData)
const categoryBreakdown = computed(() => budgetData.value.categoryBreakdown)
const totalIncome = computed(() => budgetData.value.totalIncome)
const totalExpenses = computed(() => budgetData.value.totalExpenses)
const totalBudget = computed(() => budgetData.value.totalBudget)
const netCashFlow = computed(() => budgetData.value.netCashFlow)
const spentThisMonth = computed(() => budgetData.value.spentThisMonth)

const budgetUsagePct = computed(() =>
  totalBudget.value > 0 ? Math.round((totalExpenses.value / totalBudget.value) * 100) : 0
)
const budgetRemaining = computed(() => Math.max(0, totalBudget.value - totalExpenses.value))

const categoryTotal = computed(() =>
  categoryBreakdown.value.reduce((s, c) => s + c.value, 0) || 1
)

function formatCurrencyFull(n, code) {
  const c = code || displayCurrency.value
  if (c === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD', minimumFractionDigits: 2 }).format(n)
}

function pct(value) {
  return ((value / categoryTotal.value) * 100).toFixed(1)
}

function formatInCurrency(amount, code) {
  const c = code || displayCurrency.value
  if (c === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function formatDisplayCurrency(n) {
  return formatInCurrency(n, displayCurrency.value)
}

function onEditCategory() {
  alert('Edit categories – connect to your category settings.')
}
</script>

<template>
  <PageContainer title="Budgets">
    <RegionPageHeader
      :region-options="regionOptions"
      :currency-options="currencyDropdownOptions"
      v-model:selected-region="selectedRegion"
      v-model:currency="currency"
      :multi-region="displayPrefs.multiRegion"
      :single-country-label="singleCountryLabel"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
      <SummaryCard
        title="Income"
        :value="formatCurrencyFull(totalIncome)"
      />
      <SummaryCard
        title="Budget"
        :value="formatCurrencyFull(totalBudget)"
      />
      <SummaryCard
        title="Expenses"
        :value="formatCurrencyFull(totalExpenses)"
      />
      <SummaryCard
        title="Budget usage"
        :value="budgetUsagePct + '%'"
        :detail="formatDisplayCurrency(budgetRemaining) + ' remaining'"
        :detail-variant="budgetUsagePct > 100 ? 'negative' : 'accent'"
      />
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Time period</h3>
      <MultiBarChart :data="monthlyBudgetData" :selected-index="selectedMonthIndex" />
      <div class="mt-5 pt-4 border-t border-[var(--border)] grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-sm shrink-0" style="background: rgba(0, 200, 83, 0.9);"></span>
          <div class="min-w-0">
            <p class="text-[var(--textMuted)] text-xs">Income</p>
            <p class="font-semibold text-[var(--text)] tabular-nums truncate">{{ formatCurrencyFull(totalIncome) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-sm shrink-0 bg-gray-500/90"></span>
          <div class="min-w-0">
            <p class="text-[var(--textMuted)] text-xs">Expenses</p>
            <p class="font-semibold text-[var(--text)] tabular-nums truncate">{{ formatCurrencyFull(totalExpenses) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2.5 md:border-l md:pl-4 border-[var(--border)]">
          <span class="w-3 h-3 rounded-sm shrink-0 bg-accent/20 border border-accent/50"></span>
          <div class="min-w-0">
            <p class="text-[var(--textMuted)] text-xs">Net cash flow</p>
            <p class="font-semibold text-accent tabular-nums truncate">{{ formatCurrencyFull(netCashFlow) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Category breakdown</h3>
      <div class="flex gap-2 mb-4 border-b border-[var(--border)]">
        <button class="px-3 py-2 text-sm font-medium text-accent border-b-2 border-accent -mb-px">Expenses</button>
        <button class="px-3 py-2 text-sm font-medium text-[var(--textMuted)] hover:text-[var(--text)]">Budget</button>
        <button class="px-3 py-2 text-sm font-medium text-[var(--textMuted)] hover:text-[var(--text)]">Income</button>
      </div>
      <div class="flex flex-col md:flex-row gap-5 items-stretch md:items-start">
        <div class="w-full md:w-2/5">
          <DonutChart
            :segments="categoryBreakdown"
            :center-label="formatDisplayCurrency(spentThisMonth)"
            center-sublabel="Spent this month"
            @edit="onEditCategory"
          />
        </div>
        <div class="w-full md:w-3/5 pr-4">
          <ul class="space-y-0">
            <li
              v-for="cat in categoryBreakdown"
              :key="cat.name"
              class="flex items-center justify-between gap-3 py-2.5 border-b border-[var(--border)] last:border-b-0"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-3 h-3 rounded-sm shrink-0" :style="{ background: cat.color }"></span>
                <span class="text-sm text-[var(--text)] truncate">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-4 shrink-0">
                <span class="text-sm font-medium text-[var(--text)] tabular-nums">{{ formatDisplayCurrency(cat.value) }}</span>
                <span class="text-xs text-[var(--textMuted)] tabular-nums w-12 text-right">{{ pct(cat.value) }}%</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
        <span class="text-[var(--textMuted)]">View by</span>
        <button type="button" class="flex items-center gap-1.5 py-1 px-2 rounded text-[var(--text)] hover:bg-[var(--border)] hover:text-accent">
          Category
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import { currencyOptions } from '../data/settings'

const NOTES_STORAGE_KEY = 'financial-app-tools-notes'

const selectedTool = ref(null)

const currencySymbols = { USD: '$', INR: 'Rs', EUR: '€', GBP: '£' }
function currencyLabel(code) {
  return currencySymbols[code] || code
}

const tools = [
  { id: 'sip', label: 'SIP Calculator', description: 'SIP, Lumpsum and Goal SIP returns' },
  { id: 'emi', label: 'EMI Calculator', description: 'Loan EMI, total payment and interest' },
  { id: 'notes', label: 'Notes', description: 'Quick notes and ideas' },
  { id: 'inflation', label: 'Inflation Calculator', description: 'Future value after inflation' },
  { id: 'fd', label: 'FD Calculator', description: 'Fixed deposit maturity amount' },
  { id: 'rd', label: 'RD Calculator', description: 'Recurring deposit maturity' },
  { id: 'loanCompare', label: 'Loan Comparison', description: 'Compare two loan offers' },
  { id: 'retirement', label: 'Retirement Corpus', description: 'Estimate corpus and SIP needed' },
  { id: 'tax', label: 'Tax Estimate', description: 'Rough income tax (India)' },
  { id: 'converters', label: 'Quick Converters', description: 'Rate conversion and doubling time' },
]

function openTool(id) {
  selectedTool.value = id
}

function goBack() {
  selectedTool.value = null
}

// SIP calculator: tabs SIP | Lumpsum | Goal SIP
const sipTab = ref('sip')
const sipTabs = [
  { id: 'sip', label: 'SIP' },
  { id: 'lumpsum', label: 'Lumpsum' },
  { id: 'goalSip', label: 'Goal SIP' },
]

const sipCurrency = ref('INR')
const sipFrequency = ref('monthly')
const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

// Slider bounds (same for all modes where applicable)
const amountMin = 1000
const amountMax = 100000
const amountStep = 1000
const yearsMin = 1
const yearsMax = 30
const returnMin = 1
const returnMax = 20
const returnStep = 0.5
const goalAmountMin = 50000
const goalAmountMax = 5000000
const goalAmountStep = 25000

const sipAmount = ref(10000)
const sipYears = ref(10)
const sipReturnPct = ref(10)
const sipGoalAmount = ref(500000)

// SIP: FV = P * ([(1+r)^n - 1] / r) * (1 + r); P = per-period, n = months
const sipResult = computed(() => {
  const P = Number(sipAmount.value) || 0
  const r = Number(sipReturnPct.value) || 0
  const n = Number(sipYears.value) || 0
  if (P <= 0 || n <= 0) return null
  const periodsPerYear = sipFrequency.value === 'quarterly' ? 4 : 12
  const r_per = r / 100 / periodsPerYear
  const numPeriods = n * periodsPerYear
  const fv = r_per === 0 ? P * numPeriods : P * (((1 + r_per) ** numPeriods - 1) / r_per) * (1 + r_per)
  const invested = P * numPeriods
  const gains = fv - invested
  return { fv, invested, gains }
})

// Lumpsum: FV = P * (1 + r_annual)^years
const lumpsumResult = computed(() => {
  const P = Number(sipAmount.value) || 0
  const r = Number(sipReturnPct.value) || 0
  const n = Number(sipYears.value) || 0
  if (P <= 0 || n <= 0) return null
  const fv = P * (1 + r / 100) ** n
  const invested = P
  const gains = fv - invested
  return { fv, invested, gains }
})

// Goal SIP: given target FV, years, return → required monthly P
const goalSipResult = computed(() => {
  const FV = Number(sipGoalAmount.value) || 0
  const r = Number(sipReturnPct.value) || 0
  const n = Number(sipYears.value) || 0
  if (FV <= 0 || n <= 0) return null
  const r_m = r / 100 / 12
  const months = n * 12
  const factor = r_m === 0 ? months : (((1 + r_m) ** months - 1) / r_m) * (1 + r_m)
  const P = FV / factor
  const invested = P * months
  const gains = FV - invested
  return { requiredMonthly: P, fv: FV, invested, gains }
})

const sipDisplayResult = computed(() => {
  if (sipTab.value === 'sip') return sipResult.value
  if (sipTab.value === 'lumpsum') return lumpsumResult.value
  if (sipTab.value === 'goalSip') return goalSipResult.value
  return null
})

const sipInvestedPct = computed(() => {
  const r = sipDisplayResult.value
  if (!r || r.fv <= 0) return 0
  return Math.round((r.invested / r.fv) * 100)
})

const sipReturnsPct = computed(() => {
  const r = sipDisplayResult.value
  if (!r || r.fv <= 0) return 0
  return Math.round((r.gains / r.fv) * 100)
})

// EMI: principal P, annual rate R%, tenure N months
// r = R/100/12, EMI = P * r * (1+r)^N / ((1+r)^N - 1)
const emiCurrency = ref('INR')
const emiPrincipal = ref(500000)
const emiRatePct = ref(10)
const emiMonths = ref(60)

const emiResult = computed(() => {
  const P = Number(emiPrincipal.value) || 0
  const R = Number(emiRatePct.value) || 0
  const N = Number(emiMonths.value) || 0
  if (P <= 0 || N <= 0) return null
  const r = R / 100 / 12
  const emi = r === 0 ? P / N : (P * r * (1 + r) ** N) / ((1 + r) ** N - 1)
  const total = emi * N
  const interest = total - P
  return { emi, total, interest }
})

function formatNum(x) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(x)
}

function formatMoney(x, code) {
  return (currencyLabel(code) + ' ' + formatNum(x)).trim()
}

// Notes: persist to localStorage
const notesContent = ref(typeof localStorage !== 'undefined' ? (localStorage.getItem(NOTES_STORAGE_KEY) || '') : '')
watch(notesContent, (val) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(NOTES_STORAGE_KEY, val)
}, { deep: true })

// Inflation: today's amount, inflation % p.a., years -> future amount needed for same purchasing power
const infCurrency = ref('INR')
const infAmount = ref(10000)
const infRate = ref(6)
const infYears = ref(10)
const inflationResult = computed(() => {
  const P = Number(infAmount.value) || 0
  const r = Number(infRate.value) || 0
  const n = Number(infYears.value) || 0
  if (P <= 0 || n <= 0) return null
  const fv = P * (1 + r / 100) ** n
  return { fv }
})

// FD: principal, tenure (years), rate -> maturity (compound interest)
const fdCurrency = ref('INR')
const fdPrincipal = ref(100000)
const fdYears = ref(5)
const fdRate = ref(7)
const fdResult = computed(() => {
  const P = Number(fdPrincipal.value) || 0
  const r = Number(fdRate.value) || 0
  const n = Number(fdYears.value) || 0
  if (P <= 0 || n <= 0) return null
  const maturity = P * (1 + r / 100) ** n
  const interest = maturity - P
  return { maturity, interest }
})

// RD: monthly deposit, tenure (months), rate -> maturity. FV = P * (((1+r)^n - 1) / r), r = monthly rate
const rdCurrency = ref('INR')
const rdMonthly = ref(5000)
const rdMonths = ref(12)
const rdRate = ref(6)
const rdResult = computed(() => {
  const P = Number(rdMonthly.value) || 0
  const r = Number(rdRate.value) || 0
  const n = Number(rdMonths.value) || 0
  if (P <= 0 || n <= 0) return null
  const r_m = r / 100 / 12
  const fv = r_m === 0 ? P * n : P * ((1 + r_m) ** n - 1) / r_m
  const invested = P * n
  const interest = fv - invested
  return { maturity: fv, invested, interest }
})

// Loan comparison: two loans with principal, rate, tenure -> EMI and total interest each
const lcCurrency = ref('INR')
const lc1Principal = ref(500000)
const lc1Rate = ref(10)
const lc1Months = ref(60)
const lc2Principal = ref(500000)
const lc2Rate = ref(9.5)
const lc2Months = ref(60)
function emiCalc(P, R, N) {
  if (P <= 0 || N <= 0) return null
  const r = R / 100 / 12
  const emi = r === 0 ? P / N : (P * r * (1 + r) ** N) / ((1 + r) ** N - 1)
  return { emi, total: emi * N, interest: emi * N - P }
}
const lc1Result = computed(() => emiCalc(Number(lc1Principal.value) || 0, Number(lc1Rate.value) || 0, Number(lc1Months.value) || 0))
const lc2Result = computed(() => emiCalc(Number(lc2Principal.value) || 0, Number(lc2Rate.value) || 0, Number(lc2Months.value) || 0))

// Retirement: current age, retirement age, monthly expense (post-retirement), inflation -> corpus needed; then SIP to reach it
const retCurrency = ref('INR')
const retCurrentAge = ref(30)
const retRetireAge = ref(60)
const retMonthlyExpense = ref(50000)
const retInflation = ref(6)
const retReturn = ref(12)
const retCorpusResult = computed(() => {
  const ageNow = Number(retCurrentAge.value) || 0
  const ageRet = Number(retRetireAge.value) || 0
  const monthly = Number(retMonthlyExpense.value) || 0
  const inf = Number(retInflation.value) || 0
  const yearsToRet = Math.max(0, ageRet - ageNow)
  const yearsAfterRet = 25
  if (monthly <= 0 || yearsToRet < 0) return null
  const monthlyAtRet = monthly * (1 + inf / 100) ** yearsToRet
  const corpus = monthlyAtRet * 12 * yearsAfterRet
  const sipYears = yearsToRet
  const r_sip = Number(retReturn.value) || 0
  const r_sip_m = r_sip / 100 / 12
  const n_sip = sipYears * 12
  const factor = r_sip_m === 0 ? n_sip : (((1 + r_sip_m) ** n_sip - 1) / r_sip_m) * (1 + r_sip_m)
  const sipNeeded = factor > 0 ? corpus / factor : 0
  return { corpus, sipNeeded, yearsToRet }
})

// Tax estimate (India FY24-25 simplified: old regime slabs 0-2.5L nil, 2.5-5L 5%, 5-10L 20%, 10L+ 30% + 4% cess; new regime 0-3L nil, 3-7L 5%, 7-10L 10%, 10-12L 15%, 12-15L 20%, 15L+ 30%)
const taxRegime = ref('new')
const taxIncome = ref(1200000)
const taxDeductions = ref(150000)
function taxOldRegime(income) {
  const taxable = Math.max(0, income - 50000)
  let t = 0
  if (taxable > 250000) t += Math.min(250000, taxable - 250000) * 0.05
  if (taxable > 500000) t += Math.min(500000, taxable - 500000) * 0.20
  if (taxable > 1000000) t += (taxable - 1000000) * 0.30
  return Math.round(t * 1.04)
}
function taxNewRegime(income) {
  const taxable = Math.max(0, income - 75000)
  let t = 0
  if (taxable > 300000) t += Math.min(400000, taxable - 300000) * 0.05
  if (taxable > 700000) t += Math.min(300000, taxable - 700000) * 0.10
  if (taxable > 1000000) t += Math.min(200000, taxable - 1000000) * 0.15
  if (taxable > 1200000) t += Math.min(300000, taxable - 1200000) * 0.20
  if (taxable > 1500000) t += (taxable - 1500000) * 0.30
  return Math.round(t * 1.04)
}
const taxResult = computed(() => {
  const income = Number(taxIncome.value) || 0
  const ded = Number(taxDeductions.value) || 0
  const taxableIncome = taxRegime.value === 'old' ? Math.max(0, income - ded) : income
  const tax = taxRegime.value === 'old' ? taxOldRegime(taxableIncome) : taxNewRegime(taxableIncome)
  return income <= 0 ? null : { tax, effective: income > 0 ? ((tax / income) * 100).toFixed(1) : 0 }
})

// Quick converters: annual rate -> monthly; rule of 72 (doubling time in years = 72/rate)
const convRatePct = ref(12)
const convDoublingRate = ref(8)
const convRateMonthly = computed(() => ((Number(convRatePct.value) || 0) / 12).toFixed(2))
const convDoublingYears = computed(() => {
  const r = Number(convDoublingRate.value) || 0
  return r <= 0 ? null : (72 / r).toFixed(1)
})
</script>

<template>
  <PageContainer title="Tools">
    <div class="flex flex-col gap-5">
      <div v-if="!selectedTool" class="flex flex-col gap-4">
        <p class="text-[var(--textMuted)] text-sm">Choose a calculator below.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="t in tools"
            :key="t.id"
            type="button"
            class="card p-6 text-left hover:border-[var(--accent)] hover:bg-[var(--accentSubtle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            @click="openTool(t.id)"
          >
            <h2 class="text-lg font-semibold text-[var(--text)] mb-1">{{ t.label }}</h2>
            <p class="text-[var(--textMuted)] text-sm">{{ t.description }}</p>
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <button
          type="button"
          class="self-start text-sm font-medium text-[var(--accent)] hover:text-[var(--accentHover)] px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--accentSubtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] transition-colors"
          @click="goBack"
        >
          Back to tools
        </button>

        <!-- SIP Calculator -->
        <div v-if="selectedTool === 'sip'" class="flex flex-col gap-5">
          <h2 class="text-xl md:text-2xl font-semibold text-[var(--text)]">SIP calculator</h2>

          <div class="flex gap-6 border-b border-[var(--border)]">
            <button
              v-for="t in sipTabs"
              :key="t.id"
              type="button"
              class="pb-3 text-sm font-medium transition-colors border-b-2 -mb-px focus:outline-none"
              :class="sipTab === t.id
                ? 'text-[var(--text)] border-[var(--resultInvested)]'
                : 'text-[var(--textMuted)] border-transparent hover:text-[var(--text)]'"
              @click="sipTab = t.id"
            >
              {{ t.label }}
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4 flex flex-wrap items-end gap-4">
              <div class="w-full sm:w-auto min-w-[140px]">
                <label class="block text-sm text-[var(--textMuted)] mb-1">Currency</label>
                <select
                  v-model="sipCurrency"
                  class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                >
                  <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div v-if="sipTab === 'sip'" class="flex-1 min-w-[200px]">
                <label class="block text-sm text-[var(--textMuted)] mb-1">Frequency</label>
                <select
                  v-model="sipFrequency"
                  class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                >
                  <option v-for="opt in frequencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div v-if="sipTab === 'sip'" class="flex-1 min-w-[200px]">
                <label class="block text-sm text-[var(--textMuted)] mb-1">Investment amount</label>
                <div class="flex items-center gap-3">
                  <input
                    v-model.number="sipAmount"
                    type="range"
                    :min="amountMin"
                    :max="amountMax"
                    :step="amountStep"
                    class="sip-slider flex-1 h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--resultInvested)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--resultInvested)] [&::-moz-range-thumb]:border-0"
                  />
                  <div class="flex items-center gap-1 shrink-0">
                    <span class="text-[var(--textMuted)] text-sm">{{ currencyLabel(sipCurrency) }}</span>
                    <input
                      v-model.number="sipAmount"
                      type="number"
                      :min="amountMin"
                      :max="amountMax"
                      :step="amountStep"
                      class="w-24 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div v-if="sipTab === 'lumpsum'" class="flex-1 min-w-[200px]">
                <label class="block text-sm text-[var(--textMuted)] mb-1">Investment amount</label>
                <div class="flex items-center gap-3">
                  <input
                    v-model.number="sipAmount"
                    type="range"
                    :min="amountMin"
                    :max="amountMax"
                    :step="amountStep"
                    class="sip-slider flex-1 h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--resultInvested)] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div class="flex items-center gap-1 shrink-0">
                    <span class="text-[var(--textMuted)] text-sm">{{ currencyLabel(sipCurrency) }}</span>
                    <input
                      v-model.number="sipAmount"
                      type="number"
                      :min="amountMin"
                      :max="amountMax"
                      :step="amountStep"
                      class="w-24 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="sipTab === 'goalSip'" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4">
              <label class="block text-sm text-[var(--textMuted)] mb-1">Goal amount ({{ currencyLabel(sipCurrency) }})</label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="sipGoalAmount"
                  type="range"
                  :min="goalAmountMin"
                  :max="goalAmountMax"
                  :step="goalAmountStep"
                  class="sip-slider flex-1 h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--resultInvested)] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div class="flex items-center gap-1 shrink-0">
                  <span class="text-[var(--textMuted)] text-sm">{{ currencyLabel(sipCurrency) }}</span>
                  <input
                    v-model.number="sipGoalAmount"
                    type="number"
                    :min="goalAmountMin"
                    :max="goalAmountMax"
                    :step="goalAmountStep"
                    class="w-28 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4">
              <label class="block text-sm text-[var(--textMuted)] mb-1">Investment duration</label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="sipYears"
                  type="range"
                  :min="yearsMin"
                  :max="yearsMax"
                  class="sip-slider flex-1 h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--resultInvested)] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div class="flex items-center gap-1 shrink-0">
                  <input
                    v-model.number="sipYears"
                    type="number"
                    :min="yearsMin"
                    :max="yearsMax"
                    class="w-16 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                  />
                  <span class="text-[var(--textMuted)] text-sm">year{{ sipYears !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>

            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4">
              <label class="block text-sm text-[var(--textMuted)] mb-1">Expected rate of return</label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="sipReturnPct"
                  type="range"
                  :min="returnMin"
                  :max="returnMax"
                  :step="returnStep"
                  class="sip-slider flex-1 h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--resultInvested)] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div class="flex items-center gap-1 shrink-0">
                  <input
                    v-model.number="sipReturnPct"
                    type="number"
                    :min="returnMin"
                    :max="returnMax"
                    :step="returnStep"
                    class="w-16 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none"
                  />
                  <span class="text-[var(--textMuted)] text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="sipTab === 'goalSip' && goalSipResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4">
            <p class="text-[var(--textMuted)] text-sm">Monthly investment needed</p>
            <p class="text-lg font-semibold text-[var(--resultEstimated)]">{{ formatMoney(goalSipResult.requiredMonthly, sipCurrency) }}</p>
          </div>

          <div v-if="sipDisplayResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4 space-y-3">
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <p class="text-[var(--text)] flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--resultGains)] shrink-0" aria-hidden="true"></span>
                Invested amount: <span class="font-medium text-[var(--resultGains)]">{{ formatMoney(sipDisplayResult.invested, sipCurrency) }}</span>
              </p>
              <p class="text-[var(--text)] flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--resultInvested)] shrink-0" aria-hidden="true"></span>
                Estimated returns: <span class="font-medium text-[var(--resultInvested)]">{{ formatMoney(sipDisplayResult.gains, sipCurrency) }}</span>
              </p>
            </div>
            <p class="text-[var(--text)] font-semibold">Total value: {{ formatMoney(sipDisplayResult.fv, sipCurrency) }}</p>
            <div class="flex h-8 rounded overflow-hidden bg-[var(--border)]">
              <div
                class="h-full bg-[var(--resultGains)] flex items-center justify-center text-xs font-medium text-white min-w-0"
                :style="{ width: sipInvestedPct + '%' }"
              >
                <span v-if="sipInvestedPct >= 12">{{ sipInvestedPct }}%</span>
              </div>
              <div
                class="h-full bg-[var(--resultInvested)] flex items-center justify-center text-xs font-medium text-white min-w-0"
                :style="{ width: sipReturnsPct + '%' }"
              >
                <span v-if="sipReturnsPct >= 12">{{ sipReturnsPct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- EMI Calculator -->
        <div v-if="selectedTool === 'emi'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">EMI Calculator</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Currency</label>
              <select
                v-model="emiCurrency"
                class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none transition-shadow"
              >
                <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Principal ({{ currencyLabel(emiCurrency) }})</label>
              <input
                v-model.number="emiPrincipal"
                type="number"
                min="1"
                class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none transition-shadow"
              />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Interest rate (% p.a.)</label>
              <input
                v-model.number="emiRatePct"
                type="number"
                min="0"
                step="0.1"
                class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none transition-shadow"
              />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Tenure (months)</label>
              <input
                v-model.number="emiMonths"
                type="number"
                min="1"
                class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none transition-shadow"
              />
            </div>
          </div>
          <div v-if="emiResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] p-4 space-y-2">
            <p class="text-[var(--text)]">EMI: <strong class="text-[var(--accent)]">{{ formatMoney(emiResult.emi, emiCurrency) }}</strong></p>
            <p class="text-[var(--textMuted)] text-sm">Total payment: {{ formatMoney(emiResult.total, emiCurrency) }} · Total interest: {{ formatMoney(emiResult.interest, emiCurrency) }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedTool === 'notes'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">Notes</h2>
          <textarea
            v-model="notesContent"
            rows="12"
            placeholder="Write your notes, ideas, or reminders here..."
            class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] placeholder-[var(--textMuted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none resize-y min-h-[200px]"
          />
          <p class="text-[var(--textMuted)] text-xs">Saved automatically in this device.</p>
        </div>

        <!-- Inflation -->
        <div v-if="selectedTool === 'inflation'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">Inflation Calculator</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Currency</label>
              <select v-model="infCurrency" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none">
                <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Today's amount ({{ currencyLabel(infCurrency) }})</label>
              <input v-model.number="infAmount" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-40 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Inflation (% p.a.)</label>
              <input v-model.number="infRate" type="number" min="0" step="0.5" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Years</label>
              <input v-model.number="infYears" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
          </div>
          <div v-if="inflationResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] p-4">
            <p class="text-[var(--text)]">In {{ infYears }} years you will need <strong class="text-[var(--resultEstimated)]">{{ formatMoney(inflationResult.fv, infCurrency) }}</strong> for the same purchasing power.</p>
          </div>
        </div>

        <!-- FD -->
        <div v-if="selectedTool === 'fd'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">FD Calculator</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Currency</label>
              <select v-model="fdCurrency" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none">
                <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Principal ({{ currencyLabel(fdCurrency) }})</label>
              <input v-model.number="fdPrincipal" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Tenure (years)</label>
              <input v-model.number="fdYears" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Interest rate (% p.a.)</label>
              <input v-model.number="fdRate" type="number" min="0" step="0.1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
          </div>
          <div v-if="fdResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] p-4 space-y-2">
            <p class="text-[var(--text)]">Maturity amount: <strong class="text-[var(--resultEstimated)]">{{ formatMoney(fdResult.maturity, fdCurrency) }}</strong></p>
            <p class="text-[var(--textMuted)] text-sm">Interest earned: {{ formatMoney(fdResult.interest, fdCurrency) }}</p>
          </div>
        </div>

        <!-- RD -->
        <div v-if="selectedTool === 'rd'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">RD Calculator</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Currency</label>
              <select v-model="rdCurrency" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none">
                <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Monthly deposit ({{ currencyLabel(rdCurrency) }})</label>
              <input v-model.number="rdMonthly" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Tenure (months)</label>
              <input v-model.number="rdMonths" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Interest rate (% p.a.)</label>
              <input v-model.number="rdRate" type="number" min="0" step="0.1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none" />
            </div>
          </div>
          <div v-if="rdResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] p-4 space-y-2">
            <p class="text-[var(--text)]">Maturity amount: <strong class="text-[var(--resultEstimated)]">{{ formatMoney(rdResult.maturity, rdCurrency) }}</strong></p>
            <p class="text-[var(--textMuted)] text-sm">Invested: {{ formatMoney(rdResult.invested, rdCurrency) }} · Interest: {{ formatMoney(rdResult.interest, rdCurrency) }}</p>
          </div>
        </div>

        <!-- Loan Comparison -->
        <div v-if="selectedTool === 'loanCompare'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">Loan Comparison</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4 space-y-3">
              <h3 class="font-medium text-[var(--text)]">Loan 1</h3>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <label class="block text-xs text-[var(--textMuted)]">Principal ({{ currencyLabel(lcCurrency) }})</label>
                  <input v-model.number="lc1Principal" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-[var(--textMuted)]">Rate (% p.a.)</label>
                  <input v-model.number="lc1Rate" type="number" min="0" step="0.1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-[var(--textMuted)]">Tenure (months)</label>
                  <input v-model.number="lc1Months" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                </div>
              </div>
              <div v-if="lc1Result" class="pt-2 border-t border-[var(--border)] text-sm">
                <p class="text-[var(--text)]">EMI: <strong>{{ formatMoney(lc1Result.emi, lcCurrency) }}</strong></p>
                <p class="text-[var(--textMuted)]">Total interest: {{ formatMoney(lc1Result.interest, lcCurrency) }}</p>
              </div>
            </div>
            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4 space-y-3">
              <h3 class="font-medium text-[var(--text)]">Loan 2</h3>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <label class="block text-xs text-[var(--textMuted)]">Principal ({{ currencyLabel(lcCurrency) }})</label>
                  <input v-model.number="lc2Principal" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-[var(--textMuted)]">Rate (% p.a.)</label>
                  <input v-model.number="lc2Rate" type="number" min="0" step="0.1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs text-[var(--textMuted)]">Tenure (months)</label>
                  <input v-model.number="lc2Months" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                </div>
              </div>
              <div v-if="lc2Result" class="pt-2 border-t border-[var(--border)] text-sm">
                <p class="text-[var(--text)]">EMI: <strong>{{ formatMoney(lc2Result.emi, lcCurrency) }}</strong></p>
                <p class="text-[var(--textMuted)]">Total interest: {{ formatMoney(lc2Result.interest, lcCurrency) }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-4">
            <label class="block text-sm text-[var(--textMuted)]">Currency</label>
            <select v-model="lcCurrency" class="rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none">
              <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <!-- Retirement Corpus -->
        <div v-if="selectedTool === 'retirement'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">Retirement Corpus</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Currency</label>
              <select v-model="retCurrency" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-opacity-40 focus:outline-none">
                <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Current age</label>
              <input v-model.number="retCurrentAge" type="number" min="18" max="70" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Retirement age</label>
              <input v-model.number="retRetireAge" type="number" min="40" max="80" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Monthly expense after retirement ({{ currencyLabel(retCurrency) }})</label>
              <input v-model.number="retMonthlyExpense" type="number" min="1" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Expected inflation (% p.a.)</label>
              <input v-model.number="retInflation" type="number" min="0" step="0.5" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Expected return on investment (% p.a.)</label>
              <input v-model.number="retReturn" type="number" min="0" step="0.5" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
          </div>
          <div v-if="retCorpusResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] p-4 space-y-2">
            <p class="text-[var(--text)]">Corpus needed at retirement (25 years expense): <strong class="text-[var(--resultEstimated)]">{{ formatMoney(retCorpusResult.corpus, retCurrency) }}</strong></p>
            <p class="text-[var(--textMuted)] text-sm">Monthly SIP needed (for {{ retCorpusResult.yearsToRet }} years at {{ retReturn }}%): <strong class="text-[var(--text)]">{{ formatMoney(retCorpusResult.sipNeeded, retCurrency) }}</strong></p>
          </div>
        </div>

        <!-- Tax Estimate -->
        <div v-if="selectedTool === 'tax'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">Tax Estimate (India)</h2>
          <p class="text-[var(--textMuted)] text-sm">Simplified FY24-25. For exact tax use IT portal.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Regime</label>
              <select v-model="taxRegime" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none">
                <option value="new">New regime</option>
                <option value="old">Old regime</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-[var(--textMuted)] mb-1">Annual income (Rs)</label>
              <input v-model.number="taxIncome" type="number" min="0" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div v-if="taxRegime === 'old'">
              <label class="block text-sm text-[var(--textMuted)] mb-1">Deductions (80C, 80D, etc.) (Rs)</label>
              <input v-model.number="taxDeductions" type="number" min="0" class="w-full rounded-lg bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
            </div>
          </div>
          <div v-if="taxResult" class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] border-l-4 border-l-[var(--accent)] p-4 space-y-2">
            <p class="text-[var(--text)]">Estimated tax: <strong class="text-[var(--resultEstimated)]">Rs {{ formatNum(taxResult.tax) }}</strong></p>
            <p class="text-[var(--textMuted)] text-sm">Effective rate: {{ taxResult.effective }}%</p>
          </div>
        </div>

        <!-- Quick Converters -->
        <div v-if="selectedTool === 'converters'" class="card p-5 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-[var(--text)]">Quick Converters</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4">
              <h3 class="font-medium text-[var(--text)] mb-2">Annual to monthly rate</h3>
              <div class="flex items-center gap-2">
                <input v-model.number="convRatePct" type="number" min="0" step="0.1" class="w-20 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                <span class="text-[var(--textMuted)]">% p.a. =</span>
                <span class="font-medium text-[var(--resultEstimated)]">{{ convRateMonthly }}% per month</span>
              </div>
            </div>
            <div class="rounded-lg bg-[var(--resultBlock)] border border-[var(--border)] p-4">
              <h3 class="font-medium text-[var(--text)] mb-2">Rule of 72 (doubling time)</h3>
              <div class="flex items-center gap-2 flex-wrap">
                <input v-model.number="convDoublingRate" type="number" min="0.1" step="0.5" class="w-20 rounded-lg bg-[var(--panel)] border border-[var(--border)] px-2 py-1.5 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none" />
                <span class="text-[var(--textMuted)]">% return =</span>
                <span v-if="convDoublingYears" class="font-medium text-[var(--resultEstimated)]">~{{ convDoublingYears }} years to double</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

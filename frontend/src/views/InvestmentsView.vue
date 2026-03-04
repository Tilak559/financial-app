<script setup>
import { computed } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import SummaryCard from '../components/SummaryCard.vue'
import LineChart from '../components/LineChart.vue'
import RegionPageHeader from '../components/RegionPageHeader.vue'
import { investmentsByRegion, getTotals, totalValueHistory } from '../data/investments'
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

const totals = computed(() => getTotals(effectiveRegion.value))

const data = computed(() => investmentsByRegion[effectiveRegion.value] || investmentsByRegion.all)

const chartSeries = computed(() => {
  const id = effectiveRegion.value
  const match = totalValueHistory.series.find((s) => s.name.toLowerCase() === id)
  return match ? [match] : totalValueHistory.series
})

function formatCurrency(n) {
  const code = displayCurrency.value
  if (code === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function formatPct(n) {
  const s = n >= 0 ? '+' : ''
  return s + Number(n).toFixed(1) + '%'
}
</script>

<template>
  <PageContainer title="Investments">
    <RegionPageHeader
      :region-options="regionOptions"
      :currency-options="currencyDropdownOptions"
      v-model:selected-region="selectedRegion"
      v-model:currency="currency"
      :multi-region="displayPrefs.multiRegion"
      :single-country-label="singleCountryLabel"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <SummaryCard
        title="Total value"
        :value="formatCurrency(totals.total)"
        :detail="formatPct(totals.totalChange) + ' total change'"
        :detail-variant="totals.totalChange >= 0 ? 'accent' : 'negative'"
      />
      <SummaryCard
        title="Stocks"
        :value="formatCurrency(totals.stocksTotal)"
        :detail="data.stocks.length + ' holdings'"
      />
      <SummaryCard
        title="Crypto"
        :value="formatCurrency(totals.cryptoTotal)"
        :detail="data.crypto.length + ' holdings'"
      />
      <SummaryCard
        title="ETFs & Mutual funds"
        :value="formatCurrency(totals.etfsTotal + totals.mutualFundsTotal)"
        :detail="data.etfs.length + data.mutualFunds.length + ' holdings'"
      />
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Total value over time</h3>
      <LineChart :labels="totalValueHistory.labels" :series="chartSeries" />
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Stocks</h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border)] text-left text-[var(--textMuted)]">
              <th class="py-2.5 pr-4 font-medium">Name</th>
              <th class="py-2.5 pr-4 font-medium">Symbol</th>
              <th class="py-2.5 pr-4 font-medium text-right">Value</th>
              <th class="py-2.5 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in data.stocks"
              :key="row.symbol"
              class="border-b border-[var(--border)] last:border-b-0"
            >
              <td class="py-2.5 pr-4 text-[var(--text)]">{{ row.name }}</td>
              <td class="py-2.5 pr-4 text-[var(--textMuted)]">{{ row.symbol }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--text)]">{{ formatCurrency(row.value) }}</td>
              <td :class="['py-2.5 text-right tabular-nums', row.changePct >= 0 ? 'text-accent' : 'text-[var(--negative)]']">
                {{ formatPct(row.changePct) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!data.stocks.length" class="py-6 text-center text-[var(--textMuted)] text-sm">No stocks in this region.</p>
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Crypto</h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border)] text-left text-[var(--textMuted)]">
              <th class="py-2.5 pr-4 font-medium">Name</th>
              <th class="py-2.5 pr-4 font-medium">Symbol</th>
              <th class="py-2.5 pr-4 font-medium text-right">Value</th>
              <th class="py-2.5 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in data.crypto"
              :key="row.symbol"
              class="border-b border-[var(--border)] last:border-b-0"
            >
              <td class="py-2.5 pr-4 text-[var(--text)]">{{ row.name }}</td>
              <td class="py-2.5 pr-4 text-[var(--textMuted)]">{{ row.symbol }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--text)]">{{ formatCurrency(row.value) }}</td>
              <td :class="['py-2.5 text-right tabular-nums', row.changePct >= 0 ? 'text-accent' : 'text-[var(--negative)]']">
                {{ formatPct(row.changePct) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!data.crypto.length" class="py-6 text-center text-[var(--textMuted)] text-sm">No crypto in this region.</p>
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">ETFs</h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border)] text-left text-[var(--textMuted)]">
              <th class="py-2.5 pr-4 font-medium">Name</th>
              <th class="py-2.5 pr-4 font-medium">Symbol</th>
              <th class="py-2.5 pr-4 font-medium text-right">Value</th>
              <th class="py-2.5 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in data.etfs"
              :key="row.symbol"
              class="border-b border-[var(--border)] last:border-b-0"
            >
              <td class="py-2.5 pr-4 text-[var(--text)]">{{ row.name }}</td>
              <td class="py-2.5 pr-4 text-[var(--textMuted)]">{{ row.symbol }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--text)]">{{ formatCurrency(row.value) }}</td>
              <td :class="['py-2.5 text-right tabular-nums', row.changePct >= 0 ? 'text-accent' : 'text-[var(--negative)]']">
                {{ formatPct(row.changePct) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!data.etfs.length" class="py-6 text-center text-[var(--textMuted)] text-sm">No ETFs in this region.</p>
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Mutual funds</h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border)] text-left text-[var(--textMuted)]">
              <th class="py-2.5 pr-4 font-medium">Name</th>
              <th class="py-2.5 pr-4 font-medium">Symbol</th>
              <th class="py-2.5 pr-4 font-medium text-right">Value</th>
              <th class="py-2.5 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in data.mutualFunds"
              :key="row.symbol"
              class="border-b border-[var(--border)] last:border-b-0"
            >
              <td class="py-2.5 pr-4 text-[var(--text)]">{{ row.name }}</td>
              <td class="py-2.5 pr-4 text-[var(--textMuted)]">{{ row.symbol }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--text)]">{{ formatCurrency(row.value) }}</td>
              <td :class="['py-2.5 text-right tabular-nums', row.changePct >= 0 ? 'text-accent' : 'text-[var(--negative)]']">
                {{ formatPct(row.changePct) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!data.mutualFunds.length" class="py-6 text-center text-[var(--textMuted)] text-sm">No mutual funds in this region.</p>
    </div>
  </PageContainer>
</template>

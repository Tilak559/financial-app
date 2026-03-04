<script setup>
import { computed } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import SummaryCard from '../components/SummaryCard.vue'
import RegionPageHeader from '../components/RegionPageHeader.vue'
import SourceSummaryCard from '../components/SourceSummaryCard.vue'
import {
  accountsByRegion,
  getAccountTotals,
  banksBySource,
  liabilitiesBySource,
  assetsBySource,
} from '../data/accounts'
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

const totals = computed(() => getAccountTotals(effectiveRegion.value))
const data = computed(() => accountsByRegion[effectiveRegion.value] || accountsByRegion.all)
const bankSources = computed(() => banksBySource(effectiveRegion.value))
const liabilitySources = computed(() => liabilitiesBySource(effectiveRegion.value))
const assetSources = computed(() => assetsBySource(effectiveRegion.value))

function formatInCurrency(amount, code) {
  if (code === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function formatDisplayCurrency(n) {
  return formatInCurrency(n, displayCurrency.value)
}

function usagePct(card) {
  if (!card.limit) return 0
  return Math.round((card.used / card.limit) * 100)
}
</script>

<template>
  <PageContainer title="Accounts">
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
        title="Total in bank"
        :value="formatDisplayCurrency(totals.totalInBank)"
        :detail="data.banks.length + ' accounts'"
      />
      <SummaryCard
        title="Liabilities"
        :value="formatDisplayCurrency(totals.totalLiabilities)"
        :detail="data.creditCards.length + ' credit cards'"
        :detail-variant="totals.totalLiabilities > 0 ? 'negative' : 'muted'"
      />
      <SummaryCard
        title="Assets"
        :value="formatDisplayCurrency(totals.totalAssets)"
        :detail="(data.assets.length + data.banks.length) + ' sources'"
      />
      <SummaryCard
        title="Net worth"
        :value="formatDisplayCurrency(totals.netWorth)"
        detail="Assets minus liabilities"
        :detail-variant="totals.netWorth >= 0 ? 'accent' : 'negative'"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <SourceSummaryCard
        title="Bank by source"
        :items="bankSources"
        amount-key="balance"
        empty-message="No accounts"
        :format-amount="formatDisplayCurrency"
      />
      <SourceSummaryCard
        title="Liabilities by source"
        :items="liabilitySources"
        amount-key="balanceDue"
        empty-message="No liabilities"
        amount-variant="negative"
        :format-amount="formatDisplayCurrency"
      />
      <SourceSummaryCard
        title="Assets by source"
        :items="assetSources"
        amount-key="value"
        empty-message="No assets"
        :format-amount="formatDisplayCurrency"
      />
    </div>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Credit cards</h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border)] text-left text-[var(--textMuted)]">
              <th class="py-2.5 pr-4 font-medium">Card</th>
              <th class="py-2.5 pr-4 font-medium">Source</th>
              <th class="py-2.5 pr-4 font-medium text-right">Limit</th>
              <th class="py-2.5 pr-4 font-medium text-right">Used</th>
              <th class="py-2.5 pr-4 font-medium text-right">Balance due</th>
              <th class="py-2.5 font-medium text-right">Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="card in data.creditCards"
              :key="card.id"
              class="border-b border-[var(--border)] last:border-b-0"
            >
              <td class="py-2.5 pr-4 text-[var(--text)] font-medium">{{ card.name }}</td>
              <td class="py-2.5 pr-4 text-[var(--textMuted)]">{{ card.source }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--text)]">{{ formatDisplayCurrency(card.limit) }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--text)]">{{ formatDisplayCurrency(card.used) }}</td>
              <td class="py-2.5 pr-4 text-right tabular-nums text-[var(--negative)]">{{ formatDisplayCurrency(card.balanceDue) }}</td>
              <td class="py-2.5 text-right">
                <span
                  :class="[
                    'tabular-nums font-medium',
                    usagePct(card) > 80 ? 'text-[var(--negative)]' : usagePct(card) > 30 ? 'text-amber-500' : 'text-accent'
                  ]"
                >
                  {{ usagePct(card) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!data.creditCards.length" class="py-6 text-center text-[var(--textMuted)] text-sm">No credit cards in this region.</p>
    </div>
  </PageContainer>
</template>

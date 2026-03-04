<script setup>
import { ref, computed } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import {
  transactionTabs,
  bankTransactions,
  categories,
  currencies,
  groupByDate,
  filterByMonth,
} from '../data/transactions'

const activeTab = ref('banks')
const monthFilter = ref('all')
const manualEntries = ref([])

const categoryOptions = computed(() => categories.map((c) => ({ value: c.id, label: c.label })))
const subcategoryOptions = computed(() => {
  const cat = categories.find((c) => c.id === form.category)
  return cat ? cat.subcategories.map((s) => ({ value: s.id, label: s.label })) : []
})

const form = ref({
  category: '',
  subcategory: '',
  date: new Date().toISOString().slice(0, 10),
  currency: 'USD',
  amount: '',
  note: '',
})

const monthOptions = computed(() => {
  const set = new Set()
  bankTransactions.forEach((t) => {
    const [y, m] = t.date.split('-')
    set.add(`${y}-${m}`)
  })
  manualEntries.value.forEach((t) => {
    const [y, m] = t.date.split('-')
    set.add(`${y}-${m}`)
  })
  const list = [...set].sort().reverse()
  const labels = list.map((key) => {
    const [y, m] = key.split('-').map(Number)
    const d = new Date(y, m - 1, 1)
    return { value: key, label: d.toLocaleString('default', { month: 'long', year: 'numeric' }) }
  })
  return [{ value: 'all', label: 'All' }, ...labels]
})

const bankList = computed(() => {
  const list = bankTransactions.map((t) => ({ ...t, source: 'bank', currency: 'USD' }))
  return filterByMonth(list, monthFilter.value)
})

const manualList = computed(() => {
  const list = manualEntries.value.map((t) => ({ ...t, source: 'manual' }))
  return filterByMonth(list, monthFilter.value)
})

const combinedList = computed(() => {
  const list = [...bankList.value, ...manualList.value]
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const displayedGroups = computed(() => {
  let list = []
  if (activeTab.value === 'banks') list = bankList.value
  else if (activeTab.value === 'manual') list = manualList.value
  else list = combinedList.value
  return groupByDate(list)
})

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatAmount(item) {
  const n = Number(item.amount)
  const code = item.currency || 'USD'
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))
  return n >= 0 ? `+${formatted}` : `-${formatted}`
}

function isPositive(item) {
  return Number(item.amount) >= 0
}

function addManual() {
  const amount = parseFloat(form.value.amount)
  if (!form.value.category || !form.value.subcategory || !form.value.date || !form.value.currency || isNaN(amount)) return
  manualEntries.value = [
    ...manualEntries.value,
    {
      id: 'm' + Date.now(),
      date: form.value.date,
      name: form.value.note || categories.find((c) => c.id === form.value.category)?.label || 'Manual',
      amount: amount,
      status: null,
      icon: 'manual',
      currency: form.value.currency,
      category: form.value.category,
      subcategory: form.value.subcategory,
      note: form.value.note,
    },
  ]
  form.value = {
    category: '',
    subcategory: '',
    date: new Date().toISOString().slice(0, 10),
    currency: 'USD',
    amount: '',
    note: '',
  }
}

function iconSvg(icon) {
  const icons = {
    interest: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0-9c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    subscription: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    transfer: 'M8 7h12m0 0l-4-4m4 4l4-4m0 6H4m0 0l4 4m-4-4l4-4',
    income: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0-9c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    deposit: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V8',
    bill: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    shopping: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    manual: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  }
  const d = icons[icon] || icons.manual
  return d
}
</script>

<template>
  <PageContainer title="Transactions">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div class="flex gap-1 border-b border-[var(--border)]">
        <button
          v-for="t in transactionTabs"
          :key="t.id"
          @click="activeTab = t.id"
          :class="[
            'px-3 py-2 text-sm font-medium transition-colors -mb-px',
            activeTab === t.id
              ? 'text-accent border-b-2 border-accent'
              : 'text-[var(--textMuted)] hover:text-[var(--text)]'
          ]"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-[var(--textMuted)]">Period</span>
        <select
          v-model="monthFilter"
          class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text)]"
        >
          <option v-for="opt in monthOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <template v-if="activeTab === 'manual'">
      <div class="card p-5 mb-5">
        <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Add transaction</h3>
        <form @submit.prevent="addManual" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-[var(--textMuted)] mb-1">Category</label>
            <select
              v-model="form.category"
              required
              @change="form.subcategory = ''"
              class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            >
              <option value="">Select category</option>
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[var(--textMuted)] mb-1">Subcategory</label>
            <select
              v-model="form.subcategory"
              required
              class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            >
              <option value="">Select subcategory</option>
              <option v-for="opt in subcategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[var(--textMuted)] mb-1">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            />
          </div>
          <div>
            <label class="block text-xs text-[var(--textMuted)] mb-1">Currency</label>
            <select
              v-model="form.currency"
              required
              class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            >
              <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[var(--textMuted)] mb-1">Amount</label>
            <input
              v-model="form.amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs text-[var(--textMuted)] mb-1">Note (optional)</label>
            <input
              v-model="form.note"
              type="text"
              placeholder="Description"
              class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            />
          </div>
          <div class="sm:col-span-2">
            <button type="submit" class="btn-deposit px-4 py-2 rounded-lg text-sm font-medium">
              Add transaction
            </button>
          </div>
        </form>
      </div>
    </template>

    <div class="card p-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">
        {{ activeTab === 'banks' ? 'Bank & card transactions' : activeTab === 'manual' ? 'Manual entries' : 'All transactions' }}
      </h3>
      <div v-if="displayedGroups.length" class="divide-y divide-[var(--border)]">
        <div v-for="group in displayedGroups" :key="group.date" class="py-3 first:pt-0">
          <p class="text-xs text-[var(--textMuted)] mb-2">{{ formatDate(group.date) }}</p>
          <div class="space-y-1">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-[var(--border)]/50"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :class="isPositive(item) ? 'bg-accent/15' : 'bg-gray-500/15'"
              >
                <svg class="w-5 h-5" :class="isPositive(item) ? 'text-accent' : 'text-[var(--textMuted)]'" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="iconSvg(item.icon)" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-[var(--text)] truncate">{{ item.name }}</p>
                <p v-if="item.status" class="text-xs text-[var(--textMuted)]">{{ item.status }}</p>
              </div>
              <p :class="['text-sm font-medium tabular-nums shrink-0', isPositive(item) ? 'text-accent' : 'text-[var(--text)]']">
                {{ formatAmount(item) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="py-8 text-center text-[var(--textMuted)] text-sm">
        {{ activeTab === 'banks' ? 'No bank transactions in this period.' : activeTab === 'manual' ? 'No manual entries yet. Add one above.' : 'No transactions in this period.' }}
      </p>
    </div>
  </PageContainer>
</template>

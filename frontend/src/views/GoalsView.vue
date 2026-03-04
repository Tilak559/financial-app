<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import SummaryCard from '../components/SummaryCard.vue'
import {
  goalCategories,
  goalCurrencies,
  defaultGoals,
  GOALS_STORAGE_KEY,
} from '../data/goals'

const goals = ref([])
const filter = ref('all')
const sortBy = ref('progress')
const showForm = ref(false)
const editingId = ref(null)
const addAmounts = reactive({})

const form = ref({
  name: '',
  category: 'other',
  targetAmount: '',
  currency: 'USD',
  savedAmount: '0',
  deadline: '',
})

const categoryOptions = goalCategories.map((c) => ({ value: c.id, label: c.label }))
const currencyOptions = goalCurrencies

const completedCount = computed(() => goals.value.filter((g) => g.savedAmount >= g.targetAmount).length)
const activeCount = computed(() => goals.value.length - completedCount.value)

const totalSavedByCurrency = computed(() => {
  const by = {}
  goals.value.forEach((g) => {
    by[g.currency] = (by[g.currency] || 0) + Number(g.savedAmount)
  })
  return by
})

const totalTargetByCurrency = computed(() => {
  const by = {}
  goals.value.forEach((g) => {
    by[g.currency] = (by[g.currency] || 0) + Number(g.targetAmount)
  })
  return by
})

const filteredGoals = computed(() => {
  let list = goals.value
  if (filter.value === 'active') list = list.filter((g) => g.savedAmount < g.targetAmount)
  else if (filter.value === 'completed') list = list.filter((g) => g.savedAmount >= g.targetAmount)
  return [...list].sort((a, b) => {
    if (sortBy.value === 'progress') {
      const pctA = a.targetAmount ? (a.savedAmount / a.targetAmount) * 100 : 0
      const pctB = b.targetAmount ? (b.savedAmount / b.targetAmount) * 100 : 0
      return pctB - pctA
    }
    if (sortBy.value === 'deadline') {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    return (a.name || '').localeCompare(b.name || '')
  })
})

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY)
    goals.value = raw ? JSON.parse(raw) : [...defaultGoals]
  } catch {
    goals.value = [...defaultGoals]
  }
}

function saveGoals() {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value))
}

function formatAmount(amount, currencyCode) {
  const c = goalCurrencies.find((x) => x.code === currencyCode)
  const code = c ? currencyCode : 'USD'
  if (code === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function progressPct(goal) {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 0
  return Math.min(100, Math.round((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100))
}

function openAdd() {
  editingId.value = null
  form.value = {
    name: '',
    category: 'other',
    targetAmount: '',
    currency: 'USD',
    savedAmount: '0',
    deadline: '',
  }
  showForm.value = true
}

function openEdit(goal) {
  editingId.value = goal.id
  form.value = {
    name: goal.name,
    category: goal.category || 'other',
    targetAmount: String(goal.targetAmount),
    currency: goal.currency || 'USD',
    savedAmount: String(goal.savedAmount),
    deadline: goal.deadline || '',
  }
  showForm.value = true
}

function submitGoal() {
  const name = (form.value.name || '').trim()
  const target = parseFloat(form.value.targetAmount)
  const saved = parseFloat(form.value.savedAmount) || 0
  if (!name || isNaN(target) || target <= 0) return
  const payload = {
    name,
    category: form.value.category || 'other',
    targetAmount: target,
    currency: form.value.currency || 'USD',
    savedAmount: saved,
    deadline: (form.value.deadline || '').trim() || null,
  }
  if (editingId.value) {
    const i = goals.value.findIndex((g) => g.id === editingId.value)
    if (i >= 0) goals.value[i] = { ...goals.value[i], ...payload }
  } else {
    goals.value.push({
      id: 'g' + Date.now(),
      ...payload,
    })
  }
  saveGoals()
  showForm.value = false
}

function addMoney(goal, amount) {
  const n = typeof amount === 'number' ? amount : parseFloat(amount)
  if (isNaN(n) || n <= 0) return
  const g = goals.value.find((x) => x.id === goal.id)
  if (g) {
    g.savedAmount = Number(g.savedAmount) + n
    saveGoals()
    addAmounts[goal.id] = ''
  }
}

function removeGoal(goal) {
  if (!confirm('Remove this goal?')) return
  goals.value = goals.value.filter((g) => g.id !== goal.id)
  saveGoals()
}

function categoryLabel(id) {
  return goalCategories.find((c) => c.id === id)?.label || id
}

function formatDeadline(dateStr) {
  if (!dateStr) return 'No deadline'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function summaryLine(byCurrency) {
  return Object.entries(byCurrency)
    .map(([code, val]) => formatAmount(val, code))
    .join(' · ')
}

onMounted(loadGoals)
</script>

<template>
  <PageContainer title="Goals">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div class="flex gap-1 border-b border-[var(--border)]">
        <button
          v-for="f in [{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'completed', label: 'Completed' }]"
          :key="f.id"
          @click="filter = f.id"
          :class="[
            'px-3 py-2 text-sm font-medium transition-colors -mb-px',
            filter === f.id ? 'text-accent border-b-2 border-accent' : 'text-[var(--textMuted)] hover:text-[var(--text)]'
          ]"
        >
          {{ f.label }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-[var(--textMuted)]">Sort</span>
        <select
          v-model="sortBy"
          class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text)]"
        >
          <option value="progress">By progress</option>
          <option value="deadline">By deadline</option>
          <option value="name">By name</option>
        </select>
        <button type="button" class="btn-deposit px-4 py-2 rounded-lg text-sm font-medium" @click="openAdd">
          Add goal
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
      <SummaryCard title="Goals" :value="goals.length" detail="Total goals" />
      <SummaryCard title="Active" :value="activeCount" detail="In progress" />
      <SummaryCard title="Completed" :value="completedCount" :detail-variant="completedCount > 0 ? 'accent' : 'muted'" />
      <div class="card p-5">
        <p class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-2">Total saved</p>
        <p class="text-lg font-bold text-[var(--text)] tabular-nums truncate" :title="summaryLine(totalSavedByCurrency)">
          {{ summaryLine(totalSavedByCurrency) }}
        </p>
        <p class="text-sm text-[var(--textMuted)] mt-1">Across all currencies</p>
      </div>
    </div>

    <div v-if="showForm" class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">
        {{ editingId ? 'Edit goal' : 'New goal' }}
      </h3>
      <form @submit.prevent="submitGoal" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-xs text-[var(--textMuted)] mb-1">Goal name</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. Emergency fund"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          />
        </div>
        <div>
          <label class="block text-xs text-[var(--textMuted)] mb-1">Category</label>
          <select
            v-model="form.category"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          >
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-[var(--textMuted)] mb-1">Currency</label>
          <select
            v-model="form.currency"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          >
            <option v-for="c in currencyOptions" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-[var(--textMuted)] mb-1">Target amount</label>
          <input
            v-model="form.targetAmount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          />
        </div>
        <div>
          <label class="block text-xs text-[var(--textMuted)] mb-1">Saved so far</label>
          <input
            v-model="form.savedAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs text-[var(--textMuted)] mb-1">Deadline (optional)</label>
          <input
            v-model="form.deadline"
            type="date"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          />
        </div>
        <div class="sm:col-span-2 flex gap-2">
          <button type="submit" class="btn-deposit px-4 py-2 rounded-lg text-sm font-medium">{{ editingId ? 'Save' : 'Add goal' }}</button>
          <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-[var(--textMuted)] hover:bg-[var(--border)]" @click="showForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <div class="space-y-4">
      <div
        v-for="goal in filteredGoals"
        :key="goal.id"
        class="card p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 class="text-base font-semibold text-[var(--text)]">{{ goal.name }}</h3>
            <p class="text-xs text-[var(--textMuted)]">{{ categoryLabel(goal.category) }} · {{ formatDeadline(goal.deadline) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="p-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--border)]" aria-label="Edit" @click="openEdit(goal)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
            <button type="button" class="p-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--negative)]/20 hover:text-[var(--negative)]" aria-label="Remove" @click="removeGoal(goal)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-sm mb-3">
          <span class="text-[var(--textMuted)]">Saved {{ formatAmount(goal.savedAmount, goal.currency) }} of {{ formatAmount(goal.targetAmount, goal.currency) }}</span>
          <span :class="['font-medium tabular-nums', progressPct(goal) >= 100 ? 'text-accent' : 'text-[var(--text)]']">
            {{ progressPct(goal) }}%
          </span>
        </div>
        <div class="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-4">
          <div
            class="h-full rounded-full transition-all"
            :class="progressPct(goal) >= 100 ? 'bg-accent' : 'bg-accent/70'"
            :style="{ width: Math.min(100, progressPct(goal)) + '%' }"
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input
            v-model="addAmounts[goal.id]"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Add amount"
            class="w-32 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-sm text-[var(--text)]"
            @keydown.enter.prevent="addMoney(goal, addAmounts[goal.id])"
          />
          <button type="button" class="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/20 text-accent hover:bg-accent/30" @click="addMoney(goal, addAmounts[goal.id])">
            Add money
          </button>
        </div>
      </div>
    </div>

    <p v-if="!filteredGoals.length" class="py-10 text-center text-[var(--textMuted)] text-sm">
      {{ filter === 'all' ? 'No goals yet. Add one to get started.' : `No ${filter} goals.` }}
    </p>
  </PageContainer>
</template>

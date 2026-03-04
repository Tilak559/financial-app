<script setup>
import { ref, onMounted } from 'vue'
import { iconPaths } from './icons'
import PageContainer from './components/PageContainer.vue'
import BudgetsView from './views/BudgetsView.vue'
import InvestmentsView from './views/InvestmentsView.vue'
import TransactionsView from './views/TransactionsView.vue'
import AccountsView from './views/AccountsView.vue'
import GoalsView from './views/GoalsView.vue'
import OverviewView from './views/OverviewView.vue'
import ReportsView from './views/ReportsView.vue'
import SettingsView from './views/SettingsView.vue'
import ToolsView from './views/ToolsView.vue'

const current = ref('Overview')
const dark = ref(true)
const sidebarOpen = ref(false)

const nav = [
  { id: 'Overview', label: 'Overview', icon: 'grid' },
  { id: 'Accounts', label: 'Accounts', icon: 'wallet' },
  { id: 'Transactions', label: 'Transactions', icon: 'list' },
  { id: 'Budgets', label: 'Budgets', icon: 'bank' },
  { id: 'Investments', label: 'Investments', icon: 'chart' },
  { id: 'Goals', label: 'Goals', icon: 'flag' },
  { id: 'Reports', label: 'Reports', icon: 'doc' },
  { id: 'Tools', label: 'Tools', icon: 'calculator' },
  { id: 'Settings', label: 'Settings', icon: 'gear' },
]

function setPage(id) {
  current.value = id
  sidebarOpen.value = false
}

function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('light', !dark.value)
  localStorage.setItem('theme', dark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'light') {
    dark.value = false
    document.documentElement.classList.add('light')
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--bg)">
    <header class="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-[var(--border)]" style="background-color: var(--panel)">
      <div class="flex items-center gap-2 min-w-0">
        <button type="button" class="md:hidden p-2 -ml-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--border)] hover:text-[var(--text)]" aria-label="Open menu" @click="sidebarOpen = true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="w-8 h-8 rounded flex items-center justify-center text-accent font-bold text-sm shrink-0" style="background-color: var(--card)">F</div>
        <span class="font-semibold text-[var(--text)] truncate">Financial</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="p-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--border)]" aria-label="Search">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>
        <button class="p-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--border)]" aria-label="Notifications">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        <button @click="toggleTheme" class="p-2 rounded-lg text-[var(--textMuted)] hover:bg-[var(--border)] text-sm">{{ dark ? 'Light' : 'Dark' }}</button>
        <button class="btn-deposit ml-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
          Account
        </button>
      </div>
    </header>

    <div class="flex flex-1 min-h-0 relative">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/50 md:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      />
      <aside
        class="fixed md:relative inset-y-0 left-0 z-40 w-64 md:w-56 flex-shrink-0 flex flex-col border-r border-[var(--border)] transform transition-transform duration-200 ease-out -translate-x-full md:translate-x-0 top-12 md:top-0 bg-panel"
        :class="{ 'translate-x-0': sidebarOpen }"
      >
        <nav class="flex-1 px-3 py-4 pt-6 overflow-y-auto min-h-0">
          <button
            v-for="item in nav"
            :key="item.id"
            @click="setPage(item.id)"
            :class="[
              'w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors',
              current === item.id ? 'nav-active' : 'rounded-lg text-[var(--navInactive)] hover:bg-[var(--border)] hover:text-[var(--text)]'
            ]"
          >
            <span class="w-5 h-5 flex-shrink-0 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5">
              <svg v-if="iconPaths[item.icon]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="iconPaths[item.icon]"/></svg>
              <svg v-else fill="currentColor" viewBox="0 0 24 24"><path :d="iconPaths.grid"/></svg>
            </span>
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <main class="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto">
        <OverviewView v-if="current === 'Overview'" />
        <BudgetsView v-else-if="current === 'Budgets'" />
        <InvestmentsView v-else-if="current === 'Investments'" />
        <TransactionsView v-else-if="current === 'Transactions'" />
        <AccountsView v-else-if="current === 'Accounts'" />
        <GoalsView v-else-if="current === 'Goals'" />
        <ReportsView v-else-if="current === 'Reports'" />
        <ToolsView v-else-if="current === 'Tools'" />
        <SettingsView v-else-if="current === 'Settings'" />
        <PageContainer v-else>
          <div class="card p-5">
            <h2 class="text-base md:text-lg font-semibold text-[var(--text)] mb-1">{{ current }}</h2>
            <p class="text-[var(--textMuted)] text-sm">Content for {{ current }}.</p>
          </div>
        </PageContainer>
      </main>
    </div>
  </div>
</template>

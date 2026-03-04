<script setup>
import { ref, computed, onMounted } from 'vue'
import PageContainer from '../components/PageContainer.vue'
import {
  integrationRegions,
  INTEGRATIONS_STORAGE_KEY,
  SETTINGS_PREFS_KEY,
  defaultIntegrations,
  defaultPrefs,
  currencyOptions,
  dateFormatOptions,
  allRegions,
} from '../data/settings'

const selectedRegion = ref('all')
const prefs = ref(JSON.parse(JSON.stringify(defaultPrefs)))

const integrations = ref({
  connections: [],
  apiKeys: [],
})

const showAddConnection = ref(false)
const showAddKey = ref(false)

const connectionForm = ref({
  name: '',
  region: 'usa',
})
const keyForm = ref({
  provider: '',
  key: '',
  region: 'usa',
})

const providerOptions = [
  { value: 'plaid', label: 'Plaid' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'custom', label: 'Custom / Other' },
]

const filteredConnections = computed(() => {
  const list = integrations.value.connections || []
  if (selectedRegion.value === 'all') return list
  return list.filter((c) => c.region === selectedRegion.value)
})

const filteredApiKeys = computed(() => {
  const list = integrations.value.apiKeys || []
  if (selectedRegion.value === 'all') return list
  return list.filter((k) => k.region === selectedRegion.value)
})

function ensureRegionSettings(display) {
  const ids = ['usa', 'india', 'uk', 'germany']
  const out = display.regionSettings ? { ...display.regionSettings } : {}
  ids.forEach((id) => {
    if (!out[id]) out[id] = { currency: 'USD', dateFormat: 'MM/DD/YYYY' }
    if (!out[id].currency) out[id].currency = 'USD'
    if (!out[id].dateFormat) out[id].dateFormat = 'MM/DD/YYYY'
  })
  return out
}

function setRegionCurrency(regionId, value) {
  if (!prefs.value.display.regionSettings) prefs.value.display.regionSettings = {}
  if (!prefs.value.display.regionSettings[regionId]) prefs.value.display.regionSettings[regionId] = {}
  prefs.value.display.regionSettings[regionId].currency = value
  savePrefs()
}

function setRegionDateFormat(regionId, value) {
  if (!prefs.value.display.regionSettings) prefs.value.display.regionSettings = {}
  if (!prefs.value.display.regionSettings[regionId]) prefs.value.display.regionSettings[regionId] = {}
  prefs.value.display.regionSettings[regionId].dateFormat = value
  savePrefs()
}

function ensureAddedRegions(display) {
  const valid = ['usa', 'india', 'uk', 'germany']
  let arr = Array.isArray(display.addedRegions) ? display.addedRegions.filter((id) => valid.includes(id)) : []
  if (display.multiRegion !== false && arr.length === 0) arr = ['usa']
  return arr
}

const addedRegionRows = computed(() => {
  const added = prefs.value.display?.addedRegions || []
  return added.map((id) => allRegions.find((r) => r.id === id)).filter(Boolean)
})

const regionsAvailableToAdd = computed(() => {
  const added = prefs.value.display?.addedRegions || []
  return allRegions.filter((r) => !added.includes(r.id))
})

function addCountry(regionId) {
  if (!regionId) return
  if (!prefs.value.display.addedRegions) prefs.value.display.addedRegions = []
  if (prefs.value.display.addedRegions.includes(regionId)) return
  prefs.value.display.addedRegions = [...prefs.value.display.addedRegions, regionId]
  savePrefs()
}

function removeCountry(regionId) {
  const added = prefs.value.display?.addedRegions || []
  if (added.length <= 1) return
  prefs.value.display.addedRegions = added.filter((id) => id !== regionId)
  savePrefs()
}

function onMultiChange(isMulti) {
  prefs.value.display.multiRegion = isMulti
  if (isMulti) {
    const added = prefs.value.display.addedRegions || []
    if (added.length === 0) prefs.value.display.addedRegions = [prefs.value.display.singleRegion]
  } else {
    const added = prefs.value.display.addedRegions || []
    if (added.length) prefs.value.display.singleRegion = added[0]
  }
  savePrefs()
}

function load() {
  try {
    const raw = localStorage.getItem(INTEGRATIONS_STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : { ...defaultIntegrations }
    integrations.value = {
      connections: data.connections || [],
      apiKeys: data.apiKeys || [],
    }
  } catch {
    integrations.value = { connections: [], apiKeys: [] }
  }
  try {
    const prefsRaw = localStorage.getItem(SETTINGS_PREFS_KEY)
    if (prefsRaw) {
      const saved = JSON.parse(prefsRaw)
      const display = { ...defaultPrefs.display, ...saved.display }
      display.regionSettings = ensureRegionSettings(display)
      display.addedRegions = ensureAddedRegions(display)
      prefs.value = {
        profile: { ...defaultPrefs.profile, ...saved.profile },
        notifications: { ...defaultPrefs.notifications, ...saved.notifications },
        display,
      }
    }
  } catch {
    prefs.value = JSON.parse(JSON.stringify(defaultPrefs))
  }
}

function savePrefs() {
  localStorage.setItem(SETTINGS_PREFS_KEY, JSON.stringify(prefs.value))
}

function save() {
  localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(integrations.value))
}

function addConnection() {
  const name = (connectionForm.value.name || '').trim()
  if (!name) return
  integrations.value.connections.push({
    id: 'c' + Date.now(),
    name,
    region: connectionForm.value.region,
    status: 'connected',
    connectedAt: new Date().toISOString().slice(0, 10),
  })
  save()
  connectionForm.value = { name: '', region: 'usa' }
  showAddConnection.value = false
}

function removeConnection(conn) {
  integrations.value.connections = integrations.value.connections.filter((c) => c.id !== conn.id)
  save()
}

function addApiKey() {
  const provider = (keyForm.value.provider || '').trim()
  const key = (keyForm.value.key || '').trim()
  if (!provider || !key) return
  integrations.value.apiKeys.push({
    id: 'k' + Date.now(),
    provider,
    region: keyForm.value.region,
    masked: key.slice(-4).padStart(key.length, '*'),
    createdAt: new Date().toISOString().slice(0, 10),
  })
  save()
  keyForm.value = { provider: '', key: '', region: 'usa' }
  showAddKey.value = false
}

function removeApiKey(k) {
  integrations.value.apiKeys = integrations.value.apiKeys.filter((x) => x.id !== k.id)
  save()
}

function providerLabel(value) {
  return providerOptions.find((p) => p.value === value)?.label || value
}

function exportData() {
  const data = {
    goals: JSON.parse(localStorage.getItem('financial-app-goals') || '[]'),
    integrations: JSON.parse(localStorage.getItem(INTEGRATIONS_STORAGE_KEY) || '{}'),
    prefs: prefs.value,
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'financial-app-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

function clearLocalData() {
  if (!confirm('Clear all locally stored data (goals, integrations, settings)? This cannot be undone.')) return
  localStorage.removeItem('financial-app-goals')
  localStorage.removeItem(INTEGRATIONS_STORAGE_KEY)
  localStorage.removeItem(SETTINGS_PREFS_KEY)
  prefs.value = JSON.parse(JSON.stringify(defaultPrefs))
  integrations.value = { connections: [], apiKeys: [] }
  load()
}

onMounted(load)
</script>

<template>
  <PageContainer title="Settings">
    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Profile</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-[var(--textMuted)] mb-1">Name</label>
          <input
            v-model="prefs.profile.name"
            type="text"
            placeholder="Your name"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            @blur="savePrefs"
          />
        </div>
        <div>
          <label class="block text-xs text-[var(--textMuted)] mb-1">Email</label>
          <input
            v-model="prefs.profile.email"
            type="email"
            placeholder="email@example.com"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            @blur="savePrefs"
          />
        </div>
      </div>
    </div>

    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Notifications</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-[var(--text)]">Transaction alerts</span>
          <button type="button" role="switch" :aria-checked="prefs.notifications.transactionAlerts" class="toggle-switch" :class="{ on: prefs.notifications.transactionAlerts }" @click="prefs.notifications.transactionAlerts = !prefs.notifications.transactionAlerts; savePrefs()">
            <span class="toggle-switch-thumb" />
          </button>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-[var(--text)]">Budget alerts</span>
          <button type="button" role="switch" :aria-checked="prefs.notifications.budgetAlerts" class="toggle-switch" :class="{ on: prefs.notifications.budgetAlerts }" @click="prefs.notifications.budgetAlerts = !prefs.notifications.budgetAlerts; savePrefs()">
            <span class="toggle-switch-thumb" />
          </button>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-[var(--text)]">Goal reminders</span>
          <button type="button" role="switch" :aria-checked="prefs.notifications.goalReminders" class="toggle-switch" :class="{ on: prefs.notifications.goalReminders }" @click="prefs.notifications.goalReminders = !prefs.notifications.goalReminders; savePrefs()">
            <span class="toggle-switch-thumb" />
          </button>
        </div>
      </div>
    </div>

    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Display</h3>
      <div class="space-y-4">
        <p class="text-sm text-[var(--text)]">Do you want to use multiple countries?</p>
        <div class="flex gap-3">
          <button
            type="button"
            :class="[prefs.display.multiRegion ? 'bg-accent text-white border-accent' : 'bg-[var(--card)] text-[var(--textMuted)] border-[var(--border)]', 'border px-4 py-2 rounded-lg text-sm font-medium']"
            @click="onMultiChange(true)"
          >
            Yes
          </button>
          <button
            type="button"
            :class="[!prefs.display.multiRegion ? 'bg-accent text-white border-accent' : 'bg-[var(--card)] text-[var(--textMuted)] border-[var(--border)]', 'border px-4 py-2 rounded-lg text-sm font-medium']"
            @click="onMultiChange(false)"
          >
            No
          </button>
        </div>

        <template v-if="!prefs.display.multiRegion">
          <p class="text-xs text-[var(--textMuted)] mt-3">Set country, currency and date format for the single country view.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label class="block text-xs text-[var(--textMuted)] mb-1">Country</label>
              <select
                v-model="prefs.display.singleRegion"
                class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
                @change="savePrefs"
              >
                <option v-for="r in allRegions" :key="r.id" :value="r.id">{{ r.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-[var(--textMuted)] mb-1">Currency</label>
              <select
                :value="(prefs.display.regionSettings[prefs.display.singleRegion] || {}).currency"
                class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
                @change="(e) => setRegionCurrency(prefs.display.singleRegion, e.target.value)"
              >
                <option v-for="c in currencyOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-[var(--textMuted)] mb-1">Date format</label>
              <select
                :value="(prefs.display.regionSettings[prefs.display.singleRegion] || {}).dateFormat"
                class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
                @change="(e) => setRegionDateFormat(prefs.display.singleRegion, e.target.value)"
              >
                <option v-for="d in dateFormatOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
            </div>
          </div>
        </template>

        <template v-else>
          <p class="text-xs text-[var(--textMuted)] mt-3">Add countries one by one. Set currency and date format per row. These appear as tabs in Accounts, Budgets and Investments.</p>
          <div class="overflow-x-auto mt-3 space-y-3">
            <table v-if="addedRegionRows.length" class="w-full text-sm">
              <thead>
                <tr class="border-b border-[var(--border)] text-left text-[var(--textMuted)]">
                  <th class="pb-2 pr-4">Country</th>
                  <th class="pb-2 pr-4">Currency</th>
                  <th class="pb-2 pr-4">Date format</th>
                  <th class="pb-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in addedRegionRows"
                  :key="r.id"
                  class="border-b border-[var(--border)] last:border-b-0"
                >
                  <td class="py-3 pr-4 font-medium text-[var(--text)]">{{ r.label }}</td>
                  <td class="py-3 pr-4">
                    <select
                      :value="(prefs.display.regionSettings[r.id] || {}).currency"
                      class="w-full max-w-[10rem] bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)]"
                      @change="(e) => setRegionCurrency(r.id, e.target.value)"
                    >
                      <option v-for="c in currencyOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                    </select>
                  </td>
                  <td class="py-3 pr-4">
                    <select
                      :value="(prefs.display.regionSettings[r.id] || {}).dateFormat"
                      class="w-full max-w-[10rem] bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)]"
                      @change="(e) => setRegionDateFormat(r.id, e.target.value)"
                    >
                      <option v-for="d in dateFormatOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
                    </select>
                  </td>
                  <td class="py-3">
                    <button
                      type="button"
                      :disabled="(prefs.display.addedRegions || []).length <= 1"
                      class="text-xs text-[var(--textMuted)] hover:text-[var(--negative)] disabled:opacity-40 disabled:cursor-not-allowed"
                      @click="removeCountry(r.id)"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="regionsAvailableToAdd.length" class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-[var(--textMuted)]">Add country:</span>
              <select
                :value="''"
                class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
                @change="(e) => { const v = e.target.value; if (v) { addCountry(v); e.target.value = '' } }"
              >
                <option value="">Choose...</option>
                <option v-for="r in regionsAvailableToAdd" :key="r.id" :value="r.id">{{ r.label }}</option>
              </select>
            </div>
            <p v-if="!addedRegionRows.length && !regionsAvailableToAdd.length" class="text-sm text-[var(--textMuted)]">Add a country using the dropdown above.</p>
          </div>
        </template>
      </div>
    </div>

    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Security</h3>
      <p class="text-sm text-[var(--textMuted)] mb-2">Change password and two-factor authentication will be available when you connect to a backend.</p>
      <p class="text-xs text-[var(--textMuted)]">Data is stored locally in this demo; no server account yet.</p>
    </div>

    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-4">Data & privacy</h3>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]" @click="exportData">
          Export my data
        </button>
        <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-[var(--negative)] border border-[var(--negative)]/50 hover:bg-[var(--negative)]/10" @click="clearLocalData">
          Clear local data
        </button>
      </div>
      <p class="text-xs text-[var(--textMuted)] mt-3">Export downloads goals, integrations, and preferences as JSON. Clear removes all locally stored data.</p>
    </div>

    <div class="card p-5 mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-2">About</h3>
      <p class="text-sm text-[var(--text)]">Financial App · Version 1.0.0</p>
      <p class="text-xs text-[var(--textMuted)] mt-1">Terms and privacy policy links can be added here.</p>
    </div>

    <div class="mb-5">
      <h3 class="text-xs md:text-sm font-medium text-[var(--textMuted)] uppercase tracking-wider mb-3">Integrations</h3>
      <p class="text-sm text-[var(--textMuted)] mb-4">Connect banks and add API keys by country. Data is stored locally.</p>
      <div class="flex gap-1 border-b border-[var(--border)]">
        <button
          v-for="r in integrationRegions"
          :key="r.id"
          @click="selectedRegion = r.id"
          :class="[
            'px-3 py-2 text-sm font-medium transition-colors -mb-px',
            selectedRegion === r.id
              ? 'text-accent border-b-2 border-accent'
              : 'text-[var(--textMuted)] hover:text-[var(--text)]'
          ]"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-semibold text-[var(--text)]">Bank connections</h4>
          <button
            type="button"
            class="text-sm font-medium text-accent hover:underline"
            @click="showAddConnection = !showAddConnection"
          >
            {{ showAddConnection ? 'Cancel' : 'Connect bank' }}
          </button>
        </div>
        <div v-if="showAddConnection" class="mb-4 p-4 rounded-lg border border-[var(--border)] space-y-3">
          <input
            v-model="connectionForm.name"
            type="text"
            placeholder="Bank or provider name"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          />
          <div class="flex gap-2">
            <select
              v-model="connectionForm.region"
              class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            >
              <option v-for="r in allRegions" :key="r.id" :value="r.id">{{ r.label }}</option>
            </select>
            <button type="button" class="btn-deposit px-3 py-2 rounded-lg text-sm" @click="addConnection">
              Add connection
            </button>
          </div>
        </div>
        <ul class="space-y-2">
          <li
            v-for="conn in filteredConnections"
            :key="conn.id"
            class="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
          >
            <div>
              <p class="text-sm font-medium text-[var(--text)]">{{ conn.name }}</p>
              <p class="text-xs text-[var(--textMuted)]">{{ conn.region.toUpperCase() }} · {{ conn.status }}</p>
            </div>
            <button
              type="button"
              class="text-xs text-[var(--textMuted)] hover:text-[var(--negative)]"
              @click="removeConnection(conn)"
            >
              Disconnect
            </button>
          </li>
        </ul>
        <p v-if="!filteredConnections.length && !showAddConnection" class="text-sm text-[var(--textMuted)] py-2">No connections in this region.</p>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-semibold text-[var(--text)]">API keys</h4>
          <button
            type="button"
            class="text-sm font-medium text-accent hover:underline"
            @click="showAddKey = !showAddKey"
          >
            {{ showAddKey ? 'Cancel' : 'Add API key' }}
          </button>
        </div>
        <div v-if="showAddKey" class="mb-4 p-4 rounded-lg border border-[var(--border)] space-y-3">
          <select
            v-model="keyForm.provider"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="">Select provider</option>
            <option v-for="opt in providerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input
            v-model="keyForm.key"
            type="password"
            placeholder="API key (stored locally)"
            class="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
          />
          <div class="flex gap-2">
            <select
              v-model="keyForm.region"
              class="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]"
            >
              <option v-for="r in allRegions" :key="r.id" :value="r.id">{{ r.label }}</option>
            </select>
            <button type="button" class="btn-deposit px-3 py-2 rounded-lg text-sm" @click="addApiKey">
              Save key
            </button>
          </div>
        </div>
        <ul class="space-y-2">
          <li
            v-for="k in filteredApiKeys"
            :key="k.id"
            class="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
          >
            <div>
              <p class="text-sm font-medium text-[var(--text)]">{{ providerLabel(k.provider) }}</p>
              <p class="text-xs text-[var(--textMuted)] font-mono">{{ k.masked }}</p>
            </div>
            <button
              type="button"
              class="text-xs text-[var(--textMuted)] hover:text-[var(--negative)]"
              @click="removeApiKey(k)"
            >
              Remove
            </button>
          </li>
        </ul>
        <p v-if="!filteredApiKeys.length && !showAddKey" class="text-sm text-[var(--textMuted)] py-2">No API keys in this region.</p>
      </div>
    </div>
  </PageContainer>
</template>

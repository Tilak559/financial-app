export const integrationRegions = [
  { id: 'all', label: 'All' },
  { id: 'usa', label: 'USA' },
  { id: 'india', label: 'India' },
  { id: 'uk', label: 'UK' },
  { id: 'germany', label: 'Germany' },
]

export const INTEGRATIONS_STORAGE_KEY = 'financial-app-integrations'
export const SETTINGS_PREFS_KEY = 'financial-app-settings-prefs'

export const defaultIntegrations = {
  connections: [],
  apiKeys: [],
}

const defaultRegionSettings = {
  usa: { currency: 'USD', dateFormat: 'MM/DD/YYYY' },
  india: { currency: 'INR', dateFormat: 'DD/MM/YYYY' },
  uk: { currency: 'GBP', dateFormat: 'DD/MM/YYYY' },
  germany: { currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
}

export const defaultPrefs = {
  profile: { name: '', email: '' },
  notifications: {
    transactionAlerts: true,
    budgetAlerts: true,
    goalReminders: true,
  },
  display: {
    multiRegion: true,
    singleRegion: 'usa',
    addedRegions: ['usa', 'india'],
    regionSettings: { ...defaultRegionSettings },
  },
}

export const allRegions = [
  { id: 'usa', label: 'USA' },
  { id: 'india', label: 'India' },
  { id: 'uk', label: 'UK' },
  { id: 'germany', label: 'Germany' },
]

export const regionOptions = allRegions

export const currencyOptions = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'INR', label: 'Indian Rupee' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
]

export const dateFormatOptions = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const VALID_REGION_IDS = ['usa', 'india', 'uk', 'germany']

export const regionDefaultCurrency = { usa: 'USD', india: 'INR', uk: 'GBP', germany: 'EUR' }

function mergeRegionSettings(saved) {
  const out = { ...defaultRegionSettings }
  if (saved && typeof saved === 'object') {
    VALID_REGION_IDS.forEach((id) => {
      if (saved[id] && typeof saved[id] === 'object') {
        out[id] = { ...out[id], ...saved[id] }
      }
    })
  }
  return out
}

export function getDisplayPrefs() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_PREFS_KEY) : null
    const saved = raw ? JSON.parse(raw) : null
    const display = saved?.display || {}
    const multiRegion = display.multiRegion !== false
    const singleRegion = VALID_REGION_IDS.includes(display.singleRegion) ? display.singleRegion : 'usa'
    let addedRegions = Array.isArray(display.addedRegions) ? display.addedRegions.filter((id) => VALID_REGION_IDS.includes(id)) : []
    if (multiRegion && addedRegions.length === 0) addedRegions = ['usa']
    const enabledRegions = multiRegion ? addedRegions : [singleRegion]
    const regionSettings = mergeRegionSettings(display.regionSettings)
    return {
      multiRegion,
      singleRegion,
      addedRegions,
      enabledRegions,
      regionSettings,
    }
  } catch {
    return {
      multiRegion: true,
      singleRegion: 'usa',
      addedRegions: ['usa', 'india'],
      enabledRegions: ['usa', 'india'],
      regionSettings: { ...defaultRegionSettings },
    }
  }
}

export function getDisplayRegionOptions(prefs) {
  const enabled = prefs?.enabledRegions || ['usa', 'india']
  const list = [{ id: 'all', label: 'All' }, ...allRegions.filter((r) => enabled.includes(r.id))]
  return list
}

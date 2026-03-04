import { ref, computed, onMounted } from 'vue'
import {
  getDisplayPrefs,
  getDisplayRegionOptions,
  regionDefaultCurrency,
  currencyOptions,
} from '../data/settings'

export function useRegionDisplay() {
  const displayPrefs = ref(getDisplayPrefs())
  const selectedRegion = ref(displayPrefs.value.multiRegion ? 'all' : displayPrefs.value.singleRegion)
  const currency = ref('USD')

  const displayRegionList = computed(() => getDisplayRegionOptions(displayPrefs.value))
  const regionOptions = computed(() =>
    displayPrefs.value.multiRegion ? displayRegionList.value : displayRegionList.value.filter((r) => r.id !== 'all')
  )

  const effectiveRegion = computed(() =>
    displayPrefs.value.multiRegion ? selectedRegion.value : displayPrefs.value.singleRegion
  )

  const singleCountryLabel = computed(() => {
    const r = regionOptions.value.find((x) => x.id === displayPrefs.value.singleRegion)
    return r ? r.label : 'USA'
  })

  const displayCurrency = computed(() => {
    if (displayPrefs.value.multiRegion && selectedRegion.value === 'all') return currency.value
    const rs = displayPrefs.value.regionSettings?.[effectiveRegion.value]
    return rs?.currency || regionDefaultCurrency[effectiveRegion.value] || 'USD'
  })

  const currencyDropdownOptions = computed(() => {
    const enabled = displayPrefs.value.enabledRegions || []
    const rs = displayPrefs.value.regionSettings || {}
    const codes = [...new Set(enabled.map((id) => rs[id]?.currency).filter(Boolean))]
    if (!codes.length) return currencyOptions
    return currencyOptions.filter((c) => codes.includes(c.value))
  })

  onMounted(() => {
    displayPrefs.value = getDisplayPrefs()
    if (!displayPrefs.value.multiRegion) selectedRegion.value = displayPrefs.value.singleRegion
    else if (selectedRegion.value === 'all') {
      const first = displayPrefs.value.enabledRegions?.[0]
      const firstCurrency = displayPrefs.value.regionSettings?.[first]?.currency
      if (firstCurrency) currency.value = firstCurrency
    }
  })

  return {
    displayPrefs,
    selectedRegion,
    currency,
    regionOptions,
    effectiveRegion,
    singleCountryLabel,
    displayCurrency,
    currencyDropdownOptions,
  }
}

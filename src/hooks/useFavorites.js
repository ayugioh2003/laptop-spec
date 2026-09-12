import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'laptop-spec:favorites'

/**
 * 收藏以「產品名稱」為 key，不用 index。
 * index 是爬蟲當下的陣列位置（dataFilter.js 的 addIndexToProducts），
 * 每天重爬就會位移，拿來存收藏會整批錯位。
 *
 * 存的是整筆產品快照而非只有名稱：資料每天重爬，收藏的筆電可能下架，
 * 沒有快照就沒東西可以顯示。快照裡的價格是「收藏當下」的價格，
 * 筆電還在清單上時會以最新資料覆蓋顯示。
 */
function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      // 舊格式只存字串名稱，轉成沒有規格的 stub（筆電還在清單上時仍可正常顯示）
      .map((item) => (typeof item === 'string' ? { name: item } : item))
      .filter((item) => item && typeof item.name === 'string')
  } catch {
    // 無痕模式、localStorage 被擋、或存進去的資料壞掉
    return []
  }
}

// ponytail: 模組層級單例，全站共用同一份狀態，不需要 pinia
const favorites = ref(load())
const favoriteSet = computed(() => new Set(favorites.value.map((f) => f.name)))

watch(favorites, (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 寫不進去就算了，不該讓畫面掛掉
  }
}, { deep: true })

export function useFavorites() {
  return {
    favorites,
    favoriteCount: computed(() => favorites.value.length),
    isFavorite: (name) => favoriteSet.value.has(name),
    toggleFavorite(product) {
      const i = favorites.value.findIndex((f) => f.name === product.name)
      if (i === -1) favorites.value.push({ ...product })
      else favorites.value.splice(i, 1)
    },
  }
}

/**
 * 把收藏清單對上目前的資料：
 * 還在清單上的用最新資料，已下架的用當初存的快照並標記
 */
export function resolveFavorites(favoriteList, laptops) {
  const live = new Map(laptops.map((lt) => [lt.name, lt]))

  return favoriteList
    .map((fav) => {
      const current = live.get(fav.name)
      return current ? { ...current, discontinued: false } : { ...fav, discontinued: true }
    })
    // 舊格式的 stub 又已下架，沒有規格可顯示
    .filter((item) => item.property)
}

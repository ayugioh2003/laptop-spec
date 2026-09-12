import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'laptop-spec:favorites'

/**
 * 收藏以「產品名稱」為 key，不用 index。
 * index 是爬蟲當下的陣列位置（dataFilter.js 的 addIndexToProducts），
 * 每天重爬就會位移，拿來存收藏會整批錯位。
 */
function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []
  } catch {
    // 無痕模式、localStorage 被擋、或存進去的資料壞掉
    return []
  }
}

// ponytail: 模組層級單例，全站共用同一份狀態，不需要 pinia
const favorites = ref(load())
const favoriteSet = computed(() => new Set(favorites.value))

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
    toggleFavorite(name) {
      const i = favorites.value.indexOf(name)
      if (i === -1) favorites.value.push(name)
      else favorites.value.splice(i, 1)
    },
  }
}

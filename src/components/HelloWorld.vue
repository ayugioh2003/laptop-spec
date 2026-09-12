<template>
  <div class="laptop-finder">
    <!-- 頁面標題 -->
    <header class="page-header">
      <h1>筆電規格價錢整理</h1>
      <div class="header-links">
        <div>
          資料來源：
          <a href="http://www.coolpc.com.tw/eachview.php?IGrp=2" target="_blank">原價屋</a>
        </div>
        <div>
          相關網頁：
          <a href="http://www.coolpc.com.tw/evaluate.php" target="_blank">原價屋估價</a>、
          <a href="https://www.ptt.cc/bbs/nb-shopping/index.html?q=選購" target="_blank">PTT筆電蝦</a>
        </div>
      </div>
    </header>

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <h3>載入失敗</h3>
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-btn">重試</button>
    </div>

    <!-- 正常內容 -->
    <div v-else>
      <!-- 統計面板 -->
      <StatsPanel 
        :totalProducts="state.laptopSpecs"
        :filteredProducts="getters.filterLaptopSpecs"
      />

      <!-- 篩選面板 -->
      <FilterPanel
        v-model="state.form"
        :brands="getters.laptopBrands"
        :cpus="getters.laptopCPUs"
        :vgas="getters.laptopVGAs"
      />

      <!-- 只看最愛 -->
      <div class="favorite-bar">
        <label>
          <input type="checkbox" v-model="onlyFavorites" />
          只看最愛（{{ favoriteCount }}）
        </label>
      </div>

      <!-- 產品列表 -->
      <ProductList :products="getters.filterLaptopSpecs" />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import FilterPanel from './FilterPanel.vue'
import ProductList from './ProductList.vue'
import StatsPanel from './StatsPanel.vue'
import { filterLaptops, uniqueValues } from '@utils/laptopFilter.js'
import { useFavorites } from '@hooks/useFavorites.js'

// 接收父層 props
defineProps({
  msg: String,
})

const loading = ref(true)
const error = ref(null)

const initForm = {
  sizeMin: 13,
  sizeMax: 15,
  ramMin: 16,
  weightMax: 1.5,
  priceMin: 25000,
  priceMax: 40000,
  brand: null,
  cpu: null,
  vga: null,
}

const state = reactive({
  laptopSpecs: [],
  form: {
    ...initForm,
  },
})

const onlyFavorites = ref(false)
const { favoriteCount, isFavorite } = useFavorites()

const getters = reactive({
  filterLaptopSpecs: computed(() => {
    const filtered = filterLaptops(state.laptopSpecs, state.form)
    return onlyFavorites.value ? filtered.filter((item) => isFavorite(item.name)) : filtered
  }),
  laptopBrands: computed(() => uniqueValues(state.laptopSpecs, 'brand')),
  laptopCPUs: computed(() => uniqueValues(state.laptopSpecs, 'cpu')),
  laptopVGAs: computed(() => uniqueValues(state.laptopSpecs, 'vga')),
})

async function loadData() {
  try {
    loading.value = true
    error.value = null
    
    // 動態載入資料
    const laptopSpecs = await import('@assets/result/latest_date.json')
    state.laptopSpecs = laptopSpecs.default || laptopSpecs
    
    // 驗證資料
    if (!Array.isArray(state.laptopSpecs) || state.laptopSpecs.length === 0) {
      throw new Error('資料格式錯誤或沒有資料')
    }
    
    loading.value = false
  } catch (err) {
    error.value = err.message || '載入資料失敗'
    loading.value = false
  }
}

function retryLoad() {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.favorite-bar {
  margin-bottom: 1rem;
}

.favorite-bar label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.laptop-finder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.page-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
}

.header-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1.1rem;
}

.header-links a {
  color: #fff;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.header-links a:hover {
  opacity: 1;
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  color: #e74c3c;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error h3 {
  margin: 0 0 0.5rem 0;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .laptop-finder {
    padding: 0.5rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .header-links {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

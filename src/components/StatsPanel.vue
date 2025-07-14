<template>
  <div class="stats-panel">
    <div class="stats-header">
      <h2>數據統計</h2>
      <div class="last-updated">
        最後更新: {{ lastUpdated }}
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">{{ totalCount }}</div>
        <div class="stat-label">總筆電數量</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-number">{{ filteredCount }}</div>
        <div class="stat-label">篩選結果</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-number">{{ avgPrice }}</div>
        <div class="stat-label">平均價格</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-number">{{ brandCount }}</div>
        <div class="stat-label">品牌數量</div>
      </div>
    </div>

    <div class="price-range" v-if="filteredProducts.length > 0">
      <div class="price-range-item">
        <span>價格範圍: </span>
        <span class="price-min">NT$ {{ formatPrice(minPrice) }}</span>
        <span> - </span>
        <span class="price-max">NT$ {{ formatPrice(maxPrice) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalProducts: {
    type: Array,
    default: () => []
  },
  filteredProducts: {
    type: Array,
    default: () => []
  }
})

const totalCount = computed(() => props.totalProducts.length)
const filteredCount = computed(() => props.filteredProducts.length)
const brandCount = computed(() => {
  const brands = new Set(props.totalProducts.map(p => p.property.brand))
  return brands.size
})

const avgPrice = computed(() => {
  if (props.filteredProducts.length === 0) return 'N/A'
  const sum = props.filteredProducts.reduce((acc, p) => acc + p.property.price, 0)
  const avg = sum / props.filteredProducts.length
  return `NT$ ${formatPrice(Math.round(avg))}`
})

const minPrice = computed(() => {
  if (props.filteredProducts.length === 0) return 0
  return Math.min(...props.filteredProducts.map(p => p.property.price))
})

const maxPrice = computed(() => {
  if (props.filteredProducts.length === 0) return 0
  return Math.max(...props.filteredProducts.map(p => p.property.price))
})

const lastUpdated = computed(() => {
  if (props.totalProducts.length === 0) return 'N/A'
  const date = new Date(props.totalProducts[0].property.time)
  return date.toLocaleString('zh-TW')
})

function formatPrice(price) {
  return new Intl.NumberFormat('zh-TW').format(price)
}
</script>

<style scoped>
.stats-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats-header h2 {
  margin: 0;
  color: white;
}

.last-updated {
  font-size: 0.9rem;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.price-range {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.price-range-item {
  font-size: 1.1rem;
}

.price-min {
  color: #4CAF50;
  font-weight: bold;
}

.price-max {
  color: #F44336;
  font-weight: bold;
}
</style>
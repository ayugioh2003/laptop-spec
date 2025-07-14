<template>
  <div class="virtualized-product-list">
    <div class="list-header">
      <h2>筆電列表 (虛擬滾動)</h2>
      <div class="sort-controls">
        <label>排序方式：</label>
        <select v-model="sortBy" @change="handleSort">
          <option value="default">預設</option>
          <option value="price-asc">價格：低到高</option>
          <option value="price-desc">價格：高到低</option>
          <option value="size-asc">尺寸：小到大</option>
          <option value="size-desc">尺寸：大到小</option>
          <option value="weight-asc">重量：輕到重</option>
          <option value="weight-desc">重量：重到輕</option>
        </select>
      </div>
    </div>

    <div class="view-toggle">
      <button 
        @click="viewMode = 'grid'" 
        :class="{ active: viewMode === 'grid' }"
        class="view-btn"
      >
        📱 卡片視圖
      </button>
      <button 
        @click="viewMode = 'list'" 
        :class="{ active: viewMode === 'list' }"
        class="view-btn"
      >
        📋 列表視圖
      </button>
    </div>

    <div v-if="sortedProducts.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>找不到符合條件的筆電</h3>
      <p>請調整篩選條件或重設篩選器</p>
    </div>

    <div v-else class="virtual-container">
      <!-- 虛擬滾動卡片視圖 -->
      <div v-if="viewMode === 'grid'" class="grid-virtualizer">
        <div 
          ref="gridContainer" 
          class="grid-container"
          :style="{ height: '600px', overflow: 'auto' }"
        >
          <div 
            :style="{ 
              height: `${getTotalHeight()}px`, 
              position: 'relative' 
            }"
          >
            <div
              v-for="item in visibleGridItems"
              :key="item.index"
              :style="{
                position: 'absolute',
                top: `${item.top}px`,
                left: `${item.left}px`,
                width: `${itemWidth}px`,
                height: `${itemHeight}px`
              }"
            >
              <ProductCard :product="item.product" />
            </div>
          </div>
        </div>
      </div>

      <!-- 虛擬滾動列表視圖 -->
      <div v-else class="list-virtualizer">
        <div 
          ref="listContainer"
          class="list-container"
          :style="{ height: '600px', overflow: 'auto' }"
        >
          <table class="virtual-table">
            <thead class="table-header">
              <tr>
                <th>產品名稱</th>
                <th>品牌</th>
                <th>尺寸</th>
                <th>CPU</th>
                <th>記憶體</th>
                <th>顯卡</th>
                <th>重量</th>
                <th>價格</th>
              </tr>
            </thead>
            <tbody>
              <tr style="height: 0; padding: 0; border: none;">
                <td 
                  colspan="8" 
                  :style="{ height: `${scrollOffset}px`, padding: 0, border: 'none' }"
                >
                </td>
              </tr>
              <tr v-for="product in visibleListItems" :key="product.index" class="table-row">
                <td>
                  <a :href="`https://www.google.com/search?q=${product.name}`" target="_blank">
                    {{ product.name }}
                  </a>
                </td>
                <td>{{ product.property.brand }}</td>
                <td>{{ product.property.size }}"</td>
                <td>{{ product.property.cpu }}</td>
                <td>{{ product.property.ramBasic }}GB</td>
                <td>{{ product.property.vga }}</td>
                <td>{{ product.property.weight }}kg</td>
                <td class="price">NT$ {{ formatPrice(product.property.price) }}</td>
              </tr>
              <tr style="height: 0; padding: 0; border: none;">
                <td 
                  colspan="8" 
                  :style="{ height: `${endOffset}px`, padding: 0, border: 'none' }"
                >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="performance-info">
      <small>
        🚀 使用虛擬滾動技術，顯示 {{ visibleCount }} / {{ sortedProducts.length }} 項目
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
// @ts-ignore
import ProductCard from './ProductCard.vue'
import type { LaptopSpec } from '@/types'

interface Props {
  products: LaptopSpec[]
}

const props = defineProps<Props>()

const sortBy = ref('default')
const viewMode = ref<'grid' | 'list'>('grid')
const gridContainer = ref<HTMLElement>()
const listContainer = ref<HTMLElement>()

// 虛擬滾動參數
const itemHeight = 280 // 卡片高度
const itemWidth = 350 // 卡片寬度
const rowHeight = 60 // 列表行高度
const buffer = 3 // 緩衝區項目數
const scrollTop = ref(0)
const containerHeight = ref(600)
const containerWidth = ref(1200)

const sortedProducts = computed(() => {
  let sorted = [...props.products]
  
  switch (sortBy.value) {
    case 'price-asc':
      sorted.sort((a, b) => a.property.price - b.property.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.property.price - a.property.price)
      break
    case 'size-asc':
      sorted.sort((a, b) => a.property.size - b.property.size)
      break
    case 'size-desc':
      sorted.sort((a, b) => b.property.size - a.property.size)
      break
    case 'weight-asc':
      sorted.sort((a, b) => a.property.weight - b.property.weight)
      break
    case 'weight-desc':
      sorted.sort((a, b) => b.property.weight - a.property.weight)
      break
    default:
      break
  }
  
  return sorted
})

// 網格布局計算
const itemsPerRow = computed(() => {
  return Math.floor(containerWidth.value / itemWidth)
})

const totalRows = computed(() => {
  return Math.ceil(sortedProducts.value.length / itemsPerRow.value)
})

const visibleRowStart = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
})

const visibleRowEnd = computed(() => {
  return Math.min(totalRows.value, Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + buffer)
})

const visibleGridItems = computed(() => {
  const items = []
  const startIndex = visibleRowStart.value * itemsPerRow.value
  const endIndex = Math.min(
    visibleRowEnd.value * itemsPerRow.value,
    sortedProducts.value.length
  )

  for (let i = startIndex; i < endIndex; i++) {
    const product = sortedProducts.value[i]
    if (product) {
      const row = Math.floor(i / itemsPerRow.value)
      const col = i % itemsPerRow.value
      items.push({
        index: i,
        product,
        top: row * itemHeight,
        left: col * itemWidth
      })
    }
  }

  return items
})

// 列表虛擬滾動
const visibleListStart = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / rowHeight) - buffer)
})

const visibleListEnd = computed(() => {
  return Math.min(
    sortedProducts.value.length,
    Math.ceil((scrollTop.value + containerHeight.value) / rowHeight) + buffer
  )
})

const visibleListItems = computed(() => {
  return sortedProducts.value.slice(visibleListStart.value, visibleListEnd.value)
})

const scrollOffset = computed(() => {
  return visibleListStart.value * rowHeight
})

const endOffset = computed(() => {
  return (sortedProducts.value.length - visibleListEnd.value) * rowHeight
})

const visibleCount = computed(() => {
  return viewMode.value === 'grid' ? visibleGridItems.value.length : visibleListItems.value.length
})

function getTotalHeight() {
  return viewMode.value === 'grid' 
    ? totalRows.value * itemHeight 
    : sortedProducts.value.length * rowHeight
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

function handleSort() {
  // 重置滾動位置
  scrollTop.value = 0
  if (gridContainer.value) {
    gridContainer.value.scrollTop = 0
  }
  if (listContainer.value) {
    listContainer.value.scrollTop = 0
  }
}

function updateContainerSize() {
  if (gridContainer.value) {
    containerWidth.value = gridContainer.value.clientWidth
    containerHeight.value = gridContainer.value.clientHeight
  } else if (listContainer.value) {
    containerWidth.value = listContainer.value.clientWidth
    containerHeight.value = listContainer.value.clientHeight
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('zh-TW').format(price)
}

onMounted(() => {
  nextTick(() => {
    updateContainerSize()
    
    // 添加滾動事件監聽
    if (gridContainer.value) {
      gridContainer.value.addEventListener('scroll', handleScroll)
    }
    if (listContainer.value) {
      listContainer.value.addEventListener('scroll', handleScroll)
    }
    
    // 添加視窗大小變化監聽
    window.addEventListener('resize', updateContainerSize)
  })
})

onUnmounted(() => {
  if (gridContainer.value) {
    gridContainer.value.removeEventListener('scroll', handleScroll)
  }
  if (listContainer.value) {
    listContainer.value.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('resize', updateContainerSize)
})
</script>

<style scoped>
.virtualized-product-list {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h2 {
  margin: 0;
  color: #333;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-controls label {
  font-weight: 500;
  color: #666;
}

.sort-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #f8f9fa;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
}

.virtual-container {
  margin-bottom: 1rem;
}

.grid-container {
  border: 1px solid #eee;
  border-radius: 4px;
}

.list-container {
  border: 1px solid #eee;
  border-radius: 4px;
}

.virtual-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table-header {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 10;
}

.table-header th {
  padding: 0.75rem;
  border-bottom: 2px solid #ddd;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.table-row td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.table-row td a {
  color: #007bff;
  text-decoration: none;
}

.table-row td a:hover {
  text-decoration: underline;
}

.price {
  font-weight: bold;
  color: #e74c3c;
}

.performance-info {
  text-align: center;
  color: #666;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
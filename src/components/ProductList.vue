<template>
  <div class="product-list">
    <div class="list-header">
      <h2>筆電列表</h2>
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
      <div class="empty-icon">{{ emptyHint.icon }}</div>
      <h3>{{ emptyHint.title }}</h3>
      <p>{{ emptyHint.hint }}</p>
    </div>

    <div v-else>
      <!-- 卡片視圖 -->
      <div v-if="viewMode === 'grid'" class="products-grid">
        <ProductCard
          v-for="product in sortedProducts"
          :key="product.index"
          :product="product"
        />
      </div>

      <!-- 列表視圖 -->
      <div v-else class="products-table">
        <table>
          <thead>
            <tr>
              <th class="favorite-col"></th>
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
            <tr v-for="product in sortedProducts" :key="product.index">
              <td class="favorite-col">
                <button
                  class="favorite-btn"
                  :class="{ active: isFavorite(product.name) }"
                  :aria-pressed="isFavorite(product.name)"
                  :title="isFavorite(product.name) ? '移除最愛' : '加入最愛'"
                  @click="toggleFavorite(product)"
                >
                  {{ isFavorite(product.name) ? '★' : '☆' }}
                </button>
              </td>
              <td>
                <a :href="`https://www.google.com/search?q=${product.name}`" target="_blank">
                  {{ product.name }}
                </a>
                <span v-if="product.discontinued" class="discontinued-tag">已下架</span>
              </td>
              <td>{{ product.property.brand }}</td>
              <td>{{ product.property.size }}"</td>
              <td>{{ product.property.cpu }}</td>
              <td>{{ product.property.ramBasic }}GB</td>
              <td>{{ product.property.vga }}</td>
              <td>{{ product.property.weight }}kg</td>
              <td class="price">NT$ {{ formatPrice(product.property.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { DisplayLaptop } from '@/types'

interface EmptyHint { icon: string; title: string; hint: string }
import { ref, computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { useFavorites } from '@hooks/useFavorites'

const { isFavorite, toggleFavorite } = useFavorites()

const props = withDefaults(defineProps<{
  products?: DisplayLaptop[]
  emptyHint?: EmptyHint
}>(), {
  products: () => [],
  emptyHint: () => ({ icon: '🔍', title: '找不到符合條件的筆電', hint: '請調整篩選條件或重設篩選器' }),
})

const sortBy = ref('default')
const viewMode = ref('grid')

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
      // 保持原順序
      break
  }
  
  return sorted
})

function handleSort() {
  // 排序後不需要特別處理
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('zh-TW').format(price)
}
</script>

<style scoped>
.discontinued-tag {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: #eee;
  color: #888;
  font-size: 0.75rem;
  white-space: nowrap;
}

.favorite-col {
  width: 1%;
  text-align: center;
  white-space: nowrap;
}

.favorite-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: #bbb;
  transition: color 0.2s, transform 0.1s;
}

.favorite-btn:hover {
  transform: scale(1.15);
}

.favorite-btn.active {
  color: #f5a623;
}

.product-list {
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.products-table {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.products-table th,
.products-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.products-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.products-table td a {
  color: #007bff;
  text-decoration: none;
}

.products-table td a:hover {
  text-decoration: underline;
}

.products-table .price {
  font-weight: bold;
  color: #e74c3c;
}

</style>
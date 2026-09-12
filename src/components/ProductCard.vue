<template>
  <div class="product-card" :class="{ discontinued: product.discontinued }">
    <div class="product-header">
      <div class="product-title">
        <h3>
          <a :href="`https://www.google.com/search?q=${product.name}`" target="_blank">
            {{ product.name }}
          </a>
        </h3>
        <div class="product-price">
          NT$ {{ formatPrice(product.property.price) }}
          <span v-if="product.discontinued" class="discontinued-tag">已下架</span>
        </div>
        <div v-if="product.discontinued" class="discontinued-note">
          已不在最新資料中，以下為收藏當下的規格與價格
        </div>
      </div>
      <button
        class="favorite-btn"
        :class="{ active: isFavorite(product.name) }"
        :aria-pressed="isFavorite(product.name)"
        :title="isFavorite(product.name) ? '移除最愛' : '加入最愛'"
        @click="toggleFavorite(product)"
      >
        {{ isFavorite(product.name) ? '★' : '☆' }}
      </button>
    </div>

    <div class="product-specs">
      <div class="spec-row">
        <span class="spec-label">尺寸</span>
        <span class="spec-value">{{ product.property.size }}"</span>
      </div>
      
      <div class="spec-row">
        <span class="spec-label">CPU</span>
        <span class="spec-value">{{ product.property.cpu }}</span>
      </div>
      
      <div class="spec-row">
        <span class="spec-label">記憶體</span>
        <span class="spec-value">{{ product.property.ramBasic }}GB (最大 {{ product.property.ramMax }}GB)</span>
      </div>
      
      <div class="spec-row">
        <span class="spec-label">儲存</span>
        <span class="spec-value">{{ product.property.ssd }}GB SSD</span>
      </div>
      
      <div class="spec-row">
        <span class="spec-label">顯卡</span>
        <span class="spec-value">{{ product.property.vga }}</span>
      </div>
      
      <div class="spec-row">
        <span class="spec-label">重量</span>
        <span class="spec-value">{{ product.property.weight }}kg</span>
      </div>
      
      <div class="spec-row" v-if="product.property.thunderbolt">
        <span class="spec-label">連接</span>
        <span class="spec-value">支援 Thunderbolt</span>
      </div>
    </div>

    <div class="product-footer">
      <div class="product-brand">{{ product.property.brand }}</div>
      <div class="product-date">{{ formatDate(product.property.date) }}</div>
    </div>
  </div>
</template>

<script setup>
import { useFavorites } from '@hooks/useFavorites.js'

const { isFavorite, toggleFavorite } = useFavorites()

defineProps({
  product: {
    type: Object,
    required: true
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('zh-TW').format(price)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('zh-TW')
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.product-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.product-card.discontinued {
  background: #fafafa;
  border: 1px dashed #ddd;
}

.discontinued-tag {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: #eee;
  color: #888;
  font-size: 0.75rem;
  vertical-align: middle;
}

.discontinued-note {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: #999;
}

.favorite-btn {
  flex: none;
  background: none;
  border: none;
  padding: 0;
  font-size: 1.5rem;
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

.product-title {
  width: 100%;
}

.product-title h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.4;
}

.product-title a {
  color: #333;
  text-decoration: none;
}

.product-title a:hover {
  color: #007bff;
  text-decoration: underline;
}

.product-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #e74c3c;
}

.product-specs {
  margin-bottom: 1rem;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  font-weight: 500;
  color: #666;
  min-width: 60px;
}

.spec-value {
  color: #333;
  text-align: right;
  flex: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
}

.product-brand {
  font-weight: 500;
  color: #007bff;
  background: #e7f3ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.product-date {
  color: #999;
  font-size: 0.85rem;
}
</style>
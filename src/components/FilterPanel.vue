<template>
  <div class="filter-panel">
    <div class="filter-header">
      <h2>篩選條件</h2>
      <div class="filter-actions">
        <button @click="resetToDefault" class="btn btn-secondary">預設</button>
        <button @click="resetToAll" class="btn btn-secondary">全部</button>
        <button @click="clearAll" class="btn btn-outline">清除</button>
      </div>
    </div>

    <div class="filter-grid">
      <!-- 價錢區間 -->
      <div class="filter-item">
        <label>價錢區間</label>
        <div class="range-input">
          <input
            type="number"
            step="1000"
            v-model.number="localForm.priceMin"
            placeholder="最低價"
          />
          <span>-</span>
          <input
            type="number"
            step="1000"
            v-model.number="localForm.priceMax"
            placeholder="最高價"
          />
          <span>元</span>
        </div>
      </div>

      <!-- 尺寸區間 -->
      <div class="filter-item">
        <label>尺寸區間</label>
        <div class="range-input">
          <input
            type="number"
            step="1"
            v-model.number="localForm.sizeMin"
            placeholder="最小尺寸"
          />
          <span>-</span>
          <input
            type="number"
            step="1"
            v-model.number="localForm.sizeMax"
            placeholder="最大尺寸"
          />
          <span>吋</span>
        </div>
      </div>

      <!-- 記憶體 -->
      <div class="filter-item">
        <label>記憶體至少</label>
        <div class="single-input">
          <input
            type="number"
            v-model.number="localForm.ramMin"
            placeholder="最小記憶體"
          />
          <span>GB</span>
        </div>
      </div>

      <!-- 重量 -->
      <div class="filter-item">
        <label>重量最多</label>
        <div class="single-input">
          <input
            type="number"
            step="0.1"
            v-model.number="localForm.weightMax"
            placeholder="最大重量"
          />
          <span>kg</span>
        </div>
      </div>

      <!-- 品牌 -->
      <div class="filter-item">
        <label>筆電品牌</label>
        <select v-model="localForm.brand">
          <option :value="null">請選擇</option>
          <option v-for="brand in brands" :key="brand" :value="brand">
            {{ brand }}
          </option>
        </select>
      </div>

      <!-- CPU -->
      <div class="filter-item">
        <label>CPU型號</label>
        <select v-model="localForm.cpu">
          <option :value="null">請選擇</option>
          <option v-for="cpu in cpus" :key="cpu" :value="cpu">
            {{ cpu }}
          </option>
        </select>
      </div>

      <!-- 顯卡 -->
      <div class="filter-item">
        <label>顯卡型號</label>
        <select v-model="localForm.vga">
          <option :value="null">請選擇</option>
          <option v-for="vga in vgas" :key="vga" :value="vga">
            {{ vga }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  brands: {
    type: Array,
    default: () => []
  },
  cpus: {
    type: Array,
    default: () => []
  },
  vgas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const localForm = reactive({ ...props.modelValue })

// 監聽本地表單變化並發送到父組件
watch(localForm, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// 監聽父組件的變化並更新本地表單
watch(() => props.modelValue, (newValue) => {
  Object.assign(localForm, newValue)
}, { deep: true })

const defaultForm = {
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

const allForm = {
  sizeMin: 0,
  sizeMax: 30,
  ramMin: 0,
  weightMax: 100,
  priceMin: 0,
  priceMax: 1000000,
  brand: null,
  cpu: null,
  vga: null,
}

function resetToDefault() {
  Object.assign(localForm, defaultForm)
}

function resetToAll() {
  Object.assign(localForm, allForm)
}

function clearAll() {
  Object.assign(localForm, {
    sizeMin: null,
    sizeMax: null,
    ramMin: null,
    weightMax: null,
    priceMin: null,
    priceMax: null,
    brand: null,
    cpu: null,
    vga: null,
  })
}
</script>

<style scoped>
.filter-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-header h2 {
  margin: 0;
  color: #333;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item label {
  font-weight: 500;
  color: #555;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.single-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-input input,
.single-input input,
select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.range-input input {
  flex: 1;
  width: 100%;
}

.single-input input {
  flex: 1;
}

select {
  width: 100%;
}

input:focus,
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
</style>
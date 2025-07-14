<template>
  <header>
    <h1>筆電規格價錢整理</h1>
    <div>
      資料來源：
      <a href="http://www.coolpc.com.tw/eachview.php?IGrp=2">原價屋</a>
    </div>
    <div>
      相關網頁：
      <a href="http://www.coolpc.com.tw/evaluate.php">原價屋估價</a>、
      <a href="https://www.ptt.cc/bbs/nb-shopping/index.html?q=選購"
        >PTT筆電蝦</a
      >
    </div>
    <div>筆電數量 {{ state.laptopSpecs.length }}</div>
    <div>篩選數量 {{ getters.filterLaptopSpecs.length }}</div>
    <div>資料時間 {{ state.laptopSpecs[0].property.time }}</div>
  </header>

  <!-- 篩選 -->
  <div style="margin-top: 1rem;">
    <!-- 條件批次設定按鈕 -->
    <div>
      <span style="margin-right: 1rem; font-size: 2rem;">篩選指標</span>
      <button @click="getDefaultFilterItems">預設</button>
      <button @click="getAllItems">全部</button>
    </div>

    <!-- price -->
    <div class="input-group">
      <label for="priceMin">價錢區間</label>
      <input
        id="priceMin"
        type="number"
        step="1000"
        v-model.number="state.form.priceMin"
      />
      <span>-</span>
      <input
        id="priceMax"
        type="number"
        step="1000"
        v-model.number="state.form.priceMax"
      />
      元
    </div>

    <!-- size -->
    <div class="input-group">
      <label for="priceMin">尺寸區間</label>
      <input
        type="number"
        step="1"
        v-model.number="state.form.sizeMin"
      />
      <span>-</span>
      <input
        type="number"
        step="1"
        v-model.number="state.form.sizeMax"
      />
      吋
    </div>

    <!-- ram -->
    <div class="input-group">
      <label for="ramMin">記憶體至少</label>
      <input id="ramMin" type="number" v-model.number="state.form.ramMin" />
      GB
    </div>

    <!-- weight -->
    <div class="input-group">
      <label for="weightMax">重量最多</label>
      <input
        id="weightMax"
        type="number"
        step="0.1"
        v-model.number="state.form.weightMax"
      />
      kg
    </div>

    <!-- brand -->
    <div class="input-group">
      <label for="brand">筆電品牌</label>
      <select v-model="state.form.brand">
        <option :value="null">請選擇</option>
        <option v-for="brand in getters.laptopBrands">{{ brand }}</option>
      </select>
    </div>

    <!-- cpu -->
    <div class="input-group">
      <label for="brand">CPU型號</label>
      <select v-model="state.form.cpu">
        <option :value="null">請選擇</option>
        <option v-for="cpu in getters.laptopCPUs">{{ cpu }}</option>
      </select>
    </div>

    <!-- vga -->
    <div class="input-group">
      <label for="brand">顯卡型號</label>
      <select v-model="state.form.vga">
        <option :value="null">請選擇</option>
        <option v-for="vga in getters.laptopVGAs">{{ vga }}</option>
      </select>
    </div>
  </div>

  <!-- 列表 -->
  <div v-for="(item, i) in getters.filterLaptopSpecs" :key="i" class="card">
    <a :href="`https://www.google.com/search?q=${item.name}`" target="_blank">{{
      item.name
    }}</a>
    <div v-for="(attr, name, index) in item" :key="attr.id">
      <span v-if="!['index', 'name', 'img', 'property'].includes(name)">{{
        attr
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import laptopSpecs from '@assets/result/latest_date.json'

// 接收父層 props
defineProps({
  msg: String,
})

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
  laptopSpecs: laptopSpecs,
  form: {
    ...initForm,
  },
})

const getters = reactive({
  filterLaptopSpecs: computed(() =>
    state.laptopSpecs
      .filter((item, index) => state.form.sizeMin <= item.property.size) // 尺寸
      .filter((item, index) => item.property.size <= state.form.sizeMax)
      .filter((item, index) => item.property.ramMax >= state.form.ramMin) // 記憶體
      .filter((item, index) => item.property.weight <= state.form.weightMax) // 重量
      .filter((item, index) => state.form.priceMin <= item.property.price) // 價錢
      .filter((item, index) => item.property.price <= state.form.priceMax)
      .filter((item, index) =>
        state.form.brand ? item.property.brand === state.form.brand : true
      )
      .filter((item, index) =>
        state.form.cpu ? item.property.cpu === state.form.cpu : true
      )
      .filter((item, index) =>
        state.form.vga ? item.property.vga === state.form.vga : true
      )
  ),
  laptopBrands: computed(() =>
    [...new Set(state.laptopSpecs.map((lt) => lt.property.brand))].sort()
  ),
  laptopCPUs: computed(() =>
    [...new Set(state.laptopSpecs.map((lt) => lt.property.cpu))].sort()
  ),
  laptopVGAs: computed(() =>
    [...new Set(state.laptopSpecs.map((lt) => lt.property.vga))].sort()
  ),
})

function getDefaultFilterItems() {
  state.form = { ...initForm }
}
function getAllItems() {
  state.form = {
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
}
</script>

<style scoped>
h1 {
  text-align: center;
}
a {
  color: #42b983;
}
.input-group,
.input-group input {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.input-group label {
  display: inline-block;
  width: 150px;
}
.input-group input {
  width: 120px;
}
.card {
  padding-top: 32px;
}
</style>

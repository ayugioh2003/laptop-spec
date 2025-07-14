<template>
  <div ref="container" class="lazy-image-container">
    <img
      v-if="loaded"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="onLoad"
      @error="onError"
    />
    <div v-else-if="error" class="error-placeholder">
      <div class="error-icon">❌</div>
      <span>圖片載入失敗</span>
    </div>
    <div v-else class="loading-placeholder">
      <div class="loading-spinner">⏳</div>
      <span>載入中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt?: string
  imageClass?: string
  placeholder?: string
  rootMargin?: string
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imageClass: '',
  placeholder: '',
  rootMargin: '50px',
  threshold: 0.1
})

const loaded = ref(false)
const error = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const container = ref<HTMLElement>()

function onLoad() {
  loaded.value = true
}

function onError() {
  error.value = true
}

function startObserver() {
  if ('IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage()
            observer.value?.disconnect()
          }
        })
      },
      {
        rootMargin: props.rootMargin,
        threshold: props.threshold
      }
    )
    
    if (container.value) {
      observer.value.observe(container.value)
    }
  } else {
    // Fallback for browsers without IntersectionObserver
    loadImage()
  }
}

function loadImage() {
  if (!loaded.value && !error.value) {
    const img = new Image()
    img.onload = onLoad
    img.onerror = onError
    img.src = props.src
  }
}

onMounted(() => {
  startObserver()
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.lazy-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #666;
  background: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
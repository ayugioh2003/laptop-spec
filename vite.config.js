import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'node:url'

const resolve = (dir) => path.resolve(path.dirname(fileURLToPath(import.meta.url)), dir);

// https://vitejs.dev/config/
// https://github.com/zhaojianzz/elementPlus-manage-system/blob/main/vite.config.ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve('src') },
      { find: '@assets', replacement: resolve('src/assets') },
      { find: '@components', replacement: resolve('src/components') },
      { find: '@hooks', replacement: resolve('src/hooks') },
      { find: '@utils', replacement: resolve('src/utils') },
    ],
  },
  // https://blog.csdn.net/qq_17497931/article/details/109510796
  base: './',
})

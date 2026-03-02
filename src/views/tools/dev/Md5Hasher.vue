<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileLock2, Copy, Check, RotateCcw } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import CryptoJS from 'crypto-js'

const inputText = ref('')
const isUpperCase = ref(false)
const { copy, copied } = useClipboard()

const md5Result = computed(() => {
  if (!inputText.value) return ''
  const hash = CryptoJS.MD5(inputText.value).toString()
  return isUpperCase.value ? hash.toUpperCase() : hash
})

const md5Result16 = computed(() => {
  if (!md5Result.value) return ''
  // 16位 MD5 是 32位 MD5 的中间部分 (8-24)
  return md5Result.value.substring(8, 24)
})

const copyResult = (text: string) => {
  copy(text)
}

const reset = () => {
  inputText.value = ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
        <FileLock2 class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">MD5 加密</h1>
        <p class="text-gray-500 dark:text-gray-400">计算文本的 MD5 哈希值 (32位/16位)</p>
      </div>
    </div>

    <!-- Input Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex justify-between items-center mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">输入文本</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            <input 
              type="checkbox" 
              v-model="isUpperCase"
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            >
            大写输出
          </label>
          <button 
            @click="reset"
            class="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>
      <textarea
        v-model="inputText"
        rows="5"
        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-600 dark:text-gray-300 font-mono text-sm resize-none"
        placeholder="在此输入要加密的内容..."
      ></textarea>
    </div>

    <!-- Results -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 32位 MD5 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-gray-900 dark:text-white">32位 MD5</h3>
          <button 
            v-if="md5Result"
            @click="copyResult(md5Result)"
            class="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="复制"
          >
            <component :is="copied && md5Result ? Check : Copy" class="w-4 h-4" />
          </button>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl break-all font-mono text-sm text-gray-600 dark:text-gray-300 min-h-[54px] flex items-center">
          {{ md5Result || '等待输入...' }}
        </div>
      </div>

      <!-- 16位 MD5 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-gray-900 dark:text-white">16位 MD5</h3>
          <button 
            v-if="md5Result16"
            @click="copyResult(md5Result16)"
            class="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="复制"
          >
            <component :is="copied && md5Result16 ? Check : Copy" class="w-4 h-4" />
          </button>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl break-all font-mono text-sm text-gray-600 dark:text-gray-300 min-h-[54px] flex items-center">
          {{ md5Result16 || '等待输入...' }}
        </div>
      </div>
    </div>
  </div>
</template>

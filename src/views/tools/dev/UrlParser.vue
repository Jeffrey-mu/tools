<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Link, Copy, Check, RotateCcw, Plus, Trash2 } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const inputUrl = ref('')
const { copy, copied } = useClipboard()

interface QueryParam {
  key: string
  value: string
  id: number
}

const params = ref<QueryParam[]>([])
const protocol = ref('')
const host = ref('')
const path = ref('')
const hash = ref('')
let nextId = 1

// Parse URL when input changes
const parseUrl = () => {
  try {
    if (!inputUrl.value) {
      clearAll()
      return
    }

    // Add protocol if missing for URL constructor
    let urlStr = inputUrl.value
    if (!urlStr.startsWith('http') && !urlStr.startsWith('//')) {
      // Don't modify inputUrl directly to avoid loop if we watch it, 
      // but here we just want to parse. 
      // Actually, if it's just a path or query, URL() might fail.
      // Let's try to handle partial URLs if needed, but for now assume full URL or valid partial.
      // If it fails, we might treat it as just query string if it starts with ?
    }

    const url = new URL(urlStr, 'http://placeholder.com') // Use placeholder base for relative URLs

    // If we used a placeholder, check if the original input had a protocol/host
    const hasProtocol = urlStr.match(/^[a-z]+:\/\//i)
    
    if (hasProtocol) {
      protocol.value = url.protocol
      host.value = url.host
    } else {
      protocol.value = ''
      host.value = ''
    }
    
    path.value = url.pathname
    hash.value = url.hash

    // Parse params
    const newParams: QueryParam[] = []
    url.searchParams.forEach((value, key) => {
      newParams.push({
        id: nextId++,
        key,
        value
      })
    })
    params.value = newParams

  } catch (e) {
    // If standard parsing fails, try to just extract query string manually
    // This is a simple fallback
    console.error('Invalid URL', e)
  }
}

// Reconstruct URL from components
const reconstructedUrl = computed(() => {
  try {
    const searchParams = new URLSearchParams()
    params.value.forEach(p => {
      if (p.key) searchParams.append(p.key, p.value)
    })
    
    const queryString = searchParams.toString()
    let fullUrl = ''
    
    if (protocol.value && host.value) {
      fullUrl += `${protocol.value}//${host.value}`
    }
    
    fullUrl += path.value
    
    if (queryString) {
      fullUrl += `?${queryString}`
    }
    
    if (hash.value) {
      fullUrl += hash.value
    }
    
    return fullUrl
  } catch (e) {
    return ''
  }
})

// Watch for input changes to parse
// We only parse if the input is different from the reconstructed one (to avoid loops if we sync back)
// But here we separate "Input URL" and "Reconstructed URL" to allow editing params.
// Let's make it so: Input -> Parse -> Edit Params -> Reconstructed URL
watch(inputUrl, () => {
  parseUrl()
})

const addParam = () => {
  params.value.push({
    id: nextId++,
    key: '',
    value: ''
  })
}

const removeParam = (index: number) => {
  params.value.splice(index, 1)
}

const clearAll = () => {
  protocol.value = ''
  host.value = ''
  path.value = ''
  hash.value = ''
  params.value = []
}

const copyResult = () => {
  copy(reconstructedUrl.value)
}

const reset = () => {
  inputUrl.value = ''
  clearAll()
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
        <Link class="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">URL 参数解析</h1>
        <p class="text-gray-500 dark:text-gray-400">解析 URL 参数，支持编辑和重组</p>
      </div>
    </div>

    <!-- Input Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex justify-between items-center mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">输入 URL</label>
        <button 
          @click="reset"
          class="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          重置
        </button>
      </div>
      <textarea
        v-model="inputUrl"
        rows="3"
        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-600 dark:text-gray-300 font-mono text-sm resize-none"
        placeholder="https://example.com/path?param=value&foo=bar#hash"
      ></textarea>
    </div>

    <!-- URL Components -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">基本信息</h3>
        
        <div class="space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 font-medium">Protocol</label>
          <input 
            v-model="protocol" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300"
            placeholder="https:"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 font-medium">Host</label>
          <input 
            v-model="host" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300"
            placeholder="example.com"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 font-medium">Path</label>
          <input 
            v-model="path" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300"
            placeholder="/path/to/resource"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 font-medium">Hash</label>
          <input 
            v-model="hash" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300"
            placeholder="#section"
          >
        </div>
      </div>

      <!-- Params Editor -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-gray-900 dark:text-white">URL 参数</h3>
          <button 
            @click="addParam"
            class="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="添加参数"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar">
          <div v-if="params.length === 0" class="text-center py-8 text-gray-400 text-sm">
            暂无参数
          </div>
          
          <div 
            v-for="(param, index) in params" 
            :key="param.id"
            class="flex items-center gap-2 group"
          >
            <input 
              v-model="param.key"
              type="text" 
              class="flex-1 min-w-0 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Key"
            >
            <span class="text-gray-400">=</span>
            <input 
              v-model="param.value"
              type="text" 
              class="flex-1 min-w-0 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Value"
            >
            <button 
              @click="removeParam(index)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-gray-900 dark:text-white">重组 URL</h3>
        <button 
          @click="copyResult"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          :class="copied ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
        >
          <component :is="copied ? Check : Copy" class="w-4 h-4" />
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      
      <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl break-all font-mono text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {{ reconstructedUrl || '等待输入...' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>

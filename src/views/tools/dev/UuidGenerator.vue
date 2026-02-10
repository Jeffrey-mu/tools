<script setup lang="ts">
import { ref } from 'vue'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'
import { Copy, RefreshCw, Fingerprint, Trash2 } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const count = ref(5)
const version = ref<'v1' | 'v4'>('v4')
const hyphens = ref(true)
const uppercase = ref(false)
const generatedUuids = ref<string[]>([])

const { copy, copied } = useClipboard()

const generate = () => {
  const newUuids: string[] = []
  for (let i = 0; i < count.value; i++) {
    let uuid = version.value === 'v1' ? uuidv1() : uuidv4()
    
    if (!hyphens.value) {
      uuid = uuid.replace(/-/g, '')
    }
    
    if (uppercase.value) {
      uuid = uuid.toUpperCase()
    }
    
    newUuids.push(uuid)
  }
  generatedUuids.value = newUuids
}

const clear = () => {
  generatedUuids.value = []
}

const copyAll = () => {
  if (generatedUuids.value.length === 0) return
  copy(generatedUuids.value.join('\n'))
}

// Initial generation
generate()
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-gray-700 font-medium">
            <Fingerprint class="w-5 h-5 text-blue-500" />
            UUID 生成器
          </div>
          <div class="h-6 w-px bg-gray-200 hidden sm:block"></div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- Count -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">数量:</label>
            <select 
              v-model="count"
              class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option :value="1">1</option>
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <!-- Version -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">版本:</label>
            <select 
              v-model="version"
              class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="v4">Version 4 (随机)</option>
              <option value="v1">Version 1 (时间戳)</option>
            </select>
          </div>

          <!-- Options -->
          <div class="flex items-center gap-4 border-l border-gray-200 pl-4">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" v-model="hyphens" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              连字符
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" v-model="uppercase" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              大写
            </label>
          </div>
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <button 
            @click="generate"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
          >
            <RefreshCw class="w-4 h-4" />
            生成
          </button>
          <button 
            @click="clear"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="清空"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="generatedUuids.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider ml-2">
          生成的 UUID ({{ generatedUuids.length }})
        </span>
        <button 
          @click="copyAll"
          class="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
          :class="copied ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200'"
        >
          <Copy class="w-3.5 h-3.5" />
          {{ copied ? '已复制全部' : '复制全部' }}
        </button>
      </div>
      
      <div class="max-h-[600px] overflow-y-auto divide-y divide-gray-50">
        <div 
          v-for="(uuid, index) in generatedUuids" 
          :key="index"
          class="group flex items-center justify-between p-3 hover:bg-blue-50/50 transition-colors"
        >
          <code class="font-mono text-gray-700 text-sm sm:text-base select-all">{{ uuid }}</code>
          <button 
            @click="copy(uuid)"
            class="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            title="复制"
          >
            <Copy class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
      <Fingerprint class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">点击生成按钮开始生成 UUID</p>
    </div>
  </div>
</template>

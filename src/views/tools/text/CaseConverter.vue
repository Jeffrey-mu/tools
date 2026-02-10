<script setup lang="ts">
import { ref, computed } from 'vue'
import { CaseUpper, Copy, Trash2 } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const input = ref('')
const { copy, copied } = useClipboard()

const toCamelCase = (str: string) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '').replace(/[-_]+/g, '')
}

const toSnakeCase = (str: string) => {
  return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .map(x => x.toLowerCase())
    .join('_')
}

const toKebabCase = (str: string) => {
  return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .map(x => x.toLowerCase())
    .join('-')
}

const toPascalCase = (str: string) => {
  return str.replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), s => s.toUpperCase())
}

// Simple conversions
const conversions = computed(() => {
  if (!input.value) return []
  
  const text = input.value
  
  // Basic cleaning for standard converters
  // For better results, we might want to use a library like `lodash` or `change-case`
  // But here's a simple implementation for now
  
  return [
    { name: 'Upper Case', value: text.toUpperCase(), desc: 'EXAMPLE TEXT' },
    { name: 'Lower Case', value: text.toLowerCase(), desc: 'example text' },
    { name: 'Camel Case', value: toCamelCase(text), desc: 'exampleText' },
    { name: 'Snake Case', value: toSnakeCase(text), desc: 'example_text' },
    { name: 'Kebab Case', value: toKebabCase(text), desc: 'example-text' },
    { name: 'Pascal Case', value: toPascalCase(text), desc: 'ExampleText' },
  ]
})

const copyResult = (text: string) => {
  copy(text)
}

const clear = () => {
  input.value = ''
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <CaseUpper class="w-5 h-5 text-emerald-500" />
        命名风格转换
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="clear"
          class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 class="w-4 h-4" />
          清空
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <!-- Input Area -->
      <div class="w-full lg:w-1/3 min-h-[200px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div class="p-3 border-b border-gray-100 text-sm font-medium text-gray-500">
          输入文本
        </div>
        <textarea
          v-model="input"
          class="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-gray-800 placeholder-gray-400 font-mono"
          placeholder="Type something..."
        ></textarea>
      </div>

      <!-- Results Panel -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-y-auto">
        <div v-if="!input" class="h-full flex flex-col items-center justify-center text-gray-400">
          <CaseUpper class="w-12 h-12 mb-3 opacity-20" />
          <p>输入文本以查看转换结果</p>
        </div>
        
        <div v-else class="grid grid-cols-1 gap-4">
          <div 
            v-for="item in conversions" 
            :key="item.name"
            class="group relative bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 rounded-lg p-4 transition-all hover:shadow-sm"
          >
            <div class="flex justify-between items-start mb-1">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ item.name }}</span>
              <button 
                @click="copyResult(item.value)"
                class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="复制"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
            <div class="font-mono text-gray-800 break-all">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

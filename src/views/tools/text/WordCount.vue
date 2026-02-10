<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlignLeft, Copy, Trash2 } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const text = ref('')
const { copy, copied } = useClipboard()

const stats = computed(() => {
  const t = text.value
  if (!t) return {
    zh: 0,
    en: 0,
    total: 0,
    noSpace: 0,
    lines: 0,
    paragraphs: 0
  }

  // Chinese characters (including punctuation)
  const zh = (t.match(/[\u4e00-\u9fa5]|[\u3000-\u303f\uff00-\uffef]/g) || []).length
  
  // English words (splitting by non-word characters)
  const en = (t.match(/[a-zA-Z0-9]+/g) || []).length
  
  // Total characters
  const total = t.length
  
  // Characters without whitespace
  const noSpace = t.replace(/\s/g, '').length
  
  // Lines
  const lines = t.split(/\r\n|\r|\n/).length
  
  // Paragraphs (non-empty lines)
  const paragraphs = t.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0).length

  return { zh, en, total, noSpace, lines, paragraphs }
})

const clear = () => {
  text.value = ''
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <AlignLeft class="w-5 h-5 text-emerald-500" />
        字数统计
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          v-if="text"
          @click="copy(text)"
          class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <Copy class="w-4 h-4" />
          {{ copied ? '已复制' : '复制文本' }}
        </button>
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
      <div class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <textarea
          v-model="text"
          class="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-gray-800 placeholder-gray-400 font-mono"
          placeholder="在此输入或粘贴文本..."
        ></textarea>
      </div>

      <!-- Stats Panel -->
      <div class="w-full lg:w-72 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit space-y-4">
        <h3 class="font-bold text-gray-800">统计结果</h3>
        
        <div class="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">总字符数</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">中文字符</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.zh }}</div>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">英文单词</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.en }}</div>
          </div>

          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">不含空格</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.noSpace }}</div>
          </div>
          
          <div class="flex gap-3 col-span-2 lg:col-span-1">
            <div class="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">行数</div>
              <div class="text-xl font-bold text-gray-900">{{ stats.lines }}</div>
            </div>
            <div class="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">段落</div>
              <div class="text-xl font-bold text-gray-900">{{ stats.paragraphs }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

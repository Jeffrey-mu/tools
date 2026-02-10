<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeftRight, Trash2, Split, Merge } from 'lucide-vue-next'
import * as Diff from 'diff'

const oldText = ref('')
const newText = ref('')
const mode = ref<'lines' | 'chars'>('lines')
const viewType = ref<'unified' | 'split'>('unified')

const diffResult = computed(() => {
  if (!oldText.value && !newText.value) return []
  
  if (mode.value === 'lines') {
    return Diff.diffLines(oldText.value, newText.value)
  } else {
    return Diff.diffChars(oldText.value, newText.value)
  }
})

// For split view, we need to process the diff result to align lines
// This is a simplified implementation for split view
const splitDiff = computed(() => {
  if (viewType.value !== 'split' || mode.value !== 'lines') return null
  
  const changes = Diff.diffLines(oldText.value, newText.value)
  const leftRows: any[] = []
  const rightRows: any[] = []
  
  let leftLineNum = 1
  let rightLineNum = 1
  
  changes.forEach(part => {
    if (part.added) {
      // Added lines appear on the right, empty on the left
      const lines = part.value.split(/\r\n|\r|\n/)
      if (lines[lines.length - 1] === '') lines.pop() // Remove trailing empty string from split
      
      lines.forEach(line => {
        leftRows.push({ type: 'empty', lineNum: null, value: '' })
        rightRows.push({ type: 'added', lineNum: rightLineNum++, value: line })
      })
    } else if (part.removed) {
      // Removed lines appear on the left, empty on the right
      const lines = part.value.split(/\r\n|\r|\n/)
      if (lines[lines.length - 1] === '') lines.pop()
      
      lines.forEach(line => {
        leftRows.push({ type: 'removed', lineNum: leftLineNum++, value: line })
        rightRows.push({ type: 'empty', lineNum: null, value: '' })
      })
    } else {
      // Unchanged lines appear on both sides
      const lines = part.value.split(/\r\n|\r|\n/)
      if (lines[lines.length - 1] === '') lines.pop()
      
      lines.forEach(line => {
        leftRows.push({ type: 'normal', lineNum: leftLineNum++, value: line })
        rightRows.push({ type: 'normal', lineNum: rightLineNum++, value: line })
      })
    }
  })
  
  return { left: leftRows, right: rightRows }
})

const clear = () => {
  oldText.value = ''
  newText.value = ''
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <ArrowLeftRight class="w-5 h-5 text-emerald-500" />
        文本 Diff 对比
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Mode Toggle -->
        <div class="flex bg-gray-100 p-1 rounded-lg">
          <button 
            @click="mode = 'lines'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-all"
            :class="mode === 'lines' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            按行
          </button>
          <button 
            @click="mode = 'chars'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-all"
            :class="mode === 'chars' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            按字符
          </button>
        </div>

        <!-- View Toggle (Only for Lines mode) -->
        <div v-if="mode === 'lines'" class="flex bg-gray-100 p-1 rounded-lg">
          <button 
            @click="viewType = 'unified'"
            class="p-1.5 rounded-md transition-all"
            :class="viewType === 'unified' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            title="合并视图"
          >
            <Merge class="w-4 h-4" />
          </button>
          <button 
            @click="viewType = 'split'"
            class="p-1.5 rounded-md transition-all"
            :class="viewType === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            title="左右分栏"
          >
            <Split class="w-4 h-4" />
          </button>
        </div>

        <button 
          @click="clear"
          class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 class="w-4 h-4" />
          清空
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 h-1/3">
      <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-2 border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50 rounded-t-xl px-4">
          原始内容 (Old)
        </div>
        <textarea
          v-model="oldText"
          class="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-gray-800 font-mono text-sm leading-6"
          placeholder="Paste original text here..."
        ></textarea>
      </div>
      <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-2 border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50 rounded-t-xl px-4">
          新内容 (New)
        </div>
        <textarea
          v-model="newText"
          class="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-gray-800 font-mono text-sm leading-6"
          placeholder="Paste new text here..."
        ></textarea>
      </div>
    </div>

    <!-- Result -->
    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-0 overflow-hidden">
      <div class="p-2 border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50 px-4">
        对比结果
      </div>
      
      <div class="flex-1 overflow-auto p-4 font-mono text-sm">
        <!-- Unified View -->
        <pre v-if="viewType === 'unified' || mode === 'chars'" class="whitespace-pre-wrap break-all"><span 
            v-for="(part, index) in diffResult" 
            :key="index"
            :class="{
              'bg-green-100 text-green-800': part.added,
              'bg-red-100 text-red-800 decoration-red-500': part.removed,
              'line-through opacity-70': part.removed && mode === 'chars'
            }"
          >{{ part.value }}</span></pre>

        <!-- Split View (Only for Lines) -->
        <div v-else-if="viewType === 'split' && splitDiff" class="flex min-w-full">
          <!-- Left (Old) -->
          <div class="w-1/2 border-r border-gray-200 select-text">
            <div 
              v-for="(row, idx) in splitDiff.left" 
              :key="'l-'+idx"
              class="flex"
              :class="{
                'bg-red-50': row.type === 'removed',
                'bg-gray-50/50': row.type === 'empty'
              }"
            >
              <div class="w-10 text-right pr-2 text-gray-400 select-none bg-gray-50 border-r border-gray-100 text-xs py-0.5">
                {{ row.lineNum }}
              </div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all py-0.5">
                <span :class="{'text-red-700': row.type === 'removed'}">{{ row.value }}</span>
              </div>
            </div>
          </div>
          
          <!-- Right (New) -->
          <div class="w-1/2 select-text">
            <div 
              v-for="(row, idx) in splitDiff.right" 
              :key="'r-'+idx"
              class="flex"
              :class="{
                'bg-green-50': row.type === 'added',
                'bg-gray-50/50': row.type === 'empty'
              }"
            >
              <div class="w-10 text-right pr-2 text-gray-400 select-none bg-gray-50 border-r border-gray-100 text-xs py-0.5">
                {{ row.lineNum }}
              </div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all py-0.5">
                <span :class="{'text-green-700': row.type === 'added'}">{{ row.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better look */
textarea::-webkit-scrollbar,
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
textarea::-webkit-scrollbar-track,
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb,
.overflow-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 4px;
}
textarea::-webkit-scrollbar-thumb:hover,
.overflow-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>

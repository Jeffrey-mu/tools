<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeftRight, Trash2, Split, Merge } from 'lucide-vue-next'
import * as Diff from 'diff'

const oldText = ref('')
const newText = ref('')
const mode = ref<'lines' | 'words' | 'chars'>('lines')
const viewType = ref<'unified' | 'split'>('unified')
const inlineHighlight = ref(true)
const inlineGranularity = ref<'chars' | 'words'>('chars')
const maxInlineTotalLength = 50000

type InlinePart = { value: string; type: 'normal' | 'added' | 'removed' }
type UnifiedRow = {
  kind: 'normal' | 'added' | 'removed'
  oldLine: number | null
  newLine: number | null
  parts: InlinePart[]
}

type SplitRow = {
  type: 'normal' | 'added' | 'removed' | 'modified' | 'empty'
  lineNum: number | null
  value: string
  parts?: InlinePart[]
}

const canInline = computed(() => {
  if (mode.value !== 'lines') return false
  if (!inlineHighlight.value) return false
  return oldText.value.length + newText.value.length <= maxInlineTotalLength
})

const splitPartLines = (value: string) => {
  const lines = value.split(/\r\n|\r|\n/)
  if (lines.length && lines[lines.length - 1] === '') lines.pop()
  return lines
}

const computeInlineParts = (leftText: string, rightText: string) => {
  const base = inlineGranularity.value === 'words'
    ? Diff.diffWordsWithSpace(leftText, rightText)
    : Diff.diffChars(leftText, rightText)

  const left: InlinePart[] = []
  const right: InlinePart[] = []

  base.forEach((p) => {
    if (p.added) {
      right.push({ value: p.value, type: 'added' })
      return
    }

    if (p.removed) {
      left.push({ value: p.value, type: 'removed' })
      return
    }

    left.push({ value: p.value, type: 'normal' })
    right.push({ value: p.value, type: 'normal' })
  })

  return { left, right }
}

const unifiedRows = computed<UnifiedRow[]>(() => {
  if (mode.value !== 'lines') return []
  if (!oldText.value && !newText.value) return []

  const changes = Diff.diffLines(oldText.value, newText.value)
  const rows: UnifiedRow[] = []

  let oldLine = 1
  let newLine = 1

  for (let i = 0; i < changes.length; i += 1) {
    const part = changes[i]
    const next = changes[i + 1]

    if (part.removed && next?.added) {
      const leftLines = splitPartLines(part.value)
      const rightLines = splitPartLines(next.value)
      const max = Math.max(leftLines.length, rightLines.length)

      for (let j = 0; j < max; j += 1) {
        const l = leftLines[j]
        const r = rightLines[j]

        if (l !== undefined && r !== undefined) {
          const inline = canInline.value ? computeInlineParts(l, r) : null
          rows.push({
            kind: 'removed',
            oldLine,
            newLine: null,
            parts: inline ? inline.left : [{ value: l, type: 'removed' }]
          })
          rows.push({
            kind: 'added',
            oldLine: null,
            newLine,
            parts: inline ? inline.right : [{ value: r, type: 'added' }]
          })
          oldLine += 1
          newLine += 1
          continue
        }

        if (l !== undefined) {
          rows.push({
            kind: 'removed',
            oldLine,
            newLine: null,
            parts: [{ value: l, type: 'removed' }]
          })
          oldLine += 1
          continue
        }

        if (r !== undefined) {
          rows.push({
            kind: 'added',
            oldLine: null,
            newLine,
            parts: [{ value: r, type: 'added' }]
          })
          newLine += 1
        }
      }

      i += 1
      continue
    }

    if (part.added) {
      splitPartLines(part.value).forEach((line) => {
        rows.push({
          kind: 'added',
          oldLine: null,
          newLine,
          parts: [{ value: line, type: 'added' }]
        })
        newLine += 1
      })
      continue
    }

    if (part.removed) {
      splitPartLines(part.value).forEach((line) => {
        rows.push({
          kind: 'removed',
          oldLine,
          newLine: null,
          parts: [{ value: line, type: 'removed' }]
        })
        oldLine += 1
      })
      continue
    }

    splitPartLines(part.value).forEach((line) => {
      rows.push({
        kind: 'normal',
        oldLine,
        newLine,
        parts: [{ value: line, type: 'normal' }]
      })
      oldLine += 1
      newLine += 1
    })
  }

  return rows
})

const diffResult = computed(() => {
  if (!oldText.value && !newText.value) return []

  if (mode.value === 'words') {
    return Diff.diffWordsWithSpace(oldText.value, newText.value)
  }

  if (mode.value === 'chars') {
    return Diff.diffChars(oldText.value, newText.value)
  }

  return Diff.diffLines(oldText.value, newText.value)
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
  
  for (let i = 0; i < changes.length; i += 1) {
    const part = changes[i]
    const next = changes[i + 1]

    if (part.removed && next?.added) {
      const leftLines = splitPartLines(part.value)
      const rightLines = splitPartLines(next.value)
      const max = Math.max(leftLines.length, rightLines.length)

      for (let j = 0; j < max; j += 1) {
        const l = leftLines[j]
        const r = rightLines[j]

        if (l !== undefined && r !== undefined) {
          const inline = canInline.value ? computeInlineParts(l, r) : null
          const leftRow: SplitRow = {
            type: 'modified',
            lineNum: leftLineNum++,
            value: l,
            parts: inline ? inline.left : undefined
          }
          const rightRow: SplitRow = {
            type: 'modified',
            lineNum: rightLineNum++,
            value: r,
            parts: inline ? inline.right : undefined
          }
          leftRows.push(leftRow)
          rightRows.push(rightRow)
          continue
        }

        if (l !== undefined) {
          leftRows.push({ type: 'removed', lineNum: leftLineNum++, value: l } satisfies SplitRow)
          rightRows.push({ type: 'empty', lineNum: null, value: '' } satisfies SplitRow)
          continue
        }

        if (r !== undefined) {
          leftRows.push({ type: 'empty', lineNum: null, value: '' } satisfies SplitRow)
          rightRows.push({ type: 'added', lineNum: rightLineNum++, value: r } satisfies SplitRow)
        }
      }

      i += 1
      continue
    }

    if (part.added) {
      splitPartLines(part.value).forEach((line) => {
        leftRows.push({ type: 'empty', lineNum: null, value: '' } satisfies SplitRow)
        rightRows.push({ type: 'added', lineNum: rightLineNum++, value: line } satisfies SplitRow)
      })
      continue
    }

    if (part.removed) {
      splitPartLines(part.value).forEach((line) => {
        leftRows.push({ type: 'removed', lineNum: leftLineNum++, value: line } satisfies SplitRow)
        rightRows.push({ type: 'empty', lineNum: null, value: '' } satisfies SplitRow)
      })
      continue
    }

    splitPartLines(part.value).forEach((line) => {
      leftRows.push({ type: 'normal', lineNum: leftLineNum++, value: line } satisfies SplitRow)
      rightRows.push({ type: 'normal', lineNum: rightLineNum++, value: line } satisfies SplitRow)
    })
  }
  
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
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
        <ArrowLeftRight class="w-5 h-5 text-emerald-500" />
        文本 Diff 对比
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Mode Toggle -->
        <div class="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button 
            @click="mode = 'lines'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-all"
            :class="mode === 'lines' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            按行
          </button>
          <button 
            @click="mode = 'words'; viewType = 'unified'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-all"
            :class="mode === 'words' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            按词
          </button>
          <button 
            @click="mode = 'chars'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-all"
            :class="mode === 'chars' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            按字符
          </button>
        </div>

        <!-- View Toggle (Only for Lines mode) -->
        <div v-if="mode === 'lines'" class="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button 
            @click="viewType = 'unified'"
            class="p-1.5 rounded-md transition-all"
            :class="viewType === 'unified' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
            title="合并视图"
          >
            <Merge class="w-4 h-4" />
          </button>
          <button 
            @click="viewType = 'split'"
            class="p-1.5 rounded-md transition-all"
            :class="viewType === 'split' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
            title="左右分栏"
          >
            <Split class="w-4 h-4" />
          </button>
        </div>

        <div v-if="mode === 'lines'" class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 select-none">
            <input v-model="inlineHighlight" type="checkbox" class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500">
            行内高亮
          </label>
          <select
            v-model="inlineGranularity"
            :disabled="!inlineHighlight"
            class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1 disabled:opacity-60"
          >
            <option value="chars">行内：字符</option>
            <option value="words">行内：按词</option>
          </select>
          <span v-if="inlineHighlight && !canInline" class="text-xs text-gray-400 dark:text-gray-500">
            文本较大，已自动关闭行内高亮
          </span>
        </div>

        <button 
          @click="clear"
          class="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 class="w-4 h-4" />
          清空
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 h-1/3">
      <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="p-2 border-b border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-t-xl px-4">
          原始内容 (Old)
        </div>
        <textarea
          v-model="oldText"
          class="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-gray-800 dark:text-gray-100 font-mono text-sm leading-6 bg-transparent"
          placeholder="Paste original text here..."
        ></textarea>
      </div>
      <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="p-2 border-b border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-t-xl px-4">
          新内容 (New)
        </div>
        <textarea
          v-model="newText"
          class="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-gray-800 dark:text-gray-100 font-mono text-sm leading-6 bg-transparent"
          placeholder="Paste new text here..."
        ></textarea>
      </div>
    </div>

    <!-- Result -->
    <div class="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-0 overflow-hidden">
      <div class="p-2 border-b border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-4">
        对比结果
      </div>
      
      <div class="flex-1 overflow-auto p-4 font-mono text-sm text-gray-800 dark:text-gray-100">
        <div v-if="mode === 'lines'">
          <!-- Unified View -->
          <div v-if="viewType === 'unified'" class="min-w-full">
            <div
              v-for="(row, index) in unifiedRows"
              :key="index"
              class="flex"
              :class="{
                'bg-green-50 dark:bg-green-900/20': row.kind === 'added',
                'bg-red-50 dark:bg-red-900/20': row.kind === 'removed'
              }"
            >
              <div class="w-16 shrink-0 flex items-center justify-end gap-1 pr-2 text-xs text-gray-400 dark:text-gray-500 select-none bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 py-0.5">
                <span class="w-4 text-center">{{ row.kind === 'added' ? '+' : row.kind === 'removed' ? '-' : '' }}</span>
                <span class="w-5 text-right">{{ row.oldLine ?? '' }}</span>
                <span class="w-1 text-center">·</span>
                <span class="w-5 text-left">{{ row.newLine ?? '' }}</span>
              </div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all py-0.5">
                <span
                  v-for="(p, pIdx) in row.parts"
                  :key="pIdx"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200': p.type === 'added',
                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200': p.type === 'removed'
                  }"
                >{{ p.value }}</span>
              </div>
            </div>
          </div>

          <!-- Split View -->
          <div v-else-if="viewType === 'split' && splitDiff" class="flex min-w-full">
          <!-- Left (Old) -->
          <div class="w-1/2 border-r border-gray-200 dark:border-gray-700 select-text">
            <div 
              v-for="(row, idx) in splitDiff.left" 
              :key="'l-'+idx"
              class="flex"
              :class="{
                'bg-red-50 dark:bg-red-900/20': row.type === 'removed',
                'bg-yellow-50 dark:bg-yellow-900/20': row.type === 'modified',
                'bg-gray-50/50 dark:bg-gray-900/30': row.type === 'empty'
              }"
            >
              <div class="w-10 text-right pr-2 text-gray-400 dark:text-gray-500 select-none bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 text-xs py-0.5">
                {{ row.lineNum }}
              </div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all py-0.5">
                <template v-if="row.parts">
                  <span
                    v-for="(p, pIdx) in row.parts"
                    :key="pIdx"
                    :class="{
                      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200': p.type === 'removed'
                    }"
                  >{{ p.value }}</span>
                </template>
                <span v-else :class="{'text-red-700 dark:text-red-300': row.type === 'removed'}">{{ row.value }}</span>
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
                'bg-green-50 dark:bg-green-900/20': row.type === 'added',
                'bg-yellow-50 dark:bg-yellow-900/20': row.type === 'modified',
                'bg-gray-50/50 dark:bg-gray-900/30': row.type === 'empty'
              }"
            >
              <div class="w-10 text-right pr-2 text-gray-400 dark:text-gray-500 select-none bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 text-xs py-0.5">
                {{ row.lineNum }}
              </div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all py-0.5">
                <template v-if="row.parts">
                  <span
                    v-for="(p, pIdx) in row.parts"
                    :key="pIdx"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200': p.type === 'added'
                    }"
                  >{{ p.value }}</span>
                </template>
                <span v-else :class="{'text-green-700 dark:text-green-300': row.type === 'added'}">{{ row.value }}</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- Words / Chars -->
        <pre v-else class="whitespace-pre-wrap break-all"><span 
            v-for="(part, index) in diffResult" 
            :key="index"
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200': part.added,
              'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 decoration-red-500': part.removed,
              'line-through opacity-70': part.removed
            }"
          >{{ part.value }}</span></pre>
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
.dark textarea::-webkit-scrollbar-thumb,
.dark .overflow-auto::-webkit-scrollbar-thumb {
  background-color: #374151;
}
.dark textarea::-webkit-scrollbar-thumb:hover,
.dark .overflow-auto::-webkit-scrollbar-thumb:hover {
  background-color: #4b5563;
}
</style>

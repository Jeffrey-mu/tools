<script setup lang="ts">
import { ref, watch } from 'vue'
import { Copy, FileJson, Trash2, ArrowRightLeft } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import CodeEditor from '@/components/common/CodeEditor.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref(2)
const { copy, copied } = useClipboard()

const format = () => {
  if (!input.value) {
    output.value = ''
    error.value = ''
    return
  }

  try {
    // Try to be lenient with input (e.g. handle single quotes or trailing commas if possible in future)
    // For now standard JSON.parse
    const obj = JSON.parse(input.value)
    output.value = JSON.stringify(obj, null, indent.value)
    error.value = ''
  } catch (e: any) {
    error.value = e.message
    // Keep the previous output or empty? Let's empty it to indicate failure
    // Or maybe just show error and keep stale output? 
    // Current logic: clear output on error
    output.value = ''
  }
}

const compress = () => {
  if (!input.value) return
  try {
    const obj = JSON.parse(input.value)
    output.value = JSON.stringify(obj)
    error.value = ''
  } catch (e: any) {
    error.value = e.message
    output.value = ''
  }
}

const clear = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

watch([input, indent], () => {
  format()
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-gray-700 font-medium">
          <FileJson class="w-5 h-5 text-blue-500" />
          JSON 格式化
        </div>
        <div class="h-6 w-px bg-gray-200"></div>
        <select 
          v-model="indent"
          class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option :value="2">2 空格缩进</option>
          <option :value="4">4 空格缩进</option>
          <option :value="8">8 空格缩进</option>
        </select>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="compress"
          class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowRightLeft class="w-4 h-4" />
          压缩
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

    <!-- Editors -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      <!-- Input -->
      <div class="flex flex-col gap-2 h-full min-h-0">
        <label class="text-sm font-medium text-gray-500 px-1">输入 JSON</label>
        <div class="flex-1 min-h-0 relative">
          <CodeEditor
            v-model="input"
            placeholder="在此粘贴 JSON 字符串..."
            class="h-full"
          />
        </div>
      </div>

      <!-- Output -->
      <div class="flex flex-col gap-2 h-full min-h-0">
        <div class="flex items-center justify-between px-1">
          <label class="text-sm font-medium text-gray-500">格式化结果</label>
          <button 
            v-if="output"
            @click="copy(output)"
            class="text-xs flex items-center gap-1 transition-colors"
            :class="copied ? 'text-green-600' : 'text-blue-600 hover:text-blue-700'"
          >
            <Copy class="w-3 h-3" />
            {{ copied ? '已复制' : '复制结果' }}
          </button>
        </div>
        <div class="relative flex-1 min-h-0">
          <CodeEditor
            v-model="output"
            readonly
            placeholder="结果将显示在这里..."
            class="h-full"
            :class="{ '!border-red-300 !bg-red-50': error }"
          />
          <div 
            v-if="error"
            class="absolute bottom-4 left-4 right-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 shadow-sm z-10"
          >
            <span class="font-bold">错误:</span> {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

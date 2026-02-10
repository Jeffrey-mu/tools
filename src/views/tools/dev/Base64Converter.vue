<script setup lang="ts">
import { ref, watch } from 'vue'
import { Copy, ArrowRightLeft, Trash2, Binary } from 'lucide-vue-next'
import { useClipboard, useBase64 } from '@vueuse/core'

const input = ref('')
const output = ref('')
const mode = ref<'encode' | 'decode'>('encode')
const { copy, copied } = useClipboard()

const process = () => {
  if (!input.value) {
    output.value = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      output.value = btoa(unescape(encodeURIComponent(input.value)))
    } else {
      output.value = decodeURIComponent(escape(atob(input.value)))
    }
  } catch (e) {
    output.value = '无效的输入'
  }
}

const toggleMode = () => {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  // Swap input/output if valid
  if (output.value && output.value !== '无效的输入') {
    input.value = output.value
  }
}

const clear = () => {
  input.value = ''
  output.value = ''
}

watch([input, mode], () => {
  process()
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-gray-700 font-medium">
          <Binary class="w-5 h-5 text-blue-500" />
          Base64 编解码
        </div>
        <div class="h-6 w-px bg-gray-200"></div>
        <div class="flex bg-gray-100 p-1 rounded-lg">
          <button 
            @click="mode = 'encode'"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
            :class="mode === 'encode' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            编码 (Encode)
          </button>
          <button 
            @click="mode = 'decode'"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
            :class="mode === 'decode' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            解码 (Decode)
          </button>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="toggleMode"
          class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowRightLeft class="w-4 h-4" />
          交换
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
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-500 px-1">
          {{ mode === 'encode' ? '明文输入' : 'Base64 输入' }}
        </label>
        <textarea
          v-model="input"
          class="flex-1 w-full p-4 font-mono text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none"
          :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64 字符串...'"
        ></textarea>
      </div>

      <!-- Output -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between px-1">
          <label class="text-sm font-medium text-gray-500">
            {{ mode === 'encode' ? 'Base64 结果' : '明文结果' }}
          </label>
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
        <div class="relative flex-1">
          <textarea
            readonly
            :value="output"
            class="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none outline-none text-gray-800"
            placeholder="结果将显示在这里..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

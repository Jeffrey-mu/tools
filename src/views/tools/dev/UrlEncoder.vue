<script setup lang="ts">
import { ref } from 'vue'
import { Link, ArrowRightLeft, Copy, Trash2 } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import CodeEditor from '@/components/common/CodeEditor.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const mode = ref<'component' | 'uri'>('component')

const { copy, copied } = useClipboard()

const encode = () => {
  if (!input.value) return
  try {
    if (mode.value === 'component') {
      output.value = encodeURIComponent(input.value)
    } else {
      output.value = encodeURI(input.value)
    }
    error.value = ''
  } catch (e: any) {
    error.value = e.message
  }
}

const decode = () => {
  if (!input.value) return
  try {
    output.value = decodeURIComponent(input.value)
    error.value = ''
  } catch (e: any) {
    error.value = 'Invalid URL encoding'
  }
}

const swap = () => {
  const temp = input.value
  input.value = output.value
  output.value = temp
  error.value = ''
}

const clear = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-gray-700 font-medium">
            <Link class="w-5 h-5 text-blue-500" />
            URL 编解码
          </div>
          
          <div class="h-6 w-px bg-gray-200 hidden sm:block"></div>
          
          <div class="flex bg-gray-100 p-1 rounded-lg">
            <button
              @click="mode = 'component'"
              class="px-3 py-1 text-xs font-medium rounded-md transition-all"
              :class="mode === 'component' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              Component
            </button>
            <button
              @click="mode = 'uri'"
              class="px-3 py-1 text-xs font-medium rounded-md transition-all"
              :class="mode === 'uri' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              title="encodeURI (不转义 :/?#& 等)"
            >
              Whole URI
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="encode"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200"
          >
            编码 (Encode)
          </button>
          <button 
            @click="decode"
            class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            解码 (Decode)
          </button>
          <button 
            @click="swap"
            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="交换输入输出"
          >
            <ArrowRightLeft class="w-4 h-4" />
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

    <!-- Editors -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      <!-- Input -->
      <div class="flex flex-col gap-2 h-full min-h-0">
        <label class="text-sm font-medium text-gray-500 px-1">输入</label>
        <div class="flex-1 min-h-0 relative">
          <CodeEditor
            v-model="input"
            placeholder="在此输入文本..."
            class="h-full"
          />
        </div>
      </div>

      <!-- Output -->
      <div class="flex flex-col gap-2 h-full min-h-0">
        <div class="flex items-center justify-between px-1">
          <label class="text-sm font-medium text-gray-500">结果</label>
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

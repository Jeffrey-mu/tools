<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { KeyRound, RefreshCw, Copy } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const length = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const password = ref('')

const { copy, copied } = useClipboard()

const generate = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-='
  
  let chars = ''
  if (includeUppercase.value) chars += upper
  if (includeLowercase.value) chars += lower
  if (includeNumbers.value) chars += numbers
  if (includeSymbols.value) chars += symbols
  
  if (!chars) {
    password.value = ''
    return
  }
  
  let result = ''
  for (let i = 0; i < length.value; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  password.value = result
}

// Initial generate
watch([length, includeUppercase, includeLowercase, includeNumbers, includeSymbols], () => {
  generate()
}, { immediate: true })

const strength = computed(() => {
  if (!password.value) return 0
  let score = 0
  if (password.value.length > 8) score += 1
  if (password.value.length > 12) score += 1
  if (/[A-Z]/.test(password.value)) score += 1
  if (/[a-z]/.test(password.value)) score += 1
  if (/[0-9]/.test(password.value)) score += 1
  if (/[^A-Za-z0-9]/.test(password.value)) score += 1
  return Math.min(score, 5)
})

const strengthColor = computed(() => {
  if (strength.value <= 2) return 'bg-red-500'
  if (strength.value <= 3) return 'bg-yellow-500'
  return 'bg-green-500'
})

const strengthText = computed(() => {
  if (strength.value <= 2) return '弱'
  if (strength.value <= 3) return '中'
  return '强'
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <KeyRound class="w-5 h-5 text-emerald-500" />
        密码生成器
      </div>
    </div>

    <div class="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
      <!-- Config Panel -->
      <div class="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        <!-- Length -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium text-gray-700">密码长度</label>
            <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ length }}</span>
          </div>
          <input 
            v-model.number="length" 
            type="range" 
            min="4" 
            max="64" 
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          >
        </div>
        
        <!-- Options -->
        <div class="space-y-4">
          <label class="text-sm font-medium text-gray-700 block">字符选项</label>
          
          <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input v-model="includeUppercase" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-700">大写字母 (A-Z)</span>
          </label>
          
          <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input v-model="includeLowercase" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-700">小写字母 (a-z)</span>
          </label>
          
          <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input v-model="includeNumbers" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-700">数字 (0-9)</span>
          </label>
          
          <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input v-model="includeSymbols" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-700">特殊符号 (!@#$)</span>
          </label>
        </div>

        <button 
          @click="generate"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw class="w-5 h-5" />
          重新生成
        </button>
      </div>

      <!-- Result Panel -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gray-50/50 pattern-grid-lg opacity-20"></div>
        
        <div class="relative z-10 w-full max-w-2xl space-y-8 text-center">
          <div class="space-y-2">
            <div class="text-sm text-gray-500 font-medium uppercase tracking-wider">Generated Password</div>
            <div 
              class="relative group bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl p-6 shadow-sm transition-all duration-300"
              :class="{ 'ring-4 ring-blue-50 border-blue-300': copied }"
            >
              <div class="font-mono text-3xl md:text-4xl text-gray-800 break-all leading-tight">
                {{ password || '...' }}
              </div>
              
              <button 
                @click="copy(password)"
                class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 bg-white rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                title="复制密码"
              >
                <Copy class="w-5 h-5" />
              </button>
            </div>
            
            <div class="flex items-center justify-center gap-2 text-sm">
              <span class="text-gray-400">强度:</span>
              <div class="flex gap-1">
                <div v-for="i in 5" :key="i" class="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    class="h-full transition-all duration-500" 
                    :class="i <= strength ? strengthColor : 'bg-transparent'"
                  ></div>
                </div>
              </div>
              <span class="font-medium" :class="strengthColor.replace('bg-', 'text-')">{{ strengthText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

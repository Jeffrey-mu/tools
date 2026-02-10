<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Clock, Copy, Play, Pause, RefreshCw } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'

const { copy, copied } = useClipboard()

// Current Time
const now = ref(dayjs())
const isPaused = ref(false)
const timer = setInterval(() => {
  if (!isPaused.value) {
    now.value = dayjs()
  }
}, 1000)

onUnmounted(() => {
  clearInterval(timer)
})

const togglePause = () => {
  isPaused.value = !isPaused.value
}

// Converter
const inputTimestamp = ref(now.value.unix())
const inputDate = ref(now.value.format('YYYY-MM-DD HH:mm:ss'))
const unit = ref<'s' | 'ms'>('s')

const convertToDate = () => {
  if (!inputTimestamp.value) return
  const timestamp = unit.value === 's' ? inputTimestamp.value * 1000 : inputTimestamp.value
  inputDate.value = dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const convertToTimestamp = () => {
  if (!inputDate.value) return
  const d = dayjs(inputDate.value)
  if (d.isValid()) {
    inputTimestamp.value = unit.value === 's' ? d.unix() : d.valueOf()
  }
}

const setNow = () => {
  const current = dayjs()
  inputDate.value = current.format('YYYY-MM-DD HH:mm:ss')
  inputTimestamp.value = unit.value === 's' ? current.unix() : current.valueOf()
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Current Time Card -->
    <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
      <div class="relative z-10">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">当前时间</h2>
        <div class="text-4xl sm:text-6xl font-mono font-bold text-gray-900 mb-4 tracking-tight">
          {{ now.format('HH:mm:ss') }}
        </div>
        <div class="text-lg text-gray-600 font-medium mb-6">
          {{ now.format('YYYY年MM月DD日 dddd') }}
        </div>
        
        <div class="flex justify-center gap-4 text-sm font-mono text-gray-500 bg-white/50 inline-block px-6 py-3 rounded-xl backdrop-blur-sm border border-gray-100">
          <div class="flex items-center gap-2">
            <span>Unix:</span>
            <span class="text-blue-600 font-bold">{{ now.unix() }}</span>
            <button @click="copy(String(now.unix()))" class="hover:text-blue-600">
              <Copy class="w-4 h-4" />
            </button>
          </div>
        </div>

        <button 
          @click="togglePause"
          class="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/80 transition-colors text-gray-400 hover:text-blue-600"
        >
          <component :is="isPaused ? Play : Pause" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Converter -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Timestamp to Date -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 mb-6">
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Clock class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-gray-900">时间戳转换</h3>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-500">时间戳</label>
            <div class="flex gap-2">
              <input 
                v-model="inputTimestamp"
                type="number" 
                class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              >
              <select 
                v-model="unit"
                class="px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="s">秒 (s)</option>
                <option value="ms">毫秒 (ms)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-center">
            <button 
              @click="convertToDate"
              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            >
              <ArrowRightLeft class="w-5 h-5 rotate-90" />
            </button>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-500">北京时间</label>
            <div class="relative">
              <input 
                v-model="inputDate"
                type="text" 
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              >
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button 
                  @click="setNow"
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="使用当前时间"
                >
                  <RefreshCw class="w-4 h-4" />
                </button>
                <button 
                  @click="copy(inputDate)"
                  class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="复制"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions (Placeholder for more features) -->
      <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h3 class="font-bold text-lg mb-4">常用格式</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
            <span class="text-sm text-blue-100">YYYY-MM-DD</span>
            <span class="font-mono text-sm font-medium">{{ now.format('YYYY-MM-DD') }}</span>
          </div>
          <div class="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
            <span class="text-sm text-blue-100">HH:mm:ss</span>
            <span class="font-mono text-sm font-medium">{{ now.format('HH:mm:ss') }}</span>
          </div>
          <div class="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
            <span class="text-sm text-blue-100">ISO 8601</span>
            <span class="font-mono text-xs font-medium truncate ml-4">{{ now.toISOString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import convert from 'convert-units'
import { ArrowRightLeft, Copy, Check } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

// Measures to support
const SUPPORTED_MEASURES = [
  'length',
  'area',
  'mass',
  'volume',
  'temperature',
  'time',
  'digital',
  'speed',
  'pressure',
  'power',
  'energy',
  'angle'
]

const measureMap: Record<string, string> = {
  length: '长度',
  area: '面积',
  mass: '重量',
  volume: '体积',
  temperature: '温度',
  time: '时间',
  digital: '数据存储',
  speed: '速度',
  pressure: '压力',
  power: '功率',
  energy: '能量',
  angle: '角度'
}

const activeMeasure = ref('length')
const fromUnit = ref('m')
const toUnit = ref('km')
const fromValue = ref<number | string>(1)
const toValue = ref<number | string>('')

// Unit descriptions mapping (optional, for better UI)
// convert-units provides .describe(), we can use that.

const measures = computed(() => {
  return SUPPORTED_MEASURES.map(m => ({
    id: m,
    name: measureMap[m] || m
  }))
})

const availableUnits = computed(() => {
  return convert().possibilities(activeMeasure.value as any)
})

const unitOptions = computed(() => {
  return availableUnits.value.map(u => {
    const desc = convert().describe(u)
    return {
      value: u,
      label: `${desc.singular} (${u})`
    }
  })
})

// Initialize units when measure changes
watch(activeMeasure, (newMeasure) => {
  const units = convert().possibilities(newMeasure as any)
  if (units.length >= 2) {
    fromUnit.value = units[0]
    toUnit.value = units[1]
  } else if (units.length === 1) {
    fromUnit.value = units[0]
    toUnit.value = units[0]
  }
  calculate()
})

const calculate = (source: 'from' | 'to' = 'from') => {
  if (source === 'from') {
    if (fromValue.value === '' || isNaN(Number(fromValue.value))) {
      toValue.value = ''
      return
    }
    try {
      const result = convert(Number(fromValue.value)).from(fromUnit.value as any).to(toUnit.value as any)
      // Format result: if integer, keep as is. If float, max 6 decimal places but remove trailing zeros
      toValue.value = Number(result.toFixed(6)).toString()
    } catch (e) {
      console.error(e)
      toValue.value = 'Error'
    }
  } else {
    if (toValue.value === '' || isNaN(Number(toValue.value))) {
      fromValue.value = ''
      return
    }
    try {
      const result = convert(Number(toValue.value)).from(toUnit.value as any).to(fromUnit.value as any)
      fromValue.value = Number(result.toFixed(6)).toString()
    } catch (e) {
      console.error(e)
      fromValue.value = 'Error'
    }
  }
}

const swapUnits = () => {
  const tempU = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = tempU
  
  const tempV = fromValue.value
  fromValue.value = toValue.value
  toValue.value = tempV
  
  // No need to recalculate if we swapped both values and units, theoretically it's consistent.
  // But let's recalculate based on 'from' to be sure
  // calculate('from')
}

// Watchers for immediate updates
watch([fromUnit, toUnit], () => calculate('from'))

const { copy, copied } = useClipboard()

const copyResult = () => {
  if (toValue.value) {
    copy(toValue.value.toString())
  }
}
</script>

<template>
  <div class="h-full flex flex-col gap-6 max-w-6xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row h-[600px]">
      
      <!-- Categories Sidebar -->
      <div class="w-full md:w-64 bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-700 p-4 overflow-y-auto">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">度量类型</h2>
        <div class="space-y-1">
          <button
            v-for="m in measures"
            :key="m.id"
            @click="activeMeasure = m.id"
            class="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 font-medium flex items-center justify-between group"
            :class="activeMeasure === m.id 
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' 
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'"
          >
            {{ m.name }}
            <span v-if="activeMeasure === m.id" class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </button>
        </div>
      </div>

      <!-- Conversion Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <span class="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
              <ArrowRightLeft class="w-6 h-6" />
            </span>
            {{ measureMap[activeMeasure] || '单位换算' }}
          </h2>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div class="flex flex-col gap-8 relative">
            
            <!-- From Input Group -->
            <div class="group">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">从 (From)</label>
              <div class="flex gap-4 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
                <input
                  v-model="fromValue"
                  type="number"
                  @input="calculate('from')"
                  class="flex-1 bg-transparent border-none text-3xl font-light text-gray-900 dark:text-white p-2 focus:ring-0 placeholder-gray-300 tabular-nums"
                  placeholder="0"
                />
                <div class="relative min-w-[140px]">
                  <select 
                    v-model="fromUnit"
                    class="w-full h-full appearance-none bg-white dark:bg-gray-800 border-none rounded-xl py-2 pl-4 pr-10 text-right font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Swap Action -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button 
                @click="swapUnits"
                class="p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg border border-gray-100 dark:border-gray-600 text-gray-400 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300"
                title="交换"
              >
                <ArrowRightLeft class="w-5 h-5 rotate-90" />
              </button>
            </div>

            <!-- To Input Group -->
            <div class="group">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">到 (To)</label>
              <div class="flex gap-4 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
                <input
                  v-model="toValue"
                  type="number"
                  @input="calculate('to')"
                  class="flex-1 bg-transparent border-none text-3xl font-light text-indigo-900 dark:text-indigo-100 p-2 focus:ring-0 placeholder-indigo-200 tabular-nums"
                  placeholder="0"
                />
                <div class="relative min-w-[140px]">
                  <select 
                    v-model="toUnit"
                    class="w-full h-full appearance-none bg-white dark:bg-gray-800 border-none rounded-xl py-2 pl-4 pr-10 text-right font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                
                <!-- Copy Button -->
                <button 
                  v-if="toValue"
                  @click="copyResult"
                  class="absolute right-4 bottom-[-2.5rem] flex items-center gap-1 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Check v-if="copied" class="w-4 h-4" />
                  <Copy v-else class="w-4 h-4" />
                  {{ copied ? '已复制' : '复制结果' }}
                </button>
              </div>
            </div>

          </div>

          <!-- Footer Info -->
          <div class="mt-12 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-400 border border-gray-100 dark:border-gray-700">
              <span>公式参考:</span>
              <span class="text-gray-600 dark:text-gray-300">
                1 {{ convert().describe(fromUnit as any).singular }} ≈ 
                {{ convert(1).from(fromUnit as any).to(toUnit as any).toFixed(4) }} 
                {{ convert().describe(toUnit as any).singular }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
  <div class="h-full flex flex-col gap-6">
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">
        <ArrowRightLeft class="w-5 h-5 text-primary-500" />
        单位换算
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Categories Sidebar/Menu -->
        <div class="md:col-span-1 space-y-1">
          <button
            v-for="m in measures"
            :key="m.id"
            @click="activeMeasure = m.id"
            class="w-full text-left px-4 py-2 rounded-lg text-sm transition-colors"
            :class="activeMeasure === m.id 
              ? 'bg-primary-50 text-primary-600 font-medium dark:bg-primary-900/20' 
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'"
          >
            {{ m.name }}
          </button>
        </div>

        <!-- Conversion Area -->
        <div class="md:col-span-3">
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <div class="grid grid-cols-1 gap-6">
              
              <!-- From -->
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">从</label>
                <div class="flex gap-4">
                  <select 
                    v-model="fromUnit"
                    class="w-1/3 min-w-[120px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <input
                    v-model="fromValue"
                    type="number"
                    @input="calculate('from')"
                    class="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
                    placeholder="输入数值..."
                  />
                </div>
              </div>

              <!-- Swap Button -->
              <div class="flex justify-center -my-2 relative z-10">
                <button 
                  @click="swapUnits"
                  class="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-transform hover:rotate-180 active:scale-95 text-gray-500 hover:text-primary-500"
                  title="交换单位"
                >
                  <ArrowRightLeft class="w-4 h-4" />
                </button>
              </div>

              <!-- To -->
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">到</label>
                <div class="flex gap-4">
                  <select 
                    v-model="toUnit"
                    class="w-1/3 min-w-[120px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <div class="flex-1 relative">
                    <input
                      v-model="toValue"
                      type="number"
                      @input="calculate('to')"
                      class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
                      placeholder="结果..."
                    />
                    <button 
                      v-if="toValue"
                      @click="copyResult"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Check v-if="copied" class="w-4 h-4 text-green-500" />
                      <Copy v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Formula Display (Optional) -->
          <div class="mt-6 text-center text-sm text-gray-500">
            1 {{ convert().describe(fromUnit as any).singular }} = 
            {{ convert(1).from(fromUnit as any).to(toUnit as any).toFixed(6).replace(/\.?0+$/, '') }} 
            {{ convert().describe(toUnit as any).singular }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Palette, Copy, RefreshCw, Check } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { colord, extend } from 'colord'
import namesPlugin from 'colord/plugins/names'
import cmykPlugin from 'colord/plugins/cmyk'
import hwbPlugin from 'colord/plugins/hwb'

extend([namesPlugin, cmykPlugin, hwbPlugin])

const color = ref('#3b82f6') // Default Blue-500
const { copy, copied } = useClipboard()

// Inputs
const inputHex = ref(color.value)
const inputRgb = ref('')
const inputHsl = ref('')
const inputCmyk = ref('')

const updateInputs = (hex: string) => {
  const c = colord(hex)
  if (!c.isValid()) return

  inputHex.value = c.toHex()
  inputRgb.value = c.toRgbString()
  inputHsl.value = c.toHslString()
  inputCmyk.value = c.toCmykString()
}

// Initialize
updateInputs(color.value)

const onHexChange = () => {
  const c = colord(inputHex.value)
  if (c.isValid()) {
    color.value = c.toHex()
    updateInputs(color.value)
  }
}

const onRgbChange = () => {
  const c = colord(inputRgb.value)
  if (c.isValid()) {
    color.value = c.toHex()
    inputHex.value = c.toHex()
    inputHsl.value = c.toHslString()
    inputCmyk.value = c.toCmykString()
  }
}

const onHslChange = () => {
  const c = colord(inputHsl.value)
  if (c.isValid()) {
    color.value = c.toHex()
    inputHex.value = c.toHex()
    inputRgb.value = c.toRgbString()
    inputCmyk.value = c.toCmykString()
  }
}

const onCmykChange = () => {
  const c = colord(inputCmyk.value)
  if (c.isValid()) {
    color.value = c.toHex()
    inputHex.value = c.toHex()
    inputRgb.value = c.toRgbString()
    inputHsl.value = c.toHslString()
  }
}

// Palette generation
const palette = computed(() => {
  const c = colord(color.value)
  const tints = []
  const shades = []
  
  for (let i = 1; i <= 5; i++) {
    tints.push(c.lighten(i * 0.1).toHex())
    shades.push(c.darken(i * 0.1).toHex())
  }
  
  return { tints, shades }
})

const copyColor = (text: string) => {
  copy(text)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <Palette class="w-5 h-5 text-purple-500" />
        颜色转换
      </div>
    </div>

    <div class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
      <!-- Left Panel: Preview & Inputs -->
      <div class="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-2">
        <!-- Preview -->
        <div 
          class="h-40 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden transition-colors duration-300"
          :style="{ backgroundColor: color }"
        >
          <div class="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-mono font-medium text-gray-800 shadow-sm">
            {{ color }}
          </div>
        </div>

        <!-- Inputs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase">HEX</label>
            <div class="relative">
              <input 
                v-model="inputHex"
                @input="onHexChange"
                type="text" 
                class="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              >
              <button 
                @click="copyColor(inputHex)"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
              >
                <Check v-if="copied && inputHex === color" class="w-4 h-4 text-green-500" />
                <Copy v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase">RGB</label>
            <div class="relative">
              <input 
                v-model="inputRgb"
                @input="onRgbChange"
                type="text" 
                class="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              >
              <button 
                @click="copyColor(inputRgb)"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase">HSL</label>
            <div class="relative">
              <input 
                v-model="inputHsl"
                @input="onHslChange"
                type="text" 
                class="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              >
              <button 
                @click="copyColor(inputHsl)"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase">CMYK</label>
            <div class="relative">
              <input 
                v-model="inputCmyk"
                @input="onCmykChange"
                type="text" 
                class="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              >
              <button 
                @click="copyColor(inputCmyk)"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Palette -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
        <h3 class="text-sm font-medium text-gray-700 mb-4">色调变化 (Tints & Shades)</h3>
        
        <div class="space-y-6">
          <!-- Tints -->
          <div class="space-y-2">
            <div class="text-xs text-gray-500">变亮 (Tints)</div>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="c in palette.tints"
                :key="c"
                @click="updateInputs(c)"
                class="h-12 rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-105 active:scale-95 group relative"
                :style="{ backgroundColor: c }"
              >
                <span class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-lg text-xs font-mono text-white backdrop-blur-[1px] transition-opacity">
                  {{ c }}
                </span>
              </button>
            </div>
          </div>

          <!-- Base -->
          <div class="h-16 rounded-xl shadow-md flex items-center justify-center" :style="{ backgroundColor: color }">
             <span class="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-mono shadow-sm">
               Base: {{ color }}
             </span>
          </div>

          <!-- Shades -->
          <div class="space-y-2">
            <div class="text-xs text-gray-500">变暗 (Shades)</div>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="c in palette.shades"
                :key="c"
                @click="updateInputs(c)"
                class="h-12 rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-105 active:scale-95 group relative"
                :style="{ backgroundColor: c }"
              >
                <span class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/10 rounded-lg text-xs font-mono text-white backdrop-blur-[1px] transition-opacity">
                  {{ c }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

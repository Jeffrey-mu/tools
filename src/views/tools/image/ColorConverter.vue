<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Palette, Copy, RefreshCw, Check } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { colord, extend } from 'colord'
import namesPlugin from 'colord/plugins/names'
import cmykPlugin from 'colord/plugins/cmyk'
import hwbPlugin from 'colord/plugins/hwb'
import a11yPlugin from 'colord/plugins/a11y'

extend([namesPlugin, cmykPlugin, hwbPlugin, a11yPlugin])

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
  <div class="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4 md:p-8">
    
    <!-- Left Panel: Immersive Preview -->
    <div 
      class="w-full md:w-1/3 lg:w-2/5 rounded-3xl shadow-2xl transition-all duration-500 relative overflow-hidden group flex flex-col items-center justify-center p-8"
      :style="{ backgroundColor: color }"
    >
      <!-- Big Hex -->
      <div class="relative z-10 text-center space-y-2">
        <h1 
          class="text-4xl md:text-5xl font-mono font-bold tracking-wider transition-colors duration-300"
          :class="colord(color).isDark() ? 'text-white/90' : 'text-gray-900/90'"
        >
          {{ color.toUpperCase() }}
        </h1>
        <p 
          class="text-sm font-medium uppercase tracking-[0.2em] opacity-60"
          :class="colord(color).isDark() ? 'text-white' : 'text-gray-900'"
        >
          {{ colord(color).toName({ closest: true }) || 'Color' }}
        </p>
      </div>

      <!-- Copy Action Overlay -->
      <button 
        @click="copyColor(color)"
        class="absolute inset-0 z-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[2px] cursor-pointer"
      >
        <div class="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <Check v-if="copied && inputHex === color" class="w-5 h-5" />
          <Copy v-else class="w-5 h-5" />
          <span>{{ copied && inputHex === color ? '已复制' : '复制 HEX' }}</span>
        </div>
      </button>
    </div>

    <!-- Right Panel: Controls & Palette -->
    <div class="flex-1 flex flex-col gap-8 overflow-y-auto pr-2">
      
      <!-- Input Section -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
            <Palette class="w-5 h-5" />
          </div>
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">颜色参数</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">HEX</label>
            <div class="relative group">
              <input 
                v-model="inputHex"
                @input="onHexChange"
                type="text" 
                class="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-gray-800 dark:text-gray-100 transition-all"
              >
              <button @click="copyColor(inputHex)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">RGB</label>
            <div class="relative group">
              <input 
                v-model="inputRgb"
                @input="onRgbChange"
                type="text" 
                class="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-gray-800 dark:text-gray-100 transition-all"
              >
              <button @click="copyColor(inputRgb)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">HSL</label>
            <div class="relative group">
              <input 
                v-model="inputHsl"
                @input="onHslChange"
                type="text" 
                class="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-gray-800 dark:text-gray-100 transition-all"
              >
              <button @click="copyColor(inputHsl)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">CMYK</label>
            <div class="relative group">
              <input 
                v-model="inputCmyk"
                @input="onCmykChange"
                type="text" 
                class="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-gray-800 dark:text-gray-100 transition-all"
              >
              <button @click="copyColor(inputCmyk)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Palette Section -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex-1">
        <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <RefreshCw class="w-4 h-4 text-gray-400" />
          色调生成 (Tints & Shades)
        </h3>
        
        <div class="space-y-8">
          <!-- Tints -->
          <div class="space-y-3">
            <div class="flex justify-between text-xs font-medium text-gray-400 px-1">
              <span>Lighter</span>
              <span>Darker</span>
            </div>
            <div class="flex gap-2 w-full">
               <!-- Tints (Reversed for visual flow light -> dark) -->
               <button
                v-for="c in [...palette.tints].reverse()"
                :key="c"
                @click="updateInputs(c)"
                class="flex-1 h-14 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 group relative ring-1 ring-black/5 dark:ring-white/5"
                :style="{ backgroundColor: c }"
                :title="c"
              ></button>
              
              <!-- Base -->
              <div 
                class="flex-[1.5] h-14 rounded-xl shadow-md ring-2 ring-purple-500/50 z-10 transform scale-105"
                :style="{ backgroundColor: color }"
              ></div>

              <!-- Shades -->
               <button
                v-for="c in palette.shades"
                :key="c"
                @click="updateInputs(c)"
                class="flex-1 h-14 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 group relative ring-1 ring-black/5 dark:ring-white/5"
                :style="{ backgroundColor: c }"
                :title="c"
              ></button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

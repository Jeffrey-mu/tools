<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Palette, Maximize2, Minimize2, Copy, Check } from 'lucide-vue-next'
import { colord, extend } from 'colord'
import namesPlugin from 'colord/plugins/names'
import { useClipboard } from '@vueuse/core'

extend([namesPlugin])

const raw = ref('#4f46e5')
const picker = ref('#4f46e5')
const error = ref('')
const previewEl = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const parsed = computed(() => {
  const c = colord(raw.value.trim())
  if (!c.isValid()) return null
  return c
})

const displayHex = computed(() => parsed.value?.toHex().toLowerCase() ?? '')
const displayRgb = computed(() => parsed.value ? parsed.value.toRgbString() : '')
const displayHsl = computed(() => parsed.value ? parsed.value.toHslString() : '')

const syncFromPicker = (val: string) => {
  raw.value = val
  error.value = ''
}

const onInputChange = () => {
  const v = raw.value.trim()
  const c = colord(v)
  if (!c.isValid()) {
    error.value = '无效的颜色值（支持 HEX/RGB/HSL/命名色）'
    return
  }
  error.value = ''
  picker.value = c.toHex().toLowerCase()
}

const { copy, copied } = useClipboard()

const enterFullscreen = async () => {
  if (!previewEl.value) return
  try {
    // @ts-ignore
    await (previewEl.value.requestFullscreen?.() || previewEl.value.webkitRequestFullscreen?.())
    isFullscreen.value = true
  } catch {}
}

const exitFullscreen = async () => {
  try {
    // @ts-ignore
    await (document.exitFullscreen?.() || document.webkitExitFullscreen?.())
  } catch {}
}

const onFsChange = () => {
  // @ts-ignore
  const active = !!(document.fullscreenElement || document.webkitFullscreenElement)
  isFullscreen.value = active
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange as any)
  // @ts-ignore
  document.addEventListener('webkitfullscreenchange', onFsChange as any)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange as any)
  // @ts-ignore
  document.removeEventListener('webkitfullscreenchange', onFsChange as any)
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 text-gray-800 dark:text-gray-100">
        <Palette class="w-5 h-5 text-purple-500" />
        <span class="font-semibold">颜色渲染</span>
      </div>

      <div class="flex items-center gap-3 flex-1 max-w-2xl">
        <input
          v-model="raw"
          @input="onInputChange"
          type="text"
          placeholder="#4f46e5 / rgb(79,70,229) / hsl(241,77%,59%) / rebeccapurple"
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-gray-700 dark:text-gray-200 font-mono"
        />
        <input
          v-model="picker"
          @input="syncFromPicker(($event.target as HTMLInputElement).value)"
          type="color"
          aria-label="选择颜色"
          class="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-gray-200 dark:border-gray-700 p-1"
        />
        <button
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          @click="parsed && copy(displayHex)"
          :disabled="!parsed"
        >
          <component :is="copied ? Check : Copy" class="w-4 h-4" />
          复制 HEX
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="!isFullscreen"
          class="px-3 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          @click="enterFullscreen"
          :disabled="!parsed"
        >
          <Maximize2 class="w-4 h-4" />
          全屏展示
        </button>
        <button
          v-else
          class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          @click="exitFullscreen"
        >
          <Minimize2 class="w-4 h-4" />
          退出全屏
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div ref="previewEl" class="relative w-full h-full flex items-center justify-center" :style="{ backgroundColor: parsed ? parsed.toHex() : '#f1f5f9' }">
        <div class="absolute inset-0 pointer-events-none select-none opacity-[0.02] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div v-if="!isFullscreen" class="relative px-6 py-5 rounded-2xl shadow-lg ring-1 ring-black/10 dark:ring-white/10 backdrop-blur bg-white/86 dark:bg-gray-900/80 text-center text-gray-900 dark:text-gray-100">
          <div class="text-xs uppercase tracking-wider mb-2 text-gray-600 dark:text-gray-300">当前颜色</div>
          <div class="text-3xl font-bold mb-3 text-gray-900 dark:text-white">{{ displayHex || '无效颜色' }}</div>
          <div class="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span class="px-2 py-1 rounded bg-black/5 text-gray-700 dark:bg-white/10 dark:text-gray-200">{{ displayRgb }}</span>
            <span class="px-2 py-1 rounded bg-black/5 text-gray-700 dark:bg-white/10 dark:text-gray-200">{{ displayHsl }}</span>
          </div>
        </div>

        <div v-if="error && !isFullscreen" class="absolute bottom-4 left-4 right-4 mx-auto max-w-xl px-4 py-3 rounded-xl bg-red-100 dark:bg-red-900/70 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 shadow-sm">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

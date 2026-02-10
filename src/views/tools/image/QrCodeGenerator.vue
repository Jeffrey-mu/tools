<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { QrCode, Download, RefreshCw } from 'lucide-vue-next'
import QRCode from 'qrcode'

const text = ref('https://example.com')
const size = ref(300)
const margin = ref(2)
const errorCorrectionLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const darkColor = ref('#000000')
const lightColor = ref('#ffffff')

const qrUrl = ref('')
const loading = ref(false)

const generate = async () => {
  if (!text.value) {
    qrUrl.value = ''
    return
  }
  
  loading.value = true
  try {
    qrUrl.value = await QRCode.toDataURL(text.value, {
      width: size.value,
      margin: margin.value,
      errorCorrectionLevel: errorCorrectionLevel.value,
      color: {
        dark: darkColor.value,
        light: lightColor.value
      }
    })
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Debounce watch for text input to avoid too many generations
let timeout: NodeJS.Timeout
watch(text, () => {
  clearTimeout(timeout)
  timeout = setTimeout(generate, 300)
})

watch([size, margin, errorCorrectionLevel, darkColor, lightColor], generate)

onMounted(() => {
  generate()
})

const download = () => {
  if (!qrUrl.value) return
  const link = document.createElement('a')
  link.download = `qrcode-${Date.now()}.png`
  link.href = qrUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <QrCode class="w-5 h-5 text-purple-500" />
        二维码生成器
      </div>
      
      <button 
        @click="download"
        :disabled="!qrUrl"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <Download class="w-4 h-4" />
        下载图片
      </button>
    </div>

    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">
      <!-- Config Panel -->
      <div class="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">内容</label>
          <textarea 
            v-model="text" 
            rows="4"
            class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            placeholder="输入链接或文本..."
          ></textarea>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <label class="text-sm font-medium text-gray-700">尺寸 (px)</label>
              <span class="text-xs text-gray-500">{{ size }}x{{ size }}</span>
            </div>
            <input v-model.number="size" type="range" min="100" max="1000" step="10" class="w-full accent-purple-600">
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <label class="text-sm font-medium text-gray-700">边距</label>
              <span class="text-xs text-gray-500">{{ margin }}</span>
            </div>
            <input v-model.number="margin" type="range" min="0" max="10" class="w-full accent-purple-600">
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">容错率</label>
            <div class="grid grid-cols-4 gap-2">
              <button 
                v-for="level in ['L', 'M', 'Q', 'H']" 
                :key="level"
                @click="errorCorrectionLevel = level as any"
                class="px-2 py-1.5 text-sm rounded-lg border transition-all"
                :class="errorCorrectionLevel === level ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">前景色</label>
              <div class="flex items-center gap-2">
                <input v-model="darkColor" type="color" class="w-8 h-8 rounded border-0 p-0 overflow-hidden cursor-pointer">
                <span class="text-xs text-gray-500 font-mono">{{ darkColor }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">背景色</label>
              <div class="flex items-center gap-2">
                <input v-model="lightColor" type="color" class="w-8 h-8 rounded border-0 p-0 overflow-hidden cursor-pointer">
                <span class="text-xs text-gray-500 font-mono">{{ lightColor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="flex-1 bg-gray-50 rounded-xl shadow-inner border border-gray-200 flex items-center justify-center p-8 relative overflow-hidden">
        <div class="absolute inset-0 pattern-grid-lg opacity-5 pointer-events-none"></div>
        
        <div v-if="qrUrl" class="bg-white p-4 shadow-lg rounded-xl max-w-full max-h-full overflow-auto flex items-center justify-center">
          <img :src="qrUrl" alt="QR Code" class="max-w-full h-auto object-contain" />
        </div>
        <div v-else class="text-gray-400 flex flex-col items-center gap-2">
          <QrCode class="w-12 h-12 opacity-20" />
          <span>输入内容以生成二维码</span>
        </div>
      </div>
    </div>
  </div>
</template>

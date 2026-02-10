<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Dices, Shuffle, RotateCw, Plus, Trash2, Trophy } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'

// --- Tabs ---
type Tab = 'wheel' | 'number'
const activeTab = ref<Tab>('wheel')

// --- Random Number Logic ---
const minNum = ref(1)
const maxNum = ref(100)
const randomNumResult = ref<number | null>(null)
const isGeneratingNum = ref(false)

const generateRandomNumber = async () => {
  if (minNum.value > maxNum.value) return
  
  isGeneratingNum.value = true
  randomNumResult.value = null
  
  // Fake animation effect
  const duration = 600
  const interval = 50
  const steps = duration / interval
  let currentStep = 0
  
  const timer = setInterval(() => {
    randomNumResult.value = Math.floor(Math.random() * (maxNum.value - minNum.value + 1)) + minNum.value
    currentStep++
    
    if (currentStep >= steps) {
      clearInterval(timer)
      isGeneratingNum.value = false
    }
  }, interval)
}

// --- Decision Wheel Logic ---
const defaultOptions = ['汉堡王', '麦当劳', '肯德基', '沙县小吃', '兰州拉面', '麻辣烫']
const wheelOptions = useStorage<string[]>('decision-wheel-options', defaultOptions)
const newOption = ref('')
const wheelCanvas = ref<HTMLCanvasElement | null>(null)
const isSpinning = ref(false)
const winner = ref<string | null>(null)
const rotation = ref(0)

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFCC5C', '#FF9671', '#D4A5A5'
]

const drawWheel = () => {
  const canvas = wheelCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10
  const options = wheelOptions.value
  const step = (2 * Math.PI) / options.length

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  options.forEach((opt, index) => {
    const startAngle = index * step
    const endAngle = startAngle + step
    
    // Slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.fillStyle = colors[index % colors.length]
    ctx.fill()
    ctx.stroke()
    
    // Text
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(startAngle + step / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(opt, radius - 20, 5)
    ctx.restore()
  })
}

const addOption = () => {
  if (newOption.value.trim()) {
    wheelOptions.value.push(newOption.value.trim())
    newOption.value = ''
    drawWheel()
  }
}

const removeOption = (index: number) => {
  wheelOptions.value.splice(index, 1)
  drawWheel()
}

const spinWheel = () => {
  if (isSpinning.value || wheelOptions.value.length < 2) return
  
  isSpinning.value = true
  winner.value = null
  
  // Calculate target rotation (at least 5 full spins + random)
  const spinCount = 5 + Math.random() * 5
  const extraDegrees = Math.random() * 360
  const totalDegrees = spinCount * 360 + extraDegrees
  
  rotation.value += totalDegrees
  
  setTimeout(() => {
    isSpinning.value = false
    // Calculate winner
    // The pointer is usually at 0 degrees (right) or -90 (top). 
    // Let's assume pointer is at 0 (Right).
    // Canvas rotation is clockwise. 
    // The item at 0 degrees is the one that started at (360 - (rotation % 360)).
    
    const normalizedRotation = rotation.value % 360
    const sectorSize = 360 / wheelOptions.value.length
    
    // Adjust logic based on where the pointer is visualy.
    // If we rotate the CANVAS, the pointer is static.
    // Let's say pointer is at Right (0 deg).
    // The winning index is:
    const winningIndex = Math.floor(((360 - normalizedRotation) % 360) / sectorSize)
    winner.value = wheelOptions.value[winningIndex]
    
  }, 5000) // 5s duration matches CSS transition
}

onMounted(() => {
  drawWheel()
})

watch(wheelOptions, drawWheel, { deep: true })

watch(activeTab, async (newTab) => {
  if (newTab === 'wheel') {
    await nextTick()
    drawWheel()
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col gap-6 p-4">
    
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-3 bg-orange-100 text-orange-600 rounded-2xl dark:bg-orange-900/30 dark:text-orange-400">
          <Dices class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">决策助手</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">选择困难症的福音</p>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
        <button
          @click="activeTab = 'wheel'"
          class="px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          :class="activeTab === 'wheel' 
            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          <RotateCw class="w-4 h-4" />
          转盘
        </button>
        <button
          @click="activeTab = 'number'"
          class="px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          :class="activeTab === 'number' 
            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          <Shuffle class="w-4 h-4" />
          随机数
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/5 p-8">
      
      <!-- Random Number Generator -->
      <div v-if="activeTab === 'number'" class="h-full flex flex-col items-center justify-center gap-12 py-12">
        <div class="text-center space-y-2">
          <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200">生成指定范围内的随机数</h2>
        </div>

        <div class="flex items-center gap-4 text-2xl font-mono text-gray-600 dark:text-gray-300">
          <input 
            v-model="minNum" 
            type="number" 
            class="w-24 text-center bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl py-2 focus:border-orange-500 outline-none transition-colors"
          >
          <span>~</span>
          <input 
            v-model="maxNum" 
            type="number" 
            class="w-24 text-center bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl py-2 focus:border-orange-500 outline-none transition-colors"
          >
        </div>

        <div class="relative w-64 h-64 flex items-center justify-center">
          <!-- Background Decoration -->
          <div class="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse" v-if="isGeneratingNum"></div>
          
          <div class="text-8xl font-bold tabular-nums text-gray-900 dark:text-white drop-shadow-sm">
            {{ randomNumResult ?? '?' }}
          </div>
        </div>

        <button 
          @click="generateRandomNumber"
          :disabled="isGeneratingNum"
          class="px-12 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isGeneratingNum ? '生成中...' : '开始生成' }}
        </button>
      </div>

      <!-- Decision Wheel -->
      <div v-else class="h-full flex flex-col lg:flex-row gap-12 items-center lg:items-start">
        
        <!-- Wheel Visual -->
        <div class="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
          <div class="relative">
            <!-- Pointer -->
            <div class="absolute top-1/2 right-[-20px] -translate-y-1/2 z-20 w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[30px] border-r-gray-800 dark:border-r-white transform rotate-180 drop-shadow-lg"></div>
            
            <!-- Canvas Wheel -->
            <div 
              class="relative rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700"
              :style="{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none' }"
            >
              <canvas ref="wheelCanvas" width="400" height="400" class="block"></canvas>
            </div>
            
            <!-- Center Hub -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg z-10 flex items-center justify-center border-4 border-gray-100 dark:border-gray-600">
              <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <Dices class="w-6 h-6" />
              </div>
            </div>
          </div>

          <button 
            @click="spinWheel"
            :disabled="isSpinning || wheelOptions.length < 2"
            class="mt-12 px-12 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSpinning ? '好运流转中...' : '开始转动' }}
          </button>
          
          <!-- Winner Display -->
          <Transition name="bounce">
            <div v-if="winner" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl text-center border border-orange-200 dark:border-orange-900/50 min-w-[200px]">
              <div class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-2">结果是</div>
              <div class="text-3xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2">
                <Trophy class="w-8 h-8" />
                {{ winner }}
              </div>
              <button @click="winner = null" class="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">关闭</button>
            </div>
          </Transition>
        </div>

        <!-- Options Panel -->
        <div class="w-full lg:w-80 bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/50 flex flex-col h-[500px]">
          <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center justify-between">
            选项列表
            <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500">{{ wheelOptions.length }}</span>
          </h3>

          <div class="flex gap-2 mb-4">
            <input 
              v-model="newOption"
              @keyup.enter="addOption"
              type="text" 
              placeholder="添加选项..."
              class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:border-orange-500 outline-none"
            >
            <button 
              @click="addOption"
              class="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-sm"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div 
              v-for="(opt, index) in wheelOptions" 
              :key="index"
              class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors[index % colors.length] }"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ opt }}</span>
              </div>
              <button 
                @click="removeOption(index)"
                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
</style>
<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useTitle, useWebNotification } from '@vueuse/core'
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair } from 'lucide-vue-next'

type TimerMode = 'work' | 'short-break' | 'long-break'

const MODES: Record<TimerMode, { label: string, minutes: number, color: string, bgGradient: string, icon: any }> = {
  'work': { 
    label: '专注工作', 
    minutes: 25, 
    color: 'text-rose-500', 
    bgGradient: 'from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30',
    icon: Brain 
  },
  'short-break': { 
    label: '短休息', 
    minutes: 5, 
    color: 'text-teal-500', 
    bgGradient: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30',
    icon: Coffee 
  },
  'long-break': { 
    label: '长休息', 
    minutes: 15, 
    color: 'text-indigo-500', 
    bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30',
    icon: Armchair 
  },
}

const currentMode = ref<TimerMode>('work')
const timeLeft = ref(MODES['work'].minutes * 60)
const isRunning = ref(false)
const timer = ref<number | null>(null)

// Sound effect (simple beep)
const playSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Simple bell sound
  audio.play().catch(e => console.log('Audio play failed', e))
}

const { show: showNotification } = useWebNotification()

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const progress = computed(() => {
  const totalSeconds = MODES[currentMode.value].minutes * 60
  return ((totalSeconds - timeLeft.value) / totalSeconds) * 100
})

const title = useTitle()

watch(timeLeft, (newVal) => {
  if (isRunning.value) {
    title.value = `${formattedTime.value} - ${MODES[currentMode.value].label}`
  }
})

const startTimer = () => {
  if (isRunning.value) return
  isRunning.value = true
  timer.value = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      completeTimer()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  title.value = '番茄钟 - 专注每一刻'
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = MODES[currentMode.value].minutes * 60
}

const switchMode = (mode: TimerMode) => {
  pauseTimer()
  currentMode.value = mode
  timeLeft.value = MODES[mode].minutes * 60
}

const completeTimer = () => {
  pauseTimer()
  playSound()
  showNotification({
    title: '时间到！',
    body: `${MODES[currentMode.value].label}结束了，休息一下吧！`,
    icon: '/favicon.ico'
  })
  
  // Auto switch logic could be added here
}

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  title.value = '开发者日常工具箱' // Reset title
})
</script>

<template>
  <div 
    class="h-full flex flex-col items-center justify-center p-6 transition-colors duration-700 bg-gradient-to-br"
    :class="MODES[currentMode].bgGradient"
  >
    
    <!-- Main Card -->
    <div class="w-full max-w-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 p-8 flex flex-col items-center gap-10">
      
      <!-- Mode Switcher -->
      <div class="flex p-1.5 bg-gray-200/50 dark:bg-gray-800/50 rounded-full">
        <button
          v-for="(config, mode) in MODES"
          :key="mode"
          @click="switchMode(mode as TimerMode)"
          class="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
          :class="currentMode === mode 
            ? 'bg-white dark:bg-gray-700 shadow-sm ' + config.color 
            : 'text-gray-500 hover:text-gray-700 hover:bg-white/30 dark:text-gray-400 dark:hover:text-gray-200'"
        >
          <component :is="config.icon" class="w-4 h-4" />
          {{ config.label }}
        </button>
      </div>

      <!-- Timer Display -->
      <div class="relative w-80 h-80 flex items-center justify-center">
        <!-- SVG Progress Circle -->
        <svg class="w-full h-full transform -rotate-90 drop-shadow-lg">
          <!-- Track -->
          <circle
            cx="160"
            cy="160"
            r="148"
            stroke="currentColor"
            stroke-width="6"
            fill="transparent"
            class="text-gray-200/50 dark:text-gray-700/50"
          />
          <!-- Progress -->
          <circle
            cx="160"
            cy="160"
            r="148"
            stroke="currentColor"
            stroke-width="6"
            fill="transparent"
            :class="MODES[currentMode].color"
            stroke-linecap="round"
            :stroke-dasharray="2 * Math.PI * 148"
            :stroke-dashoffset="2 * Math.PI * 148 * (1 - progress / 100)"
            class="transition-all duration-1000 ease-linear filter drop-shadow-md"
          />
        </svg>
        
        <!-- Time Text -->
        <div class="absolute flex flex-col items-center text-center">
          <div 
            class="text-8xl font-light tracking-tighter tabular-nums transition-colors duration-300"
            :class="isRunning ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'"
          >
            {{ formattedTime }}
          </div>
          <div 
            class="mt-4 text-base font-medium tracking-[0.2em] uppercase transition-colors duration-300"
            :class="MODES[currentMode].color"
          >
            {{ isRunning ? 'FOCUSING' : 'PAUSED' }}
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-8">
        <button
          @click="resetTimer"
          class="flex items-center justify-center w-14 h-14 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all duration-300"
          title="重置"
        >
          <RotateCcw class="w-6 h-6" />
        </button>

        <button
          @click="isRunning ? pauseTimer() : startTimer()"
          class="group relative flex items-center justify-center w-24 h-24 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
          :class="isRunning 
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' 
            : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'"
        >
          <Pause v-if="isRunning" class="w-10 h-10 fill-current" />
          <Play v-else class="w-10 h-10 fill-current ml-1" />
        </button>

        <!-- Placeholder for symmetry or settings -->
        <div class="w-14 h-14"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { toolsData } from '@/data/tools'
import { Search, Sparkles, ArrowRight } from 'lucide-vue-next'

const categories = toolsData
const openSearch = inject('openSearch') as () => void

const accentByCategoryId: Record<
  string,
  { borderHover: string; titleHover: string; arrow: string; focusRing: string }
> = {
  'dev-tools': {
    borderHover: 'hover:border-blue-200 dark:hover:border-blue-500/50',
    titleHover: 'group-hover:text-blue-700 dark:group-hover:text-blue-300',
    arrow: 'text-blue-500 dark:text-blue-400',
    focusRing: 'focus-visible:ring-blue-500/30',
  },
  'text-tools': {
    borderHover: 'hover:border-emerald-200 dark:hover:border-emerald-500/50',
    titleHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
    arrow: 'text-emerald-500 dark:text-emerald-400',
    focusRing: 'focus-visible:ring-emerald-500/30',
  },
  'image-tools': {
    borderHover: 'hover:border-purple-200 dark:hover:border-purple-500/50',
    titleHover: 'group-hover:text-purple-700 dark:group-hover:text-purple-300',
    arrow: 'text-purple-500 dark:text-purple-400',
    focusRing: 'focus-visible:ring-purple-500/30',
  },
  'life-tools': {
    borderHover: 'hover:border-orange-200 dark:hover:border-orange-500/50',
    titleHover: 'group-hover:text-orange-700 dark:group-hover:text-orange-300',
    arrow: 'text-orange-500 dark:text-orange-400',
    focusRing: 'focus-visible:ring-orange-500/30',
  },
}

const getAccent = (categoryId: string) => {
  return accentByCategoryId[categoryId] ?? accentByCategoryId['dev-tools']
}
</script>

<template>
  <div class="space-y-14 pb-14">
    <!-- Hero Section -->
    <div class="relative py-14 sm:py-20 lg:py-24 text-center max-w-4xl mx-auto px-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-gray-900/40 text-sm font-medium text-gray-700 dark:text-gray-200 mb-8 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
        <Sparkles class="w-4 h-4" />
        <span>简单、纯粹、高效</span>
      </div>

      <h1 class="text-[clamp(2.6rem,5vw,4.25rem)] leading-[1.02] font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
        开发者日常
        <span class="text-indigo-600 dark:text-indigo-300">工具箱</span>
      </h1>
      
      <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        无广告、无追踪、纯本地运行。
        <br class="hidden sm:inline">专注于提供最纯粹的工具体验，保护您的隐私安全。
      </p>

      <!-- Search Trigger -->
      <button
        type="button"
        class="max-w-xl mx-auto w-full text-left rounded-xl px-5 py-3.5 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300/80 dark:hover:border-gray-600/80 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out shadow-sm hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
        @click="openSearch"
        aria-label="打开全局搜索"
      >
        <Search class="w-5 h-5 text-gray-400 dark:text-gray-500" />
        <span class="text-gray-500 dark:text-gray-400 text-base">快速搜索工具…</span>
        <div class="ml-auto flex items-center gap-2">
          <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">⌘K</kbd>
        </div>
      </button>
    </div>

    <!-- Tool Categories -->
    <div v-for="category in categories" :key="category.title" :id="category.id" class="space-y-6 scroll-mt-24">
      <div class="flex items-center gap-3">
        <div :class="['p-2 rounded-xl ring-1 ring-black/5 dark:ring-white/10', category.bg, category.color, category.darkBg, category.darkColor]">
          <component :is="category.icon" class="w-5 h-5" />
        </div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ category.title }}</h2>
        <div class="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <template v-for="tool in category.tools" :key="tool.name">
          <component
            :is="tool.status === '已开发' ? 'router-link' : 'div'"
            :to="tool.status === '已开发' ? tool.path : undefined"
            class="group relative flex flex-col p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-none transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
            :class="[
              tool.status === '已开发' ? ['cursor-pointer focus-visible:outline-none focus-visible:ring-2', getAccent(category.id).focusRing] : 'opacity-70',
              getAccent(category.id).borderHover
            ]"
          >
            <div class="flex items-start justify-between mb-3">
              <div 
                class="p-2.5 rounded-xl transition-colors ring-1 ring-black/5 dark:ring-white/10"
                :class="[category.bg, category.color, category.darkBg, category.darkColor]"
              >
                <component :is="tool.icon" class="w-5 h-5" />
              </div>
              
              <div v-if="tool.status === '已开发'" class="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight class="w-4 h-4" :class="getAccent(category.id).arrow" />
              </div>
            </div>
            
            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 transition-colors" :class="getAccent(category.id).titleHover">
              {{ tool.name }}
            </h3>
            
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              {{ tool.desc }}
            </p>
          </component>
        </template>
      </div>
    </div>
  </div>
</template>

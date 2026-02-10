<script setup lang="ts">
import { inject } from 'vue'
import { toolsData } from '@/data/tools'
import { Search, Sparkles, ArrowRight } from 'lucide-vue-next'

const categories = toolsData
const openSearch = inject('openSearch') as () => void
</script>

<template>
  <div class="space-y-12 pb-12">
    <!-- Hero Section -->
    <div class="relative py-16 sm:py-24 text-center max-w-4xl mx-auto px-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8">
        <Sparkles class="w-4 h-4" />
        <span>简单、纯粹、高效</span>
      </div>

      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900 dark:text-white mb-6">
        开发者日常
        <span class="text-blue-600 dark:text-blue-400">工具箱</span>
      </h1>
      
      <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        无广告、无追踪、纯本地运行。
        <br class="hidden sm:inline">专注于提供最纯粹的工具体验，保护您的隐私安全。
      </p>

      <!-- Search Trigger -->
      <div class="max-w-xl mx-auto group cursor-pointer" @click="openSearch">
        <div 
          class="relative w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 text-left rounded-xl px-5 py-3.5 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
        >
          <Search class="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <span class="text-gray-400 dark:text-gray-500 text-base">快速搜索工具...</span>
          <div class="ml-auto flex items-center gap-2">
            <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">⌘K</kbd>
          </div>
        </div>
      </div>
    </div>

    <!-- Tool Categories -->
    <div v-for="category in categories" :key="category.title" :id="category.id" class="space-y-6 scroll-mt-24">
      <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2">
        <div :class="['p-2 rounded-lg', category.bg, category.color, category.darkBg, category.darkColor]">
          <component :is="category.icon" class="w-5 h-5" />
        </div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ category.title }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <template v-for="tool in category.tools" :key="tool.name">
          <component
            :is="tool.status === '已开发' ? 'router-link' : 'div'"
            :to="tool.status === '已开发' ? tool.path : undefined"
            class="group relative flex flex-col p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200"
            :class="{ 'cursor-pointer': tool.status === '已开发', 'opacity-70': tool.status !== '已开发' }"
          >
            <div class="flex items-start justify-between mb-3">
              <div 
                class="p-2.5 rounded-lg transition-colors"
                :class="[category.bg, category.color, category.darkBg, category.darkColor]"
              >
                <component :is="tool.icon" class="w-5 h-5" />
              </div>
              
              <div v-if="tool.status === '已开发'" class="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight class="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            
            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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

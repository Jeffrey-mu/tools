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
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-sm font-medium text-blue-600 mb-8">
        <Sparkles class="w-4 h-4" />
        <span>简单、纯粹、高效</span>
      </div>

      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900 mb-6">
        开发者日常
        <span class="text-blue-600">工具箱</span>
      </h1>
      
      <p class="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        无广告、无追踪、纯本地运行。
        <br class="hidden sm:inline">专注于提供最纯粹的工具体验，保护您的隐私安全。
      </p>

      <!-- Search Trigger -->
      <div class="max-w-xl mx-auto group cursor-pointer" @click="openSearch">
        <div 
          class="relative w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 text-left rounded-xl px-5 py-3.5 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
        >
          <Search class="w-5 h-5 text-gray-400" />
          <span class="text-gray-400 text-base">快速搜索工具...</span>
          <div class="ml-auto flex items-center gap-2">
            <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">⌘K</kbd>
          </div>
        </div>
      </div>
    </div>

    <!-- Tool Categories -->
    <div v-for="category in categories" :key="category.title" :id="category.id" class="space-y-6 scroll-mt-24">
      <div class="flex items-center gap-3 border-b border-gray-100 pb-2">
        <div :class="['p-2 rounded-lg', category.bg, category.color]">
          <component :is="category.icon" class="w-5 h-5" />
        </div>
        <h2 class="text-xl font-bold text-gray-800">{{ category.title }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <template v-for="tool in category.tools" :key="tool.name">
          <component
            :is="tool.status === '已开发' ? 'router-link' : 'div'"
            :to="tool.status === '已开发' ? tool.path : undefined"
            class="group relative flex flex-col p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
            :class="{ 'cursor-pointer': tool.status === '已开发', 'opacity-70': tool.status !== '已开发' }"
          >
            <div class="flex items-start justify-between mb-3">
              <div 
                class="p-2.5 rounded-lg transition-colors"
                :class="[category.bg, category.color]"
              >
                <component :is="tool.icon" class="w-5 h-5" />
              </div>
              
              <div v-if="tool.status === '已开发'" class="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight class="w-4 h-4 text-blue-500" />
              </div>
            </div>
            
            <h3 class="text-base font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
              {{ tool.name }}
            </h3>
            
            <p class="text-sm text-gray-500 leading-relaxed line-clamp-2">
              {{ tool.desc }}
            </p>
          </component>
        </template>
      </div>
    </div>
  </div>
</template>

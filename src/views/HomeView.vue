<script setup lang="ts">
import { toolsData } from '@/data/tools'

const categories = toolsData
</script>

<template>
  <div class="space-y-12">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div class="relative px-6 py-16 sm:px-12 sm:py-24 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
          您的日常开发与生活
          <span class="text-blue-200">瑞士军刀</span>
        </h1>
        <p class="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          精心打造的工具集合，涵盖开发、文本、图形与效率。
          <br class="hidden sm:inline">纯本地处理，无广告干扰，保护您的隐私安全。
        </p>
        <div class="flex justify-center gap-4">
          <button class="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg">
            开始使用
          </button>
          <button class="px-8 py-3 bg-blue-500/30 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold hover:bg-blue-500/40 transition-colors">
            了解更多
          </button>
        </div>
      </div>
    </div>

    <!-- Tool Categories -->
    <div v-for="category in categories" :key="category.title" :id="category.id" class="space-y-6 scroll-mt-24">
      <div class="flex items-center gap-3 pb-2">
        <div :class="['p-2 rounded-xl ring-4 ring-white shadow-sm', category.bg, category.color]">
          <component :is="category.icon" class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">{{ category.title }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <template v-for="tool in category.tools" :key="tool.name">
          <component
            :is="tool.status === '已开发' ? 'router-link' : 'div'"
            :to="tool.status === '已开发' ? tool.path : undefined"
            class="group flex items-start p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-100"
            :class="{ 'cursor-pointer': tool.status === '已开发', 'opacity-60 cursor-not-allowed': tool.status !== '已开发' }"
          >
            <div 
              class="p-3 rounded-lg mr-4 transition-colors duration-300 group-hover:scale-110 transform"
              :class="[category.bg, category.color]"
            >
              <component :is="tool.icon" class="w-6 h-6" />
            </div>
            
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ tool.name }}
                </h3>
                <span 
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="tool.status === '已开发' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ tool.status }}
                </span>
              </div>
              <p class="text-sm text-gray-500 line-clamp-2">
                {{ tool.desc }}
              </p>
            </div>
          </component>
        </template>
      </div>
    </div>
  </div>
</template>

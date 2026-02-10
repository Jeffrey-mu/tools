<script setup lang="ts">
import { Check, Zap, Crown, Shield, Infinity, Rocket } from 'lucide-vue-next'

const features = [
  {
    icon: Zap,
    title: '极速处理',
    desc: '优先使用高性能服务器，处理速度提升 300%'
  },
  {
    icon: Infinity,
    title: '无限制使用',
    desc: '解除所有工具的使用次数和文件大小限制'
  },
  {
    icon: Shield,
    title: '私密安全',
    desc: '企业级数据加密，支持私有化部署选项'
  },
  {
    icon: Rocket,
    title: '抢先体验',
    desc: '优先体验新功能，参与产品规划与设计'
  }
]
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-12 py-8 px-4 sm:px-6">
    <!-- Hero Section -->
    <div class="text-center space-y-6">
      <div class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl mb-4">
        <Crown class="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
      </div>
      <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400">
        升级到 Pro 版本
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        解锁更多高级功能，享受极致的开发体验。让工具成为你最强大的生产力助手。
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="feature in features" 
        :key="feature.title"
        class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-yellow-200 dark:hover:border-yellow-500/30 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <component :is="feature.icon" class="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Card -->
    <div class="relative overflow-hidden rounded-3xl bg-gray-900 dark:bg-black text-white p-8 md:p-12 text-center">
      <!-- Background Decorations -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 space-y-8">
        <div>
          <h2 class="text-3xl font-bold mb-4">限时早鸟优惠</h2>
          <div class="flex items-baseline justify-center gap-2">
            <span class="text-5xl font-extrabold text-yellow-400">¥99</span>
            <span class="text-xl text-gray-400 line-through">¥299</span>
            <span class="text-lg text-gray-400">/ 终身</span>
          </div>
        </div>

        <ul class="flex flex-col items-center gap-3 text-gray-300">
          <li class="flex items-center gap-2">
            <Check class="w-5 h-5 text-green-400" />
            <span>解锁全部 Pro 功能</span>
          </li>
          <li class="flex items-center gap-2">
            <Check class="w-5 h-5 text-green-400" />
            <span>永久免费更新</span>
          </li>
          <li class="flex items-center gap-2">
            <Check class="w-5 h-5 text-green-400" />
            <span>专属技术支持</span>
          </li>
        </ul>

        <button class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/25 transform hover:-translate-y-1 transition-all duration-200">
          立即升级
        </button>
        
        <p class="text-sm text-gray-500">
          30 天无理由退款保证 · 安全支付
        </p>
      </div>
    </div>
  </div>
</template>

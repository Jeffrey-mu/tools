<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Code2, X } from 'lucide-vue-next'

type MenuItem = {
  name: string
  id: string
  icon: any
}

const props = defineProps<{
  isOpen: boolean
  activeSection: string
  menuItems: MenuItem[]
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'select', id: string): void
}>()

const router = useRouter()
</script>

<template>
  <div>
    <div
      v-if="props.isOpen"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="emit('toggle')"
    ></div>

    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] h-full',
        'lg:translate-x-0',
        props.isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="h-full flex flex-col">
        <div class="h-20 flex items-center px-8">
          <span class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
              <Code2 class="w-6 h-6" />
            </div>
            工具箱
          </span>
          <button
            class="ml-auto lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-[background-color,transform,color] duration-150 ease-out active:scale-[0.96] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            @click="emit('toggle')"
            aria-label="关闭侧边栏"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider px-4 mb-4">
            导航
          </div>
          <a
            v-for="item in props.menuItems"
            :key="item.id"
            href="#"
            class="group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-[background-color,transform,color] duration-150 ease-out relative overflow-hidden active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            :class="[
              props.activeSection === item.id
                ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
            @click.prevent="emit('select', item.id)"
          >
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full transition-all duration-200"
              :class="props.activeSection === item.id ? 'opacity-100' : 'opacity-0'"
            ></div>
            <component
              :is="item.icon"
              class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
              :class="props.activeSection === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'"
            />
            {{ item.name }}
          </a>
        </nav>

        <div class="p-6 border-t border-gray-100 dark:border-gray-800">
          <div class="bg-gray-900 dark:bg-gray-800 rounded-2xl p-4 text-white shadow-xl shadow-gray-900/10 dark:shadow-black/30 relative overflow-hidden group ring-1 ring-white/10">
            <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code2 class="w-12 h-12 rotate-12" />
            </div>
            <h4 class="font-bold mb-1 relative z-10">专业版</h4>
            <p class="text-xs text-gray-300 dark:text-gray-400 mb-3 relative z-10">解锁全部工具与更多能力</p>
            <button
              @click="router.push('/pro')"
              class="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold backdrop-blur-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.99] border border-white/10 relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              了解详情
            </button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

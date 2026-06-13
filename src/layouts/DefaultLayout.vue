<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Home, Code2, Type, Image as ImageIcon, Clock } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import CommandPalette from '@/components/layout/CommandPalette.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'vueuse-color-scheme',
  disableTransition: false,
})
const toggleDark = useToggle(isDark)

const router = useRouter()
const route = useRoute()
const isSidebarOpen = ref(false)
const activeSection = ref('home')
const commandPaletteRef = ref<{ open: () => void; close: () => void } | null>(null)

const openSearch = () => {
  commandPaletteRef.value?.open()
}

provide('openSearch', openSearch)

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

const handleKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null
  const tag = target?.tagName?.toLowerCase()
  const isTypingTarget =
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    Boolean(target?.isContentEditable)

  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    if (isTypingTarget) return
    e.preventDefault()
    openSearch()
  }
  if (e.key === 'Escape') {
    commandPaletteRef.value?.close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const menuItems = [
  { name: '首页', id: 'home', icon: Home },
  { name: '开发者工具', id: 'dev-tools', icon: Code2 },
  { name: '文本与数据', id: 'text-tools', icon: Type },
  { name: '图形与设计', id: 'image-tools', icon: ImageIcon },
  { name: '生活与效率', id: 'life-tools', icon: Clock },
]

const mainContent = ref<HTMLElement | null>(null)

const handleMenuClick = async (id: string) => {
  isSidebarOpen.value = false
  activeSection.value = id
  
  if (route.path !== '/') {
    await router.push('/')
    await nextTick()
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToAnchor(id)))
  } else {
    scrollToAnchor(id)
  }
}

const scrollToAnchor = (id: string) => {
  if (!mainContent.value) return
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'

  if (id === 'home') {
    mainContent.value.scrollTo({ top: 0, behavior })
    return
  }
  
  const element = document.getElementById(id)
  if (element) {
    const headerHeight = 80
    const padding = 24
    const elementPosition = element.getBoundingClientRect().top
    const containerPosition = mainContent.value.getBoundingClientRect().top
    const offsetPosition = elementPosition - containerPosition + mainContent.value.scrollTop - headerHeight - padding

    mainContent.value.scrollTo({
      top: offsetPosition,
      behavior
    })
  }
}
</script>

<template>
  <div class="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden transition-colors duration-300">
    <CommandPalette ref="commandPaletteRef" @select-category="handleMenuClick" />

    <SidebarNav
      :is-open="isSidebarOpen"
      :active-section="activeSection"
      :menu-items="menuItems"
      @toggle="toggleSidebar"
      @select="handleMenuClick"
    />

    <div ref="mainContent" class="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-gray-900/50 h-full overflow-y-auto scroll-smooth overscroll-contain">
      <HeaderBar
        :is-dark="isDark"
        :toggle-dark="toggleDark"
        :open-search="openSearch"
        @toggle-sidebar="toggleSidebar"
      />

      <main class="flex-1 p-4 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

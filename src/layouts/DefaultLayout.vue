<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toolsData } from '@/data/tools'
import { 
  Menu, 
  X, 
  Home, 
  Code2, 
  Type, 
  Image as ImageIcon, 
  Clock,
  Search,
  Github,
  Sun,
  ChevronRight
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const isSidebarOpen = ref(false)
const activeSection = ref('home')
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// Flatten tools for search
const allTools = computed(() => {
  return toolsData.flatMap(category => 
    category.tools.map(tool => ({
      ...tool,
      category: category.title,
      categoryId: category.id
    }))
  )
})

const filteredTools = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return allTools.value.filter(tool => 
    tool.name.toLowerCase().includes(query) || 
    tool.desc.toLowerCase().includes(query) ||
    tool.category.toLowerCase().includes(query)
  )
})

const openSearch = () => {
  isSearchOpen.value = true
  setTimeout(() => {
    searchInput.value?.focus()
  }, 100)
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
}

const handleSearchSelect = (tool: any) => {
  closeSearch()
  
  // If the tool is developed and has a path, navigate to it
  if (tool.status === '已开发' && tool.path) {
    router.push(tool.path)
    return
  }
  
  // Otherwise scroll to the category on the home page
  handleMenuClick(tool.categoryId)
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
  if (e.key === 'Escape' && isSearchOpen.value) {
    closeSearch()
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
  { name: '文本处理', id: 'text-tools', icon: Type },
  { name: '图片工具', id: 'image-tools', icon: ImageIcon },
  { name: '生活效率', id: 'life-tools', icon: Clock },
]

const handleMenuClick = async (id: string) => {
  isSidebarOpen.value = false
  activeSection.value = id
  
  if (route.path !== '/') {
    await router.push('/')
    // Wait for DOM update
    setTimeout(() => {
      scrollToAnchor(id)
    }, 100)
  } else {
    scrollToAnchor(id)
  }
}

const scrollToAnchor = (id: string) => {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- Command Palette Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="isSearchOpen" 
        class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" @click="closeSearch"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <!-- Search Header -->
          <div class="flex items-center px-4 py-4 border-b border-gray-100">
            <Search class="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search tools..."
              class="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400 text-gray-900"
            >
            <button 
              @click="closeSearch"
              class="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">ESC</kbd>
            </button>
          </div>

          <!-- Search Results -->
          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="!searchQuery" class="text-center py-12 text-gray-500">
              <p class="text-sm">Type to search for tools...</p>
            </div>
            
            <div v-else-if="filteredTools.length === 0" class="text-center py-12 text-gray-500">
              <p class="text-sm">No tools found for "{{ searchQuery }}"</p>
            </div>

            <div v-else class="space-y-1">
              <button
                v-for="tool in filteredTools"
                :key="tool.name"
                @click="handleSearchSelect(tool)"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 group transition-colors text-left"
              >
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                  <component :is="tool.icon" class="w-5 h-5" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ tool.name }}</span>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-500">{{ tool.category }}</span>
                  </div>
                  <p class="text-sm text-gray-500 line-clamp-1">{{ tool.desc }}</p>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
              </button>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-100 flex justify-between">
            <span>{{ filteredTools.length }} results found</span>
            <div class="flex gap-3">
              <span class="flex items-center gap-1"><kbd class="font-sans">↑↓</kbd> to navigate</span>
              <span class="flex items-center gap-1"><kbd class="font-sans">↵</kbd> to select</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] h-full',
        'lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div class="h-20 flex items-center px-8">
          <span class="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Code2 class="w-6 h-6" />
            </div>
            DevTools
          </span>
          <button 
            class="ml-auto lg:hidden text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            @click="toggleSidebar"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-4">
            Menu
          </div>
          <a
            v-for="item in menuItems"
            :key="item.id"
            href="#"
            class="group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="[
              activeSection === item.id 
                ? 'bg-blue-50/80 text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
            @click.prevent="handleMenuClick(item.id)"
          >
            <div 
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full transition-all duration-200"
              :class="activeSection === item.id ? 'opacity-100' : 'opacity-0'"
            ></div>
            <component 
              :is="item.icon" 
              class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
              :class="activeSection === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'"
            />
            {{ item.name }}
          </a>
        </nav>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100">
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-xl shadow-gray-900/10 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code2 class="w-12 h-12 rotate-12" />
            </div>
            <h4 class="font-bold mb-1 relative z-10">Pro Version</h4>
            <p class="text-xs text-gray-300 mb-3 relative z-10">Get access to all tools</p>
            <button class="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors border border-white/10 relative z-10">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 bg-gray-50/50 h-full overflow-y-auto scroll-smooth">
      <!-- Header -->
      <header class="sticky top-0 z-20 h-20 flex items-center px-4 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-200 shrink-0">
        <button 
          class="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl mr-4"
          @click="toggleSidebar"
        >
          <Menu class="w-6 h-6" />
        </button>

        <div class="flex-1 flex items-center gap-6 max-w-2xl">
          <!-- Search Bar -->
          <div 
            class="relative hidden sm:block w-full max-w-md group cursor-pointer"
            @click="openSearch"
          >
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tools..." 
              class="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border-none rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 pointer-events-none"
            >
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                <span class="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 ml-auto">
          <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200">
            <Github class="w-5 h-5" />
          </button>
          <button class="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all duration-200">
            <Sun class="w-5 h-5" />
          </button>
          <div class="h-8 w-px bg-gray-200 mx-1"></div>
          <button class="flex items-center gap-2 p-1 pl-2 pr-1 hover:bg-gray-100 rounded-full border border-gray-200/50 transition-all duration-200 group">
            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">John Doe</span>
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
              JD
            </div>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

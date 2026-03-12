<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toolsData } from '@/data/tools'
import { Search, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'selectCategory', id: string): void
}>()

const router = useRouter()
const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

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

const open = () => {
  isOpen.value = true
  setTimeout(() => {
    searchInput.value?.focus()
  }, 100)
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const handleSearchSelect = (tool: any) => {
  close()
  if (tool.status === '已开发' && tool.path) {
    router.push(tool.path)
    return
  }
  emit('selectCategory', tool.categoryId)
}

defineExpose({ open, close })
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
    >
      <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" @click="close"></div>

      <div class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div class="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <Search class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search tools..."
            class="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400 text-gray-900 dark:text-gray-100"
          >
          <button
            @click="close"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">ESC</kbd>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="!searchQuery" class="text-center py-12 text-gray-500 dark:text-gray-400">
            <p class="text-sm">Type to search for tools...</p>
          </div>

          <div v-else-if="filteredTools.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
            <p class="text-sm">No tools found for "{{ searchQuery }}"</p>
          </div>

          <div v-else class="space-y-1">
            <button
              v-for="tool in filteredTools"
              :key="tool.name"
              @click="handleSearchSelect(tool)"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors text-left"
            >
              <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                <component :is="tool.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ tool.name }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ tool.category }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{{ tool.desc }}</p>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 flex justify-between">
          <span>{{ filteredTools.length }} results found</span>
          <div class="flex gap-3">
            <span class="flex items-center gap-1"><kbd class="font-sans">↑↓</kbd> to navigate</span>
            <span class="flex items-center gap-1"><kbd class="font-sans">↵</kbd> to select</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Trash2, CheckCircle2, Circle, X } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'

interface Todo {
  id: string
  content: string
  completed: boolean
  createdAt: number
}

const todos = useStorage<Todo[]>('tools-todo-list', [])
const inputValue = ref('')
const filter = ref<'all' | 'active' | 'completed'>('all')

const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(t => !t.completed).sort((a, b) => b.createdAt - a.createdAt)
    case 'completed':
      return todos.value.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt)
    default:
      return todos.value.sort((a, b) => b.createdAt - a.createdAt)
  }
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  const active = total - completed
  return { total, completed, active }
})

const addTodo = () => {
  const content = inputValue.value.trim()
  if (!content) return

  todos.value.unshift({
    id: crypto.randomUUID(),
    content,
    completed: false,
    createdAt: Date.now()
  })
  inputValue.value = ''
}

const toggleTodo = (todo: Todo) => {
  todo.completed = !todo.completed
}

const removeTodo = (id: string) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

const clearCompleted = () => {
  todos.value = todos.value.filter(t => !t.completed)
}

// Focus input on mount
const inputRef = ref<HTMLInputElement | null>(null)
onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="max-w-3xl mx-auto h-[calc(100vh-6rem)] flex flex-col gap-8 p-4 md:p-8">
    
    <!-- Header Card -->
    <div class="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      
      <div class="relative z-10">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">待办清单</h1>
        <p class="text-gray-500 dark:text-gray-400">记录每一件小事，达成每一个目标。</p>
        
        <div class="mt-8 flex gap-4">
          <div class="flex-1 relative group">
            <input
              ref="inputRef"
              v-model="inputValue"
              @keyup.enter="addTodo"
              type="text"
              placeholder="添加一个新的任务..."
              class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-indigo-500/50 rounded-2xl outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-inner group-hover:bg-white dark:group-hover:bg-gray-900"
            />
            <button 
              @click="addTodo"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!inputValue.trim()"
            >
              <Plus class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
      
      <!-- List Area -->
      <div class="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/5 flex flex-col overflow-hidden">
        
        <!-- Filters -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700/50">
          <div class="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl">
            <button
              v-for="f in ['all', 'active', 'completed']"
              :key="f"
              @click="filter = f as any"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
              :class="filter === f 
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
            >
              {{ f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成' }}
            </button>
          </div>

          <button 
            v-if="stats.completed > 0"
            @click="clearCompleted"
            class="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
          >
            <Trash2 class="w-4 h-4" />
            清除已完成
          </button>
        </div>

        <!-- Scrollable List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <TransitionGroup name="list">
            <div
              v-for="todo in filteredTodos"
              :key="todo.id"
              class="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
              :class="{ 'opacity-50': todo.completed }"
            >
              <button 
                @click="toggleTodo(todo)"
                class="flex-shrink-0 transition-transform active:scale-90 text-gray-400 hover:text-indigo-500"
                :class="{ 'text-green-500 hover:text-green-600': todo.completed }"
              >
                <CheckCircle2 v-if="todo.completed" class="w-6 h-6 fill-current bg-white dark:bg-gray-800 rounded-full" />
                <Circle v-else class="w-6 h-6" />
              </button>
              
              <span 
                class="flex-1 text-base font-medium transition-all break-all"
                :class="todo.completed ? 'text-gray-400 line-through decoration-2 decoration-gray-200' : 'text-gray-700 dark:text-gray-200'"
              >
                {{ todo.content }}
              </span>

              <button 
                @click="removeTodo(todo.id)"
                class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </TransitionGroup>

          <div v-if="filteredTodos.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 py-12">
            <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <ListTodo class="w-8 h-8 opacity-50" />
            </div>
            <p v-if="filter === 'all'">还没有待办事项，开始添加吧！</p>
            <p v-else-if="filter === 'active'">没有进行中的任务</p>
            <p v-else>还没有完成的任务</p>
          </div>
        </div>
      </div>

      <!-- Stats Sidebar (Desktop) -->
      <div class="hidden md:flex flex-col gap-4 w-64">
        <div class="bg-indigo-500 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
          <div class="relative z-10">
            <div class="text-indigo-100 text-sm font-medium mb-1">剩余任务</div>
            <div class="text-4xl font-bold">{{ stats.active }}</div>
          </div>
        </div>

        <div class="bg-emerald-500 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
          <div class="relative z-10">
            <div class="text-emerald-100 text-sm font-medium mb-1">已完成</div>
            <div class="text-4xl font-bold">{{ stats.completed }}</div>
          </div>
        </div>

        <div class="flex-1 bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <div class="relative w-32 h-32 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="transparent" class="text-gray-100 dark:text-gray-700" />
              <circle 
                cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="transparent" 
                class="text-indigo-500 transition-all duration-1000 ease-out"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 56"
                :stroke-dashoffset="2 * Math.PI * 56 * (1 - (stats.total ? stats.completed / stats.total : 0))"
              />
            </svg>
            <div class="absolute text-xl font-bold text-gray-700 dark:text-gray-200">
              {{ stats.total ? Math.round((stats.completed / stats.total) * 100) : 0 }}%
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-500 font-medium">完成进度</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
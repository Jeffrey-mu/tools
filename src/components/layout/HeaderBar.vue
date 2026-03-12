<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import imageCompression from 'browser-image-compression'
import { Menu, Github, Sun, Moon, User, Camera, Trash2, X, Search } from 'lucide-vue-next'

const props = defineProps<{
  isDark: boolean
  toggleDark: () => void
  openSearch: () => void
}>()

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
}>()

const isProfileOpen = ref(false)
const profileButtonRef = ref<HTMLElement | null>(null)
const profileMenuRef = ref<HTMLElement | null>(null)

const profile = useStorage('tools-user-profile', {
  nickname: '',
  avatarDataUrl: ''
})

const displayName = computed(() => profile.value.nickname.trim() || '游客')
const initials = computed(() => {
  const name = displayName.value.replace(/\s+/g, '')
  const chars = Array.from(name)
  return chars.slice(0, 2).join('').toUpperCase()
})

const closeProfile = () => {
  isProfileOpen.value = false
}

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const resetProfile = () => {
  profile.value = { nickname: '', avatarDataUrl: '' }
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })

const handleAvatarSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !file.type.startsWith('image/')) return

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 256,
      useWebWorker: true,
      initialQuality: 0.85
    })

    profile.value.avatarDataUrl = await fileToDataUrl(compressed)
  } catch {
    return
  }
}

const removeAvatar = () => {
  profile.value.avatarDataUrl = ''
}

const handleGlobalPointerDown = (e: PointerEvent) => {
  if (!isProfileOpen.value) return
  const target = e.target as Node
  if (profileMenuRef.value?.contains(target)) return
  if (profileButtonRef.value?.contains(target)) return
  closeProfile()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeProfile()
}

onMounted(() => {
  window.addEventListener('pointerdown', handleGlobalPointerDown)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', handleGlobalPointerDown)
  window.removeEventListener('keydown', handleKeydown)
})

const openSearchFromHeader = () => {
  closeProfile()
  props.openSearch()
}
</script>

<template>
  <header class="sticky top-0 z-20 h-20 flex items-center px-4 lg:px-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-200 shrink-0">
    <button
      class="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl mr-4 transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
      @click="emit('toggleSidebar')"
      aria-label="打开侧边栏"
    >
      <Menu class="w-6 h-6" />
    </button>

    <div class="flex-1 flex items-center justify-center">
      <button
        type="button"
        class="hidden sm:flex w-full max-w-md items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 text-left border border-transparent hover:border-gray-200/80 dark:hover:border-gray-700/70 hover:bg-gray-100 dark:hover:bg-gray-800 transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        @click="openSearchFromHeader"
        aria-label="打开搜索"
      >
        <Search class="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <span class="flex-1 text-sm text-gray-500 dark:text-gray-400">搜索工具…</span>
        <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">
          <span class="text-xs">⌘</span>K
        </kbd>
      </button>
    </div>

    <div class="flex items-center gap-3 ml-auto">
      <a
        href="https://github.com/Jeffrey-mu/tools"
        target="_blank"
        rel="noopener noreferrer"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-[background-color,transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 flex items-center justify-center"
        aria-label="打开 GitHub"
      >
        <Github class="w-5 h-5" />
      </a>
      <button
        @click="props.toggleDark()"
        class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:text-yellow-300 dark:hover:bg-gray-800 rounded-xl transition-[background-color,transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        aria-label="切换主题"
      >
        <Sun v-if="!props.isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>
      <div class="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

      <div class="relative">
        <button
          ref="profileButtonRef"
          class="flex items-center gap-2 p-1 pl-2 pr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full border border-gray-200/50 dark:border-gray-700/60 transition-[background-color,transform,border-color] duration-150 ease-out active:scale-[0.99] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          @click="toggleProfile"
          aria-label="打开个人信息"
        >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white max-w-[9rem] truncate">{{ displayName }}</span>
          <div class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
            <img v-if="profile.avatarDataUrl" :src="profile.avatarDataUrl" class="w-full h-full object-cover" />
            <span v-else>{{ initials }}</span>
          </div>
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-1 scale-95"
        >
          <div
            v-if="isProfileOpen"
            ref="profileMenuRef"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-xl overflow-hidden z-30"
          >
            <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <User class="w-4 h-4 text-blue-500" />
                个人信息
              </div>
              <button
                class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="closeProfile"
                aria-label="关闭个人信息"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-4 space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                  <img v-if="profile.avatarDataUrl" :src="profile.avatarDataUrl" class="w-full h-full object-cover" />
                  <span v-else>{{ initials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">头像</div>
                  <div class="flex items-center gap-2">
                    <label class="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl cursor-pointer transition-colors text-sm font-medium">
                      <Camera class="w-4 h-4" />
                      更换
                      <input type="file" accept="image/*" class="hidden" @change="handleAvatarSelect" />
                    </label>
                    <button
                      class="inline-flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-[background-color,transform] duration-150 ease-out active:scale-[0.99] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="removeAvatar"
                      :disabled="!profile.avatarDataUrl"
                      aria-label="移除头像"
                    >
                      <Trash2 class="w-4 h-4" />
                      移除
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">昵称</div>
                <input
                  v-model="profile.nickname"
                  type="text"
                  placeholder="输入昵称"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
                <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">保存在本地浏览器</div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-950/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
              <button
                class="px-3 py-2 rounded-xl text-sm font-medium bg-gray-200/70 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-gray-700 transition-colors"
                @click="resetProfile"
              >
                重置
              </button>
              <button
                class="px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                @click="closeProfile"
              >
                完成
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

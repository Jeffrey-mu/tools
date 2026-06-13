import { onBeforeUnmount, ref } from 'vue'
import { useClipboard } from '@vueuse/core'

type CopyState = 'idle' | 'success' | 'error'

export const useCopyFeedback = (resetDelay = 2000) => {
  const { copy, isSupported } = useClipboard()
  const copiedKey = ref<string | null>(null)
  const copyState = ref<CopyState>('idle')
  let resetTimer: ReturnType<typeof setTimeout> | null = null

  const clearResetTimer = () => {
    if (resetTimer) {
      clearTimeout(resetTimer)
      resetTimer = null
    }
  }

  const reset = () => {
    clearResetTimer()
    copiedKey.value = null
    copyState.value = 'idle'
  }

  const scheduleReset = () => {
    clearResetTimer()
    resetTimer = setTimeout(() => {
      copiedKey.value = null
      copyState.value = 'idle'
      resetTimer = null
    }, resetDelay)
  }

  const copyWithFeedback = async (text: string, key = 'default') => {
    if (!text) {
      reset()
      return false
    }

    try {
      if (!isSupported.value) {
        throw new Error('clipboard-not-supported')
      }

      await copy(text)
      copiedKey.value = key
      copyState.value = 'success'
      scheduleReset()
      return true
    } catch {
      copiedKey.value = key
      copyState.value = 'error'
      scheduleReset()
      return false
    }
  }

  const isCopied = (key = 'default') =>
    copyState.value === 'success' && copiedKey.value === key

  const isCopyError = (key = 'default') =>
    copyState.value === 'error' && copiedKey.value === key

  onBeforeUnmount(() => {
    clearResetTimer()
  })

  return {
    copyWithFeedback,
    copiedKey,
    copyState,
    isCopied,
    isCopyError,
    resetCopyFeedback: reset,
  }
}

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  Video,
  Mic,
  Volume2,
  Play,
  Pause,
  Square,
  Download,
  Trash2,
  Copy,
  Check
} from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

type RecorderStatus = 'idle' | 'recording' | 'paused' | 'stopped'

const includeMicrophone = ref(true)
const includeSystemAudio = ref(true)

const status = ref<RecorderStatus>('idle')
const errorMessage = ref('')
const infoMessage = ref('')

const previewVideoEl = ref<HTMLVideoElement | null>(null)
const playbackVideoEl = ref<HTMLVideoElement | null>(null)

const displayStream = ref<MediaStream | null>(null)
const microphoneStream = ref<MediaStream | null>(null)
const recordStream = ref<MediaStream | null>(null)
const audioContext = ref<AudioContext | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedChunks = ref<BlobPart[]>([])
const recordedBlob = ref<Blob | null>(null)
const recordedUrl = ref('')
const recordedMimeType = ref('video/webm')

const startedAt = ref<number | null>(null)
const elapsedMs = ref(0)
const timerId = ref<number | null>(null)

const { copy, copied } = useClipboard()

const isSupported = computed(() => {
  const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator.mediaDevices
  const hasDisplay = hasMediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function'
  const hasRecorder = typeof MediaRecorder !== 'undefined'
  return hasDisplay && hasRecorder
})

const canStart = computed(() => isSupported.value && status.value === 'idle')
const canPause = computed(() => status.value === 'recording' && !!mediaRecorder.value)
const canResume = computed(() => status.value === 'paused' && !!mediaRecorder.value)
const canStop = computed(() => (status.value === 'recording' || status.value === 'paused') && !!mediaRecorder.value)
const hasRecording = computed(() => !!recordedUrl.value)

const systemAudioAvailable = computed(() => {
  const stream = displayStream.value
  if (!stream) return false
  return stream.getAudioTracks().length > 0
})

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  if (hours > 0) return `${hours}:${mm}:${ss}`
  return `${mm}:${ss}`
}

const elapsedText = computed(() => formatTime(elapsedMs.value))

const resetMessages = () => {
  errorMessage.value = ''
  infoMessage.value = ''
}

const setError = (message: string) => {
  errorMessage.value = message
  infoMessage.value = ''
}

const pickMimeType = () => {
  const preferred = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ]

  for (const type of preferred) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }

  return ''
}

const stopTracks = (stream: MediaStream | null) => {
  if (!stream) return
  stream.getTracks().forEach(t => t.stop())
}

const clearTimer = () => {
  if (timerId.value != null) {
    window.clearInterval(timerId.value)
    timerId.value = null
  }
}

const startTimer = () => {
  clearTimer()
  startedAt.value = Date.now()
  elapsedMs.value = 0
  timerId.value = window.setInterval(() => {
    if (!startedAt.value) return
    elapsedMs.value = Date.now() - startedAt.value
  }, 200)
}

const finalizeTimer = () => {
  clearTimer()
  startedAt.value = null
}

const cleanupRecordingArtifacts = () => {
  if (recordedUrl.value) {
    URL.revokeObjectURL(recordedUrl.value)
  }
  recordedUrl.value = ''
  recordedBlob.value = null
  recordedChunks.value = []
}

const cleanupStreams = async () => {
  stopTracks(displayStream.value)
  stopTracks(microphoneStream.value)
  stopTracks(recordStream.value)

  displayStream.value = null
  microphoneStream.value = null
  recordStream.value = null

  if (audioContext.value) {
    try {
      await audioContext.value.close()
    } catch {
    }
    audioContext.value = null
  }

  if (previewVideoEl.value) {
    previewVideoEl.value.srcObject = null
  }
}

const mixAudioTracks = (streams: MediaStream[]) => {
  const audioStreams = streams.filter(s => s.getAudioTracks().length > 0)
  if (audioStreams.length === 0) return null
  if (audioStreams.length === 1) return audioStreams[0].getAudioTracks()[0] ?? null

  const ctx = new AudioContext()
  audioContext.value = ctx

  const destination = ctx.createMediaStreamDestination()
  for (const stream of audioStreams) {
    const source = ctx.createMediaStreamSource(stream)
    source.connect(destination)
  }

  return destination.stream.getAudioTracks()[0] ?? null
}

const createFileName = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `screen-recording-${yyyy}${mm}${dd}-${hh}${mi}${ss}.webm`
}

const startRecording = async () => {
  resetMessages()
  cleanupRecordingArtifacts()

  if (!isSupported.value) {
    setError('当前浏览器不支持录屏（需要 getDisplayMedia + MediaRecorder）')
    return
  }

  try {
    const display = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 30
      },
      audio: includeSystemAudio.value
    })
    displayStream.value = display

    const videoTrack = display.getVideoTracks()[0]
    if (!videoTrack) {
      setError('未获取到屏幕视频轨道')
      await cleanupStreams()
      return
    }

    if (previewVideoEl.value) {
      previewVideoEl.value.srcObject = display
      try {
        await previewVideoEl.value.play()
      } catch {
      }
    }

    let mic: MediaStream | null = null
    if (includeMicrophone.value) {
      mic = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      microphoneStream.value = mic
    }

    const audioTrack = mixAudioTracks([display, mic].filter(Boolean) as MediaStream[])
    const combinedStream = new MediaStream([videoTrack, ...(audioTrack ? [audioTrack] : [])])
    recordStream.value = combinedStream

    const mimeType = pickMimeType()
    recordedMimeType.value = mimeType || 'video/webm'

    const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined)
    mediaRecorder.value = recorder
    recordedChunks.value = []

    recorder.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) recordedChunks.value.push(ev.data)
    }

    recorder.onerror = () => {
      setError('录制过程中发生错误')
    }

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: recordedMimeType.value })
      recordedBlob.value = blob
      recordedUrl.value = URL.createObjectURL(blob)
      status.value = 'stopped'
      finalizeTimer()

      if (playbackVideoEl.value) {
        playbackVideoEl.value.src = recordedUrl.value
        playbackVideoEl.value.load()
      }
    }

    videoTrack.addEventListener('ended', () => {
      if (status.value === 'recording' || status.value === 'paused') stopRecording()
    })

    recorder.start(250)
    status.value = 'recording'

    if (includeSystemAudio.value && !systemAudioAvailable.value) {
      infoMessage.value = '提示：本次共享未包含“扬声器/系统音频”，请在浏览器弹窗中勾选“共享音频/标签页音频”'
    }

    startTimer()
  } catch (e: any) {
    const name = String(e?.name || '')
    if (name === 'NotAllowedError') {
      setError('未授权录屏或麦克风权限')
    } else if (name === 'NotFoundError') {
      setError('未找到可用的捕获设备或音频输入')
    } else {
      setError('启动录屏失败')
    }
    await cleanupStreams()
    status.value = 'idle'
  }
}

const pauseRecording = () => {
  resetMessages()
  const recorder = mediaRecorder.value
  if (!recorder) return
  if (recorder.state !== 'recording') return
  recorder.pause()
  status.value = 'paused'
  clearTimer()
}

const resumeRecording = () => {
  resetMessages()
  const recorder = mediaRecorder.value
  if (!recorder) return
  if (recorder.state !== 'paused') return
  recorder.resume()
  status.value = 'recording'
  startedAt.value = Date.now() - elapsedMs.value
  clearTimer()
  timerId.value = window.setInterval(() => {
    if (!startedAt.value) return
    elapsedMs.value = Date.now() - startedAt.value
  }, 200)
}

const stopRecording = async () => {
  resetMessages()
  const recorder = mediaRecorder.value
  if (!recorder) return

  try {
    if (recorder.state !== 'inactive') recorder.stop()
  } catch {
  }

  mediaRecorder.value = null
  await cleanupStreams()
}

const downloadRecording = () => {
  if (!recordedBlob.value || !recordedUrl.value) return
  const a = document.createElement('a')
  a.href = recordedUrl.value
  a.download = createFileName()
  a.click()
}

const clearRecording = async () => {
  resetMessages()
  cleanupRecordingArtifacts()
  await cleanupStreams()
  mediaRecorder.value = null
  status.value = 'idle'
  finalizeTimer()
}

const copyUrl = async () => {
  if (!recordedUrl.value) return
  await copy(recordedUrl.value)
}

onBeforeUnmount(async () => {
  try {
    if (status.value === 'recording' || status.value === 'paused') {
      await stopRecording()
    }
  } finally {
    cleanupRecordingArtifacts()
    await cleanupStreams()
    finalizeTimer()
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
        <Video class="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">录屏</h1>
        <p class="text-gray-500 dark:text-gray-400">
          支持屏幕/窗口/浏览器标签页录制，可选麦克风与系统音频
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div
          class="px-3 py-1.5 rounded-lg text-sm font-medium border"
          :class="status === 'recording'
            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40'
            : status === 'paused'
              ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/40'
              : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'"
        >
          {{ status === 'idle' ? '未开始' : status === 'recording' ? '录制中' : status === 'paused' ? '已暂停' : '已完成' }}
          <span v-if="status === 'recording' || status === 'paused'" class="ml-2 font-mono">{{ elapsedText }}</span>
        </div>
      </div>
    </div>

    <div v-if="!isSupported" class="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
      当前浏览器不支持录屏：需要 getDisplayMedia 与 MediaRecorder。
    </div>

    <div v-if="errorMessage" class="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <div v-if="infoMessage" class="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
      {{ infoMessage }}
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="includeMicrophone"
              :disabled="status !== 'idle'"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
            >
            <span class="flex items-center gap-2">
              <Mic class="w-4 h-4" />
              麦克风
            </span>
          </label>

          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="includeSystemAudio"
              :disabled="status !== 'idle'"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
            >
            <span class="flex items-center gap-2">
              <Volume2 class="w-4 h-4" />
              扬声器/系统音频
            </span>
          </label>

          <span v-if="includeSystemAudio && displayStream && !systemAudioAvailable" class="text-xs text-gray-500 dark:text-gray-400">
            共享弹窗里需要选择“共享音频/标签页音频”
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="startRecording"
            :disabled="!canStart"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 rounded-lg transition-colors shadow-sm shadow-blue-200/60"
          >
            <span class="inline-flex items-center gap-2">
              <Play class="w-4 h-4" />
              开始
            </span>
          </button>

          <button
            v-if="canPause"
            @click="pauseRecording"
            class="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 rounded-lg transition-colors border border-yellow-200 dark:border-yellow-800/40"
          >
            <span class="inline-flex items-center gap-2">
              <Pause class="w-4 h-4" />
              暂停
            </span>
          </button>

          <button
            v-if="canResume"
            @click="resumeRecording"
            class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/40"
          >
            <span class="inline-flex items-center gap-2">
              <Play class="w-4 h-4" />
              继续
            </span>
          </button>

          <button
            v-if="canStop"
            @click="stopRecording"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-200/60"
          >
            <span class="inline-flex items-center gap-2">
              <Square class="w-4 h-4" />
              停止
            </span>
          </button>

          <button
            v-if="status !== 'idle'"
            @click="clearRecording"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="清理"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-gray-900 dark:text-white">实时预览</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            仅预览共享画面
          </span>
        </div>
        <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/90">
          <video ref="previewVideoEl" class="w-full aspect-video" playsinline muted></video>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-bold text-gray-900 dark:text-white">录制结果</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="hasRecording"
              @click="downloadRecording"
              class="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/40"
            >
              <span class="inline-flex items-center gap-2">
                <Download class="w-4 h-4" />
                下载
              </span>
            </button>
            <button
              v-if="hasRecording"
              @click="copyUrl"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-colors border"
              :class="copied
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800/40'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-900/30'"
            >
              <span class="inline-flex items-center gap-2">
                <component :is="copied ? Check : Copy" class="w-4 h-4" />
                {{ copied ? '已复制' : '复制链接' }}
              </span>
            </button>
          </div>
        </div>

        <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/90">
          <video ref="playbackVideoEl" class="w-full aspect-video" playsinline controls></video>
        </div>

        <div v-if="hasRecording" class="text-xs text-gray-500 dark:text-gray-400 break-all">
          {{ recordedUrl }}
        </div>
        <div v-else class="text-sm text-gray-400">
          暂无录制文件
        </div>
      </div>
    </div>
  </div>
</template>

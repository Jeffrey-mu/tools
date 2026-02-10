<script setup lang="ts">
import { ref, computed } from 'vue'
import { Minimize, Upload, Download, Image as ImageIcon, Trash2 } from 'lucide-vue-next'
import imageCompression from 'browser-image-compression'

interface CompressedImage {
  id: string
  originalFile: File
  compressedFile: File | null
  originalUrl: string
  compressedUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
  error?: string
}

const images = ref<CompressedImage[]>([])
const isDragging = ref(false)

// Options
const quality = ref(0.8)
const maxWidth = ref(1920)
const maxHeight = ref(1080)

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) processFiles(Array.from(files))
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(Array.from(input.files))
  input.value = '' // Reset input
}

const processFiles = async (files: File[]) => {
  const newImages = files
    .filter(file => file.type.startsWith('image/'))
    .map(file => ({
      id: Math.random().toString(36).substring(7),
      originalFile: file,
      compressedFile: null,
      originalUrl: URL.createObjectURL(file),
      compressedUrl: '',
      status: 'pending' as const
    }))
  
  images.value.push(...newImages)
  
  // Process queue
  for (const img of newImages) {
    await compressImage(img)
  }
}

const compressImage = async (img: CompressedImage) => {
  img.status = 'processing'
  
  try {
    const options = {
      maxSizeMB: 1, // Start with a reasonable default, though quality controls actual compression
      maxWidthOrHeight: Math.max(maxWidth.value, maxHeight.value),
      useWebWorker: true,
      initialQuality: quality.value
    }
    
    const compressedFile = await imageCompression(img.originalFile, options)
    
    img.compressedFile = compressedFile
    img.compressedUrl = URL.createObjectURL(compressedFile)
    img.status = 'done'
  } catch (error) {
    console.error(error)
    img.status = 'error'
    img.error = 'Compression failed'
  }
}

const removeImage = (id: string) => {
  const index = images.value.findIndex(img => img.id === id)
  if (index !== -1) {
    const img = images.value[index]
    URL.revokeObjectURL(img.originalUrl)
    if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
    images.value.splice(index, 1)
  }
}

const downloadImage = (img: CompressedImage) => {
  if (!img.compressedFile) return
  const link = document.createElement('a')
  link.href = img.compressedUrl
  link.download = `compressed-${img.originalFile.name}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const clearAll = () => {
  images.value.forEach(img => {
    URL.revokeObjectURL(img.originalUrl)
    if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
  })
  images.value = []
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <Minimize class="w-5 h-5 text-purple-500" />
        图片压缩
      </div>
      
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span>质量: {{ Math.round(quality * 100) }}%</span>
          <input 
            v-model.number="quality" 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.1"
            class="w-24 accent-purple-600"
          >
        </div>
        
        <button 
          v-if="images.length > 0"
          @click="clearAll"
          class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 ml-auto sm:ml-0"
        >
          <Trash2 class="w-4 h-4" />
          清空
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
      <!-- Upload Area / List -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        <!-- Drop Zone (when empty) -->
        <div 
          v-if="images.length === 0"
          class="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl m-4 transition-colors"
          :class="{ 'border-purple-500 bg-purple-50': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
            <Upload class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">拖拽图片到这里</h3>
          <p class="text-gray-500 mb-6">支持 JPG, PNG, WebP</p>
          
          <label class="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer transition-colors font-medium flex items-center gap-2">
            <ImageIcon class="w-4 h-4" />
            选择图片
            <input type="file" multiple accept="image/*" class="hidden" @change="handleFileSelect">
          </label>
        </div>

        <!-- Image List -->
        <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Add More Button -->
          <div class="flex justify-end mb-2">
            <label class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm font-medium flex items-center gap-2">
              <Upload class="w-4 h-4" />
              添加更多
              <input type="file" multiple accept="image/*" class="hidden" @change="handleFileSelect">
            </label>
          </div>

          <div 
            v-for="img in images" 
            :key="img.id"
            class="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center border border-gray-200"
          >
            <!-- Preview -->
            <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
              <img :src="img.originalUrl" class="w-full h-full object-cover" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 w-full text-center sm:text-left">
              <div class="font-medium text-gray-900 truncate mb-1">{{ img.originalFile.name }}</div>
              <div class="flex items-center justify-center sm:justify-start gap-4 text-sm">
                <div class="text-gray-500">
                  原始: <span class="font-mono text-gray-700">{{ formatSize(img.originalFile.size) }}</span>
                </div>
                <div v-if="img.status === 'done'" class="text-gray-500">
                  压缩后: <span class="font-mono text-green-600 font-bold">{{ formatSize(img.compressedFile?.size || 0) }}</span>
                </div>
                <div v-if="img.status === 'done'" class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  -{{ Math.round((1 - (img.compressedFile?.size || 0) / img.originalFile.size) * 100) }}%
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 w-full sm:w-auto justify-center">
              <div v-if="img.status === 'processing'" class="text-purple-600 text-sm font-medium animate-pulse">
                处理中...
              </div>
              <div v-else-if="img.status === 'error'" class="text-red-500 text-sm font-medium">
                失败
              </div>
              <button 
                v-if="img.status === 'done'"
                @click="downloadImage(img)"
                class="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                title="下载"
              >
                <Download class="w-5 h-5" />
              </button>
              <button 
                @click="removeImage(img.id)"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="移除"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

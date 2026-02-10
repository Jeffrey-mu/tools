<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Regex, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const regexPattern = ref('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
const testText = ref('Hello world! Contact us at support@example.com or sales@example.co.uk for more info.')
const flags = ref(['g'])

const availableFlags = [
  { value: 'g', label: 'Global (g)', desc: 'Don\'t return after first match' },
  { value: 'i', label: 'Insensitive (i)', desc: 'Case insensitive match' },
  { value: 'm', label: 'Multiline (m)', desc: '^ and $ match start/end of line' },
  { value: 's', label: 'Single line (s)', desc: 'Dot matches newline' },
]

const error = ref('')
const matches = ref<RegExpExecArray[]>([])

const flagString = computed(() => flags.value.join(''))

const highlightedText = computed(() => {
  if (error.value || !regexPattern.value) return escapeHtml(testText.value)
  
  try {
    const re = new RegExp(regexPattern.value, flagString.value)
    let text = testText.value
    
    // If not global, we only highlight the first match
    if (!flags.value.includes('g')) {
      const match = re.exec(text)
      if (match) {
        const before = text.slice(0, match.index)
        const matched = text.slice(match.index, match.index + match[0].length)
        const after = text.slice(match.index + match[0].length)
        return `${escapeHtml(before)}<mark class="bg-yellow-200 text-yellow-800 rounded-sm">${escapeHtml(matched)}</mark>${escapeHtml(after)}`
      }
      return escapeHtml(text)
    }

    // Global match replacement
    // We need to be careful not to replace inside already replaced tags if we did it sequentially,
    // but here we are replacing the original text.
    // However, simple replace with HTML might break if the regex matches HTML characters.
    // Safer approach: Find all matches first, then reconstruction.
    
    const allMatches = Array.from(text.matchAll(re))
    if (allMatches.length === 0) return escapeHtml(text)

    let lastIndex = 0
    let result = ''
    
    for (const match of allMatches) {
      if (match.index === undefined) continue
      
      const before = text.slice(lastIndex, match.index)
      const matched = match[0]
      
      result += escapeHtml(before)
      result += `<mark class="bg-yellow-200 text-yellow-800 rounded-sm border-b-2 border-yellow-400" title="Match ${match.index}">${escapeHtml(matched)}</mark>`
      
      lastIndex = match.index + matched.length
    }
    
    result += escapeHtml(text.slice(lastIndex))
    return result

  } catch (e) {
    return escapeHtml(testText.value)
  }
})

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const runRegex = () => {
  if (!regexPattern.value) {
    matches.value = []
    error.value = ''
    return
  }

  try {
    const re = new RegExp(regexPattern.value, flagString.value)
    // Test if valid
    error.value = ''
    
    if (!testText.value) {
      matches.value = []
      return
    }

    const res: RegExpExecArray[] = []
    if (flags.value.includes('g')) {
      const iter = testText.value.matchAll(re)
      for (const match of iter) {
        res.push(match)
      }
    } else {
      const match = re.exec(testText.value)
      if (match) res.push(match)
    }
    matches.value = res
  } catch (e: any) {
    error.value = e.message
    matches.value = []
  }
}

watch([regexPattern, testText, flags], () => {
  runRegex()
})

// Initial run
runRegex()
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <!-- Regex Input Bar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div class="flex items-center gap-2 text-gray-700 font-medium mb-2">
        <Regex class="w-5 h-5 text-blue-500" />
        正则表达式测试
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative min-w-0">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-400 font-mono text-lg">/</span>
          </div>
          <input
            v-model="regexPattern"
            type="text"
            class="block w-full pl-8 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900"
            :class="{ 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400': error }"
            placeholder="输入正则表达式..."
          >
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-400 font-mono text-lg">/{{ flagString }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <label 
            v-for="flag in availableFlags" 
            :key="flag.value"
            class="flex items-center gap-2 cursor-pointer group relative"
          >
            <input 
              type="checkbox" 
              v-model="flags" 
              :value="flag.value"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="text-sm text-gray-600 font-mono">{{ flag.value }}</span>
            
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {{ flag.desc }}
            </div>
          </label>
        </div>
      </div>
      
      <div v-if="error" class="flex items-center gap-2 text-red-600 text-sm">
        <AlertCircle class="w-4 h-4" />
        {{ error }}
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      <!-- Input Text -->
      <div class="flex flex-col gap-2 h-full min-h-0">
        <label class="text-sm font-medium text-gray-500 px-1">测试文本</label>
        <div class="flex-1 min-h-0 relative border border-gray-200 rounded-xl overflow-hidden bg-white">
          <textarea 
            v-model="testText"
            class="w-full h-full p-4 font-mono text-sm resize-none outline-none focus:bg-gray-50 transition-colors"
            placeholder="输入要测试的文本..."
          ></textarea>
        </div>
      </div>

      <!-- Results -->
      <div class="flex flex-col gap-2 h-full min-h-0">
        <div class="flex items-center justify-between px-1">
          <label class="text-sm font-medium text-gray-500">匹配结果</label>
          <span 
            v-if="!error && matches.length > 0" 
            class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"
          >
            <CheckCircle2 class="w-3 h-3" />
            {{ matches.length }} 处匹配
          </span>
        </div>
        
        <div class="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <!-- Visual Highlight -->
          <div class="h-1/2 border-b border-gray-100 overflow-y-auto p-4 bg-gray-50">
            <div class="font-mono text-sm whitespace-pre-wrap break-all" v-html="highlightedText"></div>
          </div>
          
          <!-- Match Details -->
          <div class="h-1/2 overflow-y-auto p-0 bg-white">
            <div v-if="matches.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
              <span class="text-sm">无匹配结果</span>
            </div>
            <div v-else class="divide-y divide-gray-50">
              <div 
                v-for="(match, idx) in matches" 
                :key="idx"
                class="p-3 hover:bg-blue-50 transition-colors group"
              >
                <div class="flex items-start gap-3">
                  <span class="text-xs font-mono text-gray-400 mt-0.5">#{{ idx + 1 }}</span>
                  <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex items-baseline justify-between">
                      <span class="font-mono text-sm font-bold text-gray-900 bg-yellow-100 px-1 rounded break-all">{{ match[0] }}</span>
                      <span class="text-xs text-gray-400 font-mono shrink-0 ml-2">index: {{ match.index }}</span>
                    </div>
                    
                    <!-- Groups -->
                    <div v-if="match.length > 1" class="pl-2 border-l-2 border-gray-100 space-y-1 mt-1">
                      <div v-for="(group, gIdx) in match.slice(1)" :key="gIdx" class="text-xs flex gap-2">
                        <span class="font-mono text-gray-500 shrink-0">Group {{ gIdx + 1 }}:</span>
                        <span class="font-mono text-gray-800 break-all">{{ group }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

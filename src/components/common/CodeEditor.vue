<script setup lang="ts">
import { computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'

const props = defineProps<{
  modelValue: string
  readonly?: boolean
  placeholder?: string
  height?: string
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const extensions = computed(() => {
  const exts = [basicSetup, json(), EditorView.lineWrapping]
  if (props.theme === 'dark') {
    exts.push(oneDark)
  }
  return exts
})

const handleChange = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div class="code-editor-wrapper border border-gray-200 rounded-xl overflow-hidden bg-white">
    <Codemirror
      :model-value="modelValue"
      :placeholder="placeholder"
      :style="{ height: height || '100%' }"
      :autofocus="!readonly"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      :disabled="readonly"
      @update:model-value="handleChange"
    />
  </div>
</template>

<style>
.code-editor-wrapper .cm-editor {
  height: 100%;
  outline: none;
}
.code-editor-wrapper .cm-scroller {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
}
.code-editor-wrapper .cm-content {
  padding: 16px;
}
.code-editor-wrapper .cm-gutters {
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  color: #9ca3af;
}
</style>

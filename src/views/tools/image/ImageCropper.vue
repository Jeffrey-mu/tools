<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Crop, Upload, RotateCw, RefreshCw, Download, Trash2, ChevronDown } from 'lucide-vue-next'

type Rect = { x: number; y: number; w: number; h: number }
type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

const isDraggingFile = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')

const fileName = ref('')
const fileType = ref('image/png')
const originalSrc = ref<string | null>(null)
const currentSrc = ref<string | null>(null)

const naturalW = ref(0)
const naturalH = ref(0)

const stageEl = ref<HTMLDivElement | null>(null)
const stageW = ref(0)
const stageH = ref(0)

const crop = ref<Rect>({ x: 0, y: 0, w: 0, h: 0 })
const isAdjusting = ref(false)
const activeHandle = ref<Handle | null>(null)
const startPointer = ref({ x: 0, y: 0 })
const startCrop = ref<Rect>({ x: 0, y: 0, w: 0, h: 0 })
const isPanningImage = ref(false)
const isHoveringImage = ref(false)
const startPan = ref({ x: 0, y: 0 })
const pan = ref({ x: 0, y: 0 })
const zoom = ref(1)
const minZoom = 0.2
const maxZoom = 6

const isDark = ref(false)
const updateIsDark = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}
let mo: MutationObserver | null = null

const aspectPreset = ref<'free' | '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '5:4'>('free')
const isAspectMenuOpen = ref(false)
const aspectMenuEl = ref<HTMLDivElement | null>(null)
const aspectRatio = computed<number | null>(() => {
  switch (aspectPreset.value) {
    case '1:1':
      return 1
    case '16:9':
      return 16 / 9
    case '9:16':
      return 9 / 16
    case '4:3':
      return 4 / 3
    case '3:2':
      return 3 / 2
    case '5:4':
      return 5 / 4
    default:
      return null
  }
})
const aspectLabel = computed(() => {
  switch (aspectPreset.value) {
    case 'free':
      return '自由'
    default:
      return aspectPreset.value
  }
})

const createImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = src
  })
}

const updateStageSize = () => {
  if (!stageEl.value) return
  const rect = stageEl.value.getBoundingClientRect()
  stageW.value = rect.width
  stageH.value = rect.height
}

let ro: ResizeObserver | null = null
const onGlobalPointerDown = (e: PointerEvent) => {
  if (!isAspectMenuOpen.value) return
  const el = aspectMenuEl.value
  if (!el) {
    isAspectMenuOpen.value = false
    return
  }
  const target = e.target as Node | null
  if (target && el.contains(target)) return
  isAspectMenuOpen.value = false
}
onMounted(() => {
  updateIsDark()
  updateStageSize()
  if (typeof MutationObserver !== 'undefined') {
    mo = new MutationObserver(() => updateIsDark())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  }
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => updateStageSize())
    if (stageEl.value) ro.observe(stageEl.value)
  } else {
    window.addEventListener('resize', updateStageSize, { passive: true })
  }
  window.addEventListener('pointerdown', onGlobalPointerDown, true)
})

onBeforeUnmount(() => {
  if (ro && stageEl.value) ro.unobserve(stageEl.value)
  ro = null
  if (mo) mo.disconnect()
  mo = null
  window.removeEventListener('resize', updateStageSize as any)
  window.removeEventListener('pointerdown', onGlobalPointerDown, true)
})

const renderRect = computed(() => {
  const sw = stageW.value
  const sh = stageH.value
  const iw = naturalW.value
  const ih = naturalH.value
  if (!sw || !sh || !iw || !ih) return { x: 0, y: 0, w: 0, h: 0, scale: 1, baseX: 0, baseY: 0 }
  const scale = Math.min(sw / iw, sh / ih) * zoom.value
  const w = iw * scale
  const h = ih * scale
  const baseX = (sw - w) / 2
  const baseY = (sh - h) / 2
  const x = baseX + pan.value.x
  const y = baseY + pan.value.y
  return { x, y, w, h, scale, baseX, baseY }
})

const hasImage = computed(() => !!currentSrc.value && naturalW.value > 0 && naturalH.value > 0)

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const minCropSize = 24

const stageBounds = computed(() => {
  return { x: 0, y: 0, w: stageW.value, h: stageH.value }
})

const clampPanToVisible = (next: { x: number; y: number }, rr: { w: number; h: number; baseX: number; baseY: number }) => {
  const minVisible = 40
  const minPanX = minVisible - (rr.baseX + rr.w)
  const maxPanX = stageW.value - minVisible - rr.baseX
  const minPanY = minVisible - (rr.baseY + rr.h)
  const maxPanY = stageH.value - minVisible - rr.baseY

  const clampPan = (v: number, min: number, max: number) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return v
    if (min > max) return (min + max) / 2
    return clamp(v, min, max)
  }

  return {
    x: clampPan(next.x, minPanX, maxPanX),
    y: clampPan(next.y, minPanY, maxPanY),
  }
}

const stageBgStyle = computed(() => {
  if (!hasImage.value) {
    return { backgroundImage: 'none' } as const
  }
  if (isDark.value) {
    return {
      backgroundColor: 'rgba(255,255,255,0.03)',
      backgroundImage:
        'linear-gradient(45deg, rgba(255,255,255,0.14) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.14) 75%, rgba(255,255,255,0.14)), linear-gradient(45deg, rgba(255,255,255,0.14) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.14) 75%, rgba(255,255,255,0.14))',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
    } as const
  }
  return {
    backgroundColor: 'rgba(0,0,0,0.02)',
    backgroundImage:
      'linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.08)), linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.08))',
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 12px 12px',
  } as const
})

const clampRectFree = (r: Rect) => {
  const b = stageBounds.value
  if (!b.w || !b.h) return r
  let w = clamp(r.w, minCropSize, b.w)
  let h = clamp(r.h, minCropSize, b.h)
  let x = clamp(r.x, b.x, b.x + b.w - w)
  let y = clamp(r.y, b.y, b.y + b.h - h)
  return { x, y, w, h }
}

const normalizeCrop = (r: Rect) => {
  const b = stageBounds.value
  if (!b.w || !b.h) return r
  const x1 = clamp(r.x, b.x, b.x + b.w - minCropSize)
  const y1 = clamp(r.y, b.y, b.y + b.h - minCropSize)
  const x2 = clamp(r.x + r.w, x1 + minCropSize, b.x + b.w)
  const y2 = clamp(r.y + r.h, y1 + minCropSize, b.y + b.h)
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

const clampRectToBounds = (r: Rect, ratio: number | null, base: 'w' | 'h' = 'w') => {
  const b = stageBounds.value
  if (!b.w || !b.h) return r
  let x = r.x
  let y = r.y
  let w = r.w
  let h = r.h

  if (!ratio) return normalizeCrop(r)

  if (base === 'h') {
    if (h < minCropSize) h = minCropSize
    w = h * ratio
    if (w < minCropSize) {
      w = minCropSize
      h = w / ratio
    }
  } else {
    if (w < minCropSize) w = minCropSize
    h = w / ratio
    if (h < minCropSize) {
      h = minCropSize
      w = h * ratio
    }
  }

  if (w > b.w) {
    w = b.w
    h = w / ratio
  }
  if (h > b.h) {
    h = b.h
    w = h * ratio
  }

  x = clamp(x, b.x, b.x + b.w - w)
  y = clamp(y, b.y, b.y + b.h - h)

  return { x, y, w, h }
}

const applyAspectToCurrentCrop = () => {
  if (!hasImage.value) return
  const ratio = aspectRatio.value
  if (!ratio) return
  const cx = crop.value.x + crop.value.w / 2
  const cy = crop.value.y + crop.value.h / 2
  let w = crop.value.w
  let h = w / ratio
  if (h > crop.value.h) {
    h = crop.value.h
    w = h * ratio
  }
  const next = clampRectToBounds({ x: cx - w / 2, y: cy - h / 2, w, h }, ratio, 'w')
  crop.value = next
}

const setAspectPreset = (preset: typeof aspectPreset.value) => {
  aspectPreset.value = preset
  isAspectMenuOpen.value = false
  if (aspectRatio.value) applyAspectToCurrentCrop()
}

const resetCropToDefault = () => {
  const rr = renderRect.value
  const padding = Math.min(rr.w, rr.h) * 0.08
  const x = rr.x + padding
  const y = rr.y + padding
  const w = Math.max(0, rr.w - padding * 2)
  const h = Math.max(0, rr.h - padding * 2)
  crop.value = normalizeCrop({ x, y, w, h })
}

const setImageFromDataUrl = async (dataUrl: string, name: string, type: string) => {
  errorMessage.value = ''
  infoMessage.value = ''
  const img = await createImage(dataUrl)
  fileName.value = name
  fileType.value = type || 'image/png'
  originalSrc.value = originalSrc.value ?? dataUrl
  currentSrc.value = dataUrl
  naturalW.value = img.naturalWidth
  naturalH.value = img.naturalHeight
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  updateStageSize()
  resetCropToDefault()
}

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择图片文件'
    return
  }
  if (currentSrc.value) {
    originalSrc.value = null
  }
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
  await setImageFromDataUrl(dataUrl, file.name, file.type)
}

const handleDrop = async (e: DragEvent) => {
  isDraggingFile.value = false
  const files = e.dataTransfer?.files
  const file = files?.[0]
  if (!file) return
  try {
    await processFile(file)
  } catch (e: any) {
    errorMessage.value = e?.message || '处理图片失败'
  }
}

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    await processFile(file)
  } catch (e: any) {
    errorMessage.value = e?.message || '处理图片失败'
  }
}

const onPointerDownHandle = (e: PointerEvent, handle: Handle) => {
  if (!hasImage.value) return
  e.preventDefault()
  e.stopPropagation()
  activeHandle.value = handle
  isAdjusting.value = true
  isPanningImage.value = false
  startPointer.value = { x: e.clientX, y: e.clientY }
  startCrop.value = { ...crop.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

const createDefaultCropAt = (offsetX: number, offsetY: number) => {
  const b = stageBounds.value
  if (!b.w || !b.h) return
  const clickX = clamp(offsetX, b.x, b.x + b.w)
  const clickY = clamp(offsetY, b.y, b.y + b.h)
  const ratio = aspectRatio.value

  const maxW = b.w * 0.6
  const maxH = b.h * 0.6
  let w = maxW
  let h = maxH
  if (ratio) {
    w = Math.min(maxW, maxH * ratio)
    h = w / ratio
  }
  const next = ratio
    ? clampRectToBounds({ x: clickX - w / 2, y: clickY - h / 2, w, h }, ratio, 'w')
    : clampRectFree({ x: clickX - w / 2, y: clickY - h / 2, w, h })

  crop.value = next
}

const onPointerDownStageCapture = (e: PointerEvent) => {
  if (!hasImage.value) return
  if (!e.shiftKey) return
  e.preventDefault()
  e.stopPropagation()
  isAdjusting.value = false
  activeHandle.value = null
  isPanningImage.value = false
  createDefaultCropAt(e.offsetX, e.offsetY)
}

const onPointerDownImageLayer = (e: PointerEvent) => {
  if (!hasImage.value) return
  const rr = renderRect.value
  e.preventDefault()
  e.stopPropagation()

  const insideImage = e.offsetX >= rr.x && e.offsetX <= rr.x + rr.w && e.offsetY >= rr.y && e.offsetY <= rr.y + rr.h
  if (!insideImage) return

  isPanningImage.value = true
  isAdjusting.value = false
  activeHandle.value = null
  startPointer.value = { x: e.clientX, y: e.clientY }
  startPan.value = { ...pan.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

const onPointerMoveImageLayer = (e: PointerEvent) => {
  if (!hasImage.value) return
  const rr = renderRect.value
  const insideImage = e.offsetX >= rr.x && e.offsetX <= rr.x + rr.w && e.offsetY >= rr.y && e.offsetY <= rr.y + rr.h
  isHoveringImage.value = insideImage
}

const onWheelStage = (e: WheelEvent) => {
  if (!hasImage.value) return
  const sw = stageW.value
  const sh = stageH.value
  const iw = naturalW.value
  const ih = naturalH.value
  if (!sw || !sh || !iw || !ih) return

  const rect = stageEl.value?.getBoundingClientRect()
  const sx = rect ? e.clientX - rect.left : sw / 2
  const sy = rect ? e.clientY - rect.top : sh / 2

  const rr = renderRect.value
  const insideImage = sx >= rr.x && sx <= rr.x + rr.w && sy >= rr.y && sy <= rr.y + rr.h
  const anchorX = insideImage ? sx : sw / 2
  const anchorY = insideImage ? sy : sh / 2

  const u = rr.w ? (anchorX - rr.x) / rr.w : 0.5
  const v = rr.h ? (anchorY - rr.y) / rr.h : 0.5

  const factor = Math.exp(-e.deltaY * 0.0012)
  const nextZoom = clamp(zoom.value * factor, minZoom, maxZoom)
  if (Math.abs(nextZoom - zoom.value) < 0.0001) return

  const nextScale = Math.min(sw / iw, sh / ih) * nextZoom
  const nextW = iw * nextScale
  const nextH = ih * nextScale
  const nextBaseX = (sw - nextW) / 2
  const nextBaseY = (sh - nextH) / 2

  const nextPan = {
    x: anchorX - u * nextW - nextBaseX,
    y: anchorY - v * nextH - nextBaseY,
  }

  zoom.value = nextZoom
  pan.value = clampPanToVisible(nextPan, { w: nextW, h: nextH, baseX: nextBaseX, baseY: nextBaseY })
}

const onPointerMove = (e: PointerEvent) => {
  if (isPanningImage.value) {
    const dx = e.clientX - startPointer.value.x
    const dy = e.clientY - startPointer.value.y
    const rr = renderRect.value
    pan.value = clampPanToVisible({ x: startPan.value.x + dx, y: startPan.value.y + dy }, rr)
    return
  }

  if (!isAdjusting.value || !activeHandle.value) return
  const b = stageBounds.value
  if (!b.w || !b.h) return
  const ratio = aspectRatio.value
  const dx = e.clientX - startPointer.value.x
  const dy = e.clientY - startPointer.value.y
  const cur = { ...startCrop.value }
  const minSize = minCropSize

  const flipHandle = (handle: Handle, flipX: boolean, flipY: boolean) => {
    const mapX: Record<Handle, Handle> = {
      move: 'move',
      w: 'e',
      e: 'w',
      nw: 'ne',
      ne: 'nw',
      sw: 'se',
      se: 'sw',
      n: 'n',
      s: 's',
    }
    const mapY: Record<Handle, Handle> = {
      move: 'move',
      n: 's',
      s: 'n',
      nw: 'sw',
      sw: 'nw',
      ne: 'se',
      se: 'ne',
      w: 'w',
      e: 'e',
    }
    let next = handle
    if (flipX) next = mapX[next]
    if (flipY) next = mapY[next]
    return next
  }

  const applyEdgesFree = (left: number, top: number, right: number, bottom: number) => {
    const curHandle = activeHandle.value as Handle
    const flipX = left > right
    const flipY = top > bottom
    const nextHandle = flipHandle(curHandle, flipX, flipY)

    let l = Math.min(left, right)
    let r = Math.max(left, right)
    let t = Math.min(top, bottom)
    let bo = Math.max(top, bottom)

    const moveX = nextHandle === 'w' || nextHandle === 'nw' || nextHandle === 'sw' ? 'left' : nextHandle === 'e' || nextHandle === 'ne' || nextHandle === 'se' ? 'right' : null
    const moveY = nextHandle === 'n' || nextHandle === 'nw' || nextHandle === 'ne' ? 'top' : nextHandle === 's' || nextHandle === 'sw' || nextHandle === 'se' ? 'bottom' : null

    if (r - l < minSize) {
      if (moveX === 'left') l = r - minSize
      else r = l + minSize
    }
    if (bo - t < minSize) {
      if (moveY === 'top') t = bo - minSize
      else bo = t + minSize
    }

    const next = clampRectFree({ x: l, y: t, w: r - l, h: bo - t })
    crop.value = next

    if (nextHandle !== curHandle) {
      activeHandle.value = nextHandle
      startPointer.value = { x: e.clientX, y: e.clientY }
      startCrop.value = { ...next }
    }
  }

  const resizeSideXRatio = (fixedX: number, pointerX: number, cy: number, handle: Handle) => {
    if (!ratio) return null
    const flipX = handle === 'w' ? pointerX > fixedX : handle === 'e' ? pointerX < fixedX : false
    const nextHandle = flipX ? (handle === 'w' ? 'e' : handle === 'e' ? 'w' : handle) : handle
    const w = Math.max(Math.abs(pointerX - fixedX), minSize)
    const h = w / ratio
    const x = Math.min(pointerX, fixedX)
    const y = cy - h / 2
    return { rect: clampRectToBounds({ x, y, w, h }, ratio, 'w'), nextHandle }
  }

  const resizeSideYRatio = (fixedY: number, pointerY: number, cx: number, handle: Handle) => {
    if (!ratio) return null
    const flipY = handle === 'n' ? pointerY > fixedY : handle === 's' ? pointerY < fixedY : false
    const nextHandle = flipY ? (handle === 'n' ? 's' : handle === 's' ? 'n' : handle) : handle
    const h = Math.max(Math.abs(pointerY - fixedY), minSize)
    const w = h * ratio
    const x = cx - w / 2
    const y = Math.min(pointerY, fixedY)
    return { rect: clampRectToBounds({ x, y, w, h }, ratio, 'h'), nextHandle }
  }

  const left0 = cur.x
  const top0 = cur.y
  const right0 = cur.x + cur.w
  const bottom0 = cur.y + cur.h

  const resizeCorner = (anchorX: number, anchorY: number, pointerX: number, pointerY: number) => {
    if (!ratio) return null
    const dx2 = pointerX - anchorX
    const dy2 = pointerY - anchorY
    const signX = dx2 >= 0 ? 1 : -1
    const signY = dy2 >= 0 ? 1 : -1
    let w = Math.max(Math.abs(dx2), minSize)
    let h = Math.max(Math.abs(dy2), minSize)
    if (w / h > ratio) {
      w = h * ratio
    } else {
      h = w / ratio
    }
    const x = signX < 0 ? anchorX - w : anchorX
    const y = signY < 0 ? anchorY - h : anchorY
    return clampRectToBounds({ x, y, w, h }, ratio, 'w')
  }

  switch (activeHandle.value) {
    case 'move': {
      const nx = clamp(left0 + dx, b.x, b.x + b.w - cur.w)
      const ny = clamp(top0 + dy, b.y, b.y + b.h - cur.h)
      crop.value = { x: nx, y: ny, w: cur.w, h: cur.h }
      break
    }
    case 'nw':
      if (ratio) {
        const next = resizeCorner(right0, bottom0, left0 + dx, top0 + dy)
        if (next) crop.value = next
      } else {
        applyEdgesFree(left0 + dx, top0 + dy, right0, bottom0)
      }
      break
    case 'ne':
      if (ratio) {
        const next = resizeCorner(left0, bottom0, right0 + dx, top0 + dy)
        if (next) crop.value = next
      } else {
        applyEdgesFree(left0, top0 + dy, right0 + dx, bottom0)
      }
      break
    case 'sw':
      if (ratio) {
        const next = resizeCorner(right0, top0, left0 + dx, bottom0 + dy)
        if (next) crop.value = next
      } else {
        applyEdgesFree(left0 + dx, top0, right0, bottom0 + dy)
      }
      break
    case 'se':
      if (ratio) {
        const next = resizeCorner(left0, top0, right0 + dx, bottom0 + dy)
        if (next) crop.value = next
      } else {
        applyEdgesFree(left0, top0, right0 + dx, bottom0 + dy)
      }
      break
    case 'n':
      if (ratio) {
        const cx = left0 + cur.w / 2
        const out = resizeSideYRatio(bottom0, top0 + dy, cx, 'n')
        if (out) {
          crop.value = out.rect
          if (out.nextHandle !== 'n') {
            activeHandle.value = out.nextHandle
            startPointer.value = { x: e.clientX, y: e.clientY }
            startCrop.value = { ...crop.value }
          }
        }
      } else {
        applyEdgesFree(left0, top0 + dy, right0, bottom0)
      }
      break
    case 's':
      if (ratio) {
        const cx = left0 + cur.w / 2
        const out = resizeSideYRatio(top0, bottom0 + dy, cx, 's')
        if (out) {
          crop.value = out.rect
          if (out.nextHandle !== 's') {
            activeHandle.value = out.nextHandle
            startPointer.value = { x: e.clientX, y: e.clientY }
            startCrop.value = { ...crop.value }
          }
        }
      } else {
        applyEdgesFree(left0, top0, right0, bottom0 + dy)
      }
      break
    case 'w':
      if (ratio) {
        const cy = top0 + cur.h / 2
        const out = resizeSideXRatio(right0, left0 + dx, cy, 'w')
        if (out) {
          crop.value = out.rect
          if (out.nextHandle !== 'w') {
            activeHandle.value = out.nextHandle
            startPointer.value = { x: e.clientX, y: e.clientY }
            startCrop.value = { ...crop.value }
          }
        }
      } else {
        applyEdgesFree(left0 + dx, top0, right0, bottom0)
      }
      break
    case 'e':
      if (ratio) {
        const cy = top0 + cur.h / 2
        const out = resizeSideXRatio(left0, right0 + dx, cy, 'e')
        if (out) {
          crop.value = out.rect
          if (out.nextHandle !== 'e') {
            activeHandle.value = out.nextHandle
            startPointer.value = { x: e.clientX, y: e.clientY }
            startCrop.value = { ...crop.value }
          }
        }
      } else {
        applyEdgesFree(left0, top0, right0 + dx, bottom0)
      }
      break
  }
}

const onPointerUp = () => {
  isAdjusting.value = false
  activeHandle.value = null
  isPanningImage.value = false
}

const keepCropInBounds = () => {
  if (!hasImage.value) return
  const ratio = aspectRatio.value
  if (!ratio) {
    crop.value = clampRectFree(crop.value)
    return
  }
  const curRatio = crop.value.w > 0 && crop.value.h > 0 ? crop.value.w / crop.value.h : ratio
  const base: 'w' | 'h' = Math.abs(curRatio - ratio) < 0.001 ? 'w' : curRatio > ratio ? 'h' : 'w'
  crop.value = clampRectToBounds(crop.value, ratio, base)
}

const cropImage = async () => {
  if (!hasImage.value || !currentSrc.value) return
  errorMessage.value = ''
  infoMessage.value = ''
  try {
    const img = await createImage(currentSrc.value)
    const rr = renderRect.value
    const cs = clampRectFree(crop.value)
    if (cs.w <= 0 || cs.h <= 0 || rr.w <= 0 || rr.h <= 0) {
      errorMessage.value = '裁剪区域无效'
      return
    }

    const outW = Math.max(1, Math.round(cs.w / rr.scale))
    const outH = Math.max(1, Math.round(cs.h / rr.scale))

    const imageStage = { x: rr.x, y: rr.y, w: rr.w, h: rr.h }
    const ix1 = Math.max(cs.x, imageStage.x)
    const iy1 = Math.max(cs.y, imageStage.y)
    const ix2 = Math.min(cs.x + cs.w, imageStage.x + imageStage.w)
    const iy2 = Math.min(cs.y + cs.h, imageStage.y + imageStage.h)

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      errorMessage.value = '浏览器不支持裁剪'
      return
    }

    const hasIntersect = ix2 > ix1 && iy2 > iy1
    if (hasIntersect) {
      const srcX = (ix1 - imageStage.x) / rr.scale
      const srcY = (iy1 - imageStage.y) / rr.scale
      const srcW = (ix2 - ix1) / rr.scale
      const srcH = (iy2 - iy1) / rr.scale

      const dstX = (ix1 - cs.x) / rr.scale
      const dstY = (iy1 - cs.y) / rr.scale
      const dstW = srcW
      const dstH = srcH

      const safeSrcX = clamp(Math.round(srcX), 0, Math.max(0, img.naturalWidth - 1))
      const safeSrcY = clamp(Math.round(srcY), 0, Math.max(0, img.naturalHeight - 1))
      const safeSrcW = clamp(Math.round(srcW), 1, img.naturalWidth - safeSrcX)
      const safeSrcH = clamp(Math.round(srcH), 1, img.naturalHeight - safeSrcY)

      const safeDstX = clamp(Math.round(dstX), 0, Math.max(0, outW - 1))
      const safeDstY = clamp(Math.round(dstY), 0, Math.max(0, outH - 1))
      const safeDstW = clamp(Math.round(dstW), 1, outW - safeDstX)
      const safeDstH = clamp(Math.round(dstH), 1, outH - safeDstY)

      const finalW = Math.min(safeSrcW, safeDstW)
      const finalH = Math.min(safeSrcH, safeDstH)
      ctx.drawImage(img, safeSrcX, safeSrcY, finalW, finalH, safeDstX, safeDstY, finalW, finalH)
    }

    const cropFullyInsideImage =
      cs.x >= imageStage.x &&
      cs.y >= imageStage.y &&
      cs.x + cs.w <= imageStage.x + imageStage.w &&
      cs.y + cs.h <= imageStage.y + imageStage.h

    const needsAlpha = !cropFullyInsideImage
    const nextType =
      !needsAlpha && (fileType.value === 'image/jpeg' || fileType.value === 'image/webp') ? fileType.value : 'image/png'

    const dataUrl = canvas.toDataURL(nextType, 0.92)
    await setImageFromDataUrl(dataUrl, fileName.value || 'cropped.png', nextType)
    originalSrc.value = originalSrc.value ?? dataUrl
    infoMessage.value = '裁剪已应用，可继续裁剪或下载'
  } catch (e: any) {
    errorMessage.value = e?.message || '裁剪失败'
  }
}

const rotateImage = async () => {
  if (!hasImage.value || !currentSrc.value) return
  errorMessage.value = ''
  infoMessage.value = ''
  try {
    const img = await createImage(currentSrc.value)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalHeight
    canvas.height = img.naturalWidth
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      errorMessage.value = '浏览器不支持旋转'
      return
    }
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    const nextType = fileType.value === 'image/jpeg' || fileType.value === 'image/webp' ? fileType.value : 'image/png'
    const dataUrl = canvas.toDataURL(nextType, 0.92)
    currentSrc.value = dataUrl
    const nextImg = await createImage(dataUrl)
    naturalW.value = nextImg.naturalWidth
    naturalH.value = nextImg.naturalHeight
    updateStageSize()
    keepCropInBounds()
    infoMessage.value = '已旋转 90°'
  } catch (e: any) {
    errorMessage.value = e?.message || '旋转失败'
  }
}

const resetAll = async () => {
  errorMessage.value = ''
  infoMessage.value = ''
  if (!originalSrc.value) {
    currentSrc.value = null
    naturalW.value = 0
    naturalH.value = 0
    crop.value = { x: 0, y: 0, w: 0, h: 0 }
    zoom.value = 1
    pan.value = { x: 0, y: 0 }
    return
  }
  try {
    const img = await createImage(originalSrc.value)
    currentSrc.value = originalSrc.value
    naturalW.value = img.naturalWidth
    naturalH.value = img.naturalHeight
    zoom.value = 1
    pan.value = { x: 0, y: 0 }
    updateStageSize()
    resetCropToDefault()
    infoMessage.value = '已重置'
  } catch {
    errorMessage.value = '重置失败'
  }
}

const clearImage = () => {
  errorMessage.value = ''
  infoMessage.value = ''
  fileName.value = ''
  fileType.value = 'image/png'
  originalSrc.value = null
  currentSrc.value = null
  naturalW.value = 0
  naturalH.value = 0
  crop.value = { x: 0, y: 0, w: 0, h: 0 }
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

const download = async () => {
  if (!currentSrc.value) return
  errorMessage.value = ''
  infoMessage.value = ''
  try {
    const res = await fetch(currentSrc.value)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const base = fileName.value ? fileName.value.replace(/\.[^.]+$/, '') : 'cropped'
    const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png'
    link.href = url
    link.download = `${base}-crop.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    errorMessage.value = '下载失败'
  }
}

const renderedImageStyle = computed(() => {
  const rr = renderRect.value
  return {
    transform: `translate(${rr.x}px, ${rr.y}px)`,
    width: `${rr.w}px`,
    height: `${rr.h}px`,
  }
})

const cropStyle = computed(() => {
  return {
    left: `${crop.value.x}px`,
    top: `${crop.value.y}px`,
    width: `${crop.value.w}px`,
    height: `${crop.value.h}px`,
  }
})

const highlightStyle = computed(() => {
  const sw = stageW.value
  const sh = stageH.value
  if (!sw || !sh) return {}
  const x1 = clamp(crop.value.x, 0, sw)
  const y1 = clamp(crop.value.y, 0, sh)
  const x2 = clamp(crop.value.x + crop.value.w, 0, sw)
  const y2 = clamp(crop.value.y + crop.value.h, 0, sh)
  const left = Math.max(0, Math.min(x1, x2))
  const top = Math.max(0, Math.min(y1, y2))
  const right = Math.max(0, sw - Math.max(x1, x2))
  const bottom = Math.max(0, sh - Math.max(y1, y2))
  return {
    clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 12px)`,
  } as any
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col gap-4 w-full min-w-0">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
        <Crop class="w-5 h-5 text-purple-500" />
        图片裁剪
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <label class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium flex items-center gap-2">
          <Upload class="w-4 h-4" />
          选择图片
          <input type="file" accept="image/*" class="hidden" @change="handleFileSelect">
        </label>

        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!hasImage && !originalSrc"
          @click="clearImage"
        >
          <Trash2 class="w-4 h-4" />
          清空
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 overflow-hidden">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div
          v-if="!hasImage"
          class="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl m-4 transition-colors"
          :class="{ 'border-purple-500 bg-purple-50 dark:bg-purple-900/20': isDraggingFile }"
          @dragenter.prevent="isDraggingFile = true"
          @dragleave.prevent="isDraggingFile = false"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600">
            <Upload class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">拖拽图片到这里</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">支持 JPG、PNG、WebP</p>
          <label class="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer transition-colors font-medium flex items-center gap-2">
            <Upload class="w-4 h-4" />
            选择图片
            <input type="file" accept="image/*" class="hidden" @change="handleFileSelect">
          </label>
        </div>

        <div v-else class="p-4 space-y-4 overflow-auto">
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-2">
            <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ fileName || '图片' }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-300">尺寸：{{ naturalW }} × {{ naturalH }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-300">裁剪框：{{ Math.round(crop.w) }} × {{ Math.round(crop.h) }}</div>
          </div>

          <div v-if="infoMessage" class="px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-200 text-sm border border-purple-100 dark:border-purple-900/40">
            {{ infoMessage }}
          </div>
          <div v-if="errorMessage" class="px-4 py-3 rounded-xl bg-red-100 dark:bg-red-900/70 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800">
            {{ errorMessage }}
          </div>

          <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            拖动蓝色裁剪框调整区域；在图片上拖动可移动图片；滚轮可缩放图片；按住 Shift 点击画布可重新生成选框；裁剪框可超出图片。
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
        <div class="flex-1 min-h-0 p-4">
          <div
            ref="stageEl"
            class="relative w-full h-full rounded-xl border overflow-hidden select-none transition-colors"
            :class="
              hasImage
                ? 'border-gray-200 dark:border-gray-700'
                : isDraggingFile
                  ? 'border-2 border-dashed border-purple-500 bg-purple-50/70 dark:bg-purple-900/15'
                  : 'border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/30'
            "
            :style="stageBgStyle"
            @pointerdown.capture="(e) => onPointerDownStageCapture(e as any)"
            @wheel.prevent="(e) => onWheelStage(e as any)"
            @dragenter.prevent="isDraggingFile = true"
            @dragleave.prevent="isDraggingFile = false"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div v-if="!hasImage" class="absolute inset-0 z-20 flex items-center justify-center p-6 pointer-events-none">
              <div class="w-full max-w-md rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm p-8 text-center">
                <div class="mx-auto w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Crop class="w-7 h-7" />
                </div>
                <div class="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">请先上传图片再开始裁剪</div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">支持拖拽到此处，或点击上方“选择图片”</div>
              </div>
            </div>

            <div v-if="currentSrc" class="absolute inset-0 pointer-events-none z-0">
              <img
                :src="currentSrc"
                class="absolute left-0 top-0 select-none"
                :style="renderedImageStyle"
                alt="预览"
                draggable="false"
              />
            </div>

            <div
              v-if="hasImage"
              class="absolute inset-0 bg-black/45 dark:bg-black/30 pointer-events-none z-10"
            ></div>

            <div v-if="currentSrc && hasImage" class="absolute inset-0 pointer-events-none z-20" :style="highlightStyle">
              <img
                :src="currentSrc"
                class="absolute left-0 top-0 select-none"
                :style="renderedImageStyle"
                alt=""
                draggable="false"
              />
            </div>

            <div
              v-if="hasImage"
              class="absolute inset-0 z-25"
              :class="isPanningImage ? 'cursor-grabbing' : isHoveringImage ? 'cursor-grab' : 'cursor-default'"
              @pointerdown="(e) => onPointerDownImageLayer(e as any)"
              @pointermove="(e) => { onPointerMoveImageLayer(e as any); onPointerMove(e as any) }"
              @pointerleave="isHoveringImage = false"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            ></div>

            <div
              v-if="hasImage"
              class="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_0_1px_rgba(59,130,246,0.25)] z-30 cursor-move"
              :style="cropStyle"
              @pointerdown="(e) => onPointerDownHandle(e as any, 'move')"
              @pointermove="(e) => onPointerMove(e as any)"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            >
              <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-0 bottom-0 left-1/3 w-px bg-blue-400/60"></div>
                <div class="absolute top-0 bottom-0 left-2/3 w-px bg-blue-400/60"></div>
                <div class="absolute left-0 right-0 top-1/3 h-px bg-blue-400/60"></div>
                <div class="absolute left-0 right-0 top-2/3 h-px bg-blue-400/60"></div>
              </div>

              <button class="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-nwse-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'nw')"></button>
              <button class="absolute -right-1.5 -top-1.5 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-nesw-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'ne')"></button>
              <button class="absolute -left-1.5 -bottom-1.5 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-nesw-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'sw')"></button>
              <button class="absolute -right-1.5 -bottom-1.5 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-nwse-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'se')"></button>

              <button class="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-ns-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'n')"></button>
              <button class="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-ns-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 's')"></button>
              <button class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-ew-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'w')"></button>
              <button class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border border-white shadow cursor-ew-resize" @pointerdown="(e) => onPointerDownHandle(e as any, 'e')"></button>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30 p-3">
          <div class="flex flex-wrap items-center gap-2 justify-between">
            <div class="flex items-center gap-2">
              <div ref="aspectMenuEl" class="relative">
                <button
                  class="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="button"
                  :disabled="!hasImage"
                  @click="isAspectMenuOpen = !isAspectMenuOpen"
                >
                  比例
                  <span class="ml-1 text-gray-600 dark:text-gray-300">{{ aspectLabel }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </button>

                <div
                  v-if="isAspectMenuOpen && hasImage"
                  class="absolute left-0 bottom-full mb-2 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50"
                  role="menu"
                >
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === 'free' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('free')"
                  >
                    自由
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === '1:1' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('1:1')"
                  >
                    1:1
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === '16:9' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('16:9')"
                  >
                    16:9
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === '9:16' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('9:16')"
                  >
                    9:16
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === '4:3' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('4:3')"
                  >
                    4:3
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === '3:2' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('3:2')"
                  >
                    3:2
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                    :class="aspectPreset === '5:4' ? 'text-purple-700 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200'"
                    @click="setAspectPreset('5:4')"
                  >
                    5:4
                  </button>
                </div>
              </div>

              <button
                class="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="!hasImage"
                @click="rotateImage"
              >
                <RotateCw class="w-4 h-4" />
                旋转
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="px-5 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="!hasImage"
                @click="cropImage"
              >
                <Crop class="w-4 h-4" />
                裁剪
              </button>

              <button
                class="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="!originalSrc"
                @click="resetAll"
              >
                <RefreshCw class="w-4 h-4" />
                重置
              </button>

              <button
                class="px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="!hasImage"
                @click="download"
              >
                <Download class="w-4 h-4" />
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

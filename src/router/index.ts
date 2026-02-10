import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'pro',
          name: 'pro',
          component: () => import('@/views/ProView.vue'),
          meta: { title: 'Pro 版本' }
        },
        // Developer Tools
        {
          path: 'json-formatter',
          name: 'json-formatter',
          component: () => import('@/views/tools/dev/JsonFormatter.vue'),
          meta: { title: 'JSON 格式化' }
        },
        {
          path: 'timestamp',
          name: 'timestamp',
          component: () => import('@/views/tools/dev/TimestampConverter.vue'),
          meta: { title: '时间戳转换' }
        },
        {
          path: 'base64',
          name: 'base64',
          component: () => import('@/views/tools/dev/Base64Converter.vue'),
          meta: { title: 'Base64 编解码' }
        },
        {
          path: 'uuid',
          name: 'uuid',
          component: () => import('@/views/tools/dev/UuidGenerator.vue'),
          meta: { title: 'UUID 生成器' }
        },
        {
          path: 'regex',
          name: 'regex',
          component: () => import('@/views/tools/dev/RegexTester.vue'),
          meta: { title: '正则测试' }
        },
        {
          path: 'url-encode',
          name: 'url-encode',
          component: () => import('@/views/tools/dev/UrlEncoder.vue'),
          meta: { title: 'URL 编解码' }
        },
        // Text Tools
        {
          path: 'word-count',
          name: 'word-count',
          component: () => import('@/views/tools/text/WordCount.vue'),
          meta: { title: '字数统计' }
        },
        {
          path: 'diff',
          name: 'diff',
          component: () => import('@/views/tools/text/TextDiff.vue'),
          meta: { title: '文本 Diff' }
        },
        {
          path: 'case-converter',
          name: 'case-converter',
          component: () => import('@/views/tools/text/CaseConverter.vue'),
          meta: { title: '命名转换' }
        },
        {
          path: 'password-gen',
          name: 'password-gen',
          component: () => import('@/views/tools/text/PasswordGenerator.vue'),
          meta: { title: '密码生成' }
        },
        {
          path: 'qrcode',
          name: 'qrcode',
          component: () => import('@/views/tools/image/QrCodeGenerator.vue'),
          meta: { title: '二维码生成' }
        },
        {
          path: 'color',
          name: 'color',
          component: () => import('@/views/tools/image/ColorConverter.vue'),
          meta: { title: '颜色转换' }
        },
        {
          path: 'image-compress',
          name: 'image-compress',
          component: () => import('@/views/tools/image/ImageCompressor.vue'),
          meta: { title: '图片压缩' }
        },
        {
          path: 'unit',
          name: 'unit-converter',
          component: () => import('@/views/tools/life/UnitConverter.vue'),
          meta: { title: '单位换算' }
        },
        {
          path: 'pomodoro',
          name: 'pomodoro',
          component: () => import('@/views/tools/life/PomodoroTimer.vue'),
          meta: { title: '番茄钟' }
        },
        {
          path: 'todo',
          name: 'todo',
          component: () => import('@/views/tools/life/TodoList.vue'),
          meta: { title: '待办清单' }
        },
        {
          path: 'random',
          name: 'random',
          component: () => import('@/views/tools/life/DecisionWheel.vue'),
          meta: { title: '决策转盘' }
        }
      ]
    }
  ]
})

export default router

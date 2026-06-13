import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HomeView from '@/views/HomeView.vue'
import { applySeoMeta, type PageSeoMeta } from '@/seo/meta'

const toolSeo = (
  title: string,
  description: string,
  keywords: string[] = []
): PageSeoMeta => ({
  title,
  description,
  keywords: [title, ...keywords, '在线工具', '开发者工具箱']
})

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
          component: HomeView,
          meta: {
            seo: {
              title: '开发者日常工具箱',
              description:
                '无广告、无追踪、纯本地运行的在线工具箱，覆盖 JSON 格式化、文本 Diff、二维码生成、正则测试、图片压缩、颜色转换、密码生成等高频场景。',
              keywords: ['开发者工具箱', '在线工具', '本地运行', '隐私安全', 'JSON格式化', '二维码生成']
            }
          }
        },
        {
          path: 'pro',
          name: 'pro',
          component: () => import('@/views/ProView.vue'),
          meta: {
            seo: {
              title: 'Pro 版本',
              description:
                '查看开发者日常工具箱 Pro 版本的高级功能、无限制使用权益、私密安全能力与早鸟升级方案。',
              keywords: ['Pro 版本', '高级功能', '效率工具', '开发者工具箱']
            }
          }
        },
        // Developer Tools
        {
          path: 'json-formatter',
          name: 'json-formatter',
          component: () => import('@/views/tools/dev/JsonFormatter.vue'),
          meta: {
            seo: toolSeo('JSON 格式化', '在线格式化、压缩并校验 JSON 数据，适合接口调试、日志排查与配置文件整理。', [
              'JSON校验',
              'JSON压缩',
              'JSON美化'
            ])
          }
        },
        {
          path: 'timestamp',
          name: 'timestamp',
          component: () => import('@/views/tools/dev/TimestampConverter.vue'),
          meta: {
            seo: toolSeo('时间戳转换', '支持 Unix 时间戳与日期时间互转，适合后端调试、日志分析与接口开发。', [
              'Unix时间戳',
              '日期转换',
              '时间工具'
            ])
          }
        },
        {
          path: 'base64',
          name: 'base64',
          component: () => import('@/views/tools/dev/Base64Converter.vue'),
          meta: {
            seo: toolSeo('Base64 编解码', '在线进行 Base64 编码与解码，快速处理文本内容、接口参数与调试数据。', [
              'Base64编码',
              'Base64解码',
              '编码工具'
            ])
          }
        },
        {
          path: 'uuid',
          name: 'uuid',
          component: () => import('@/views/tools/dev/UuidGenerator.vue'),
          meta: {
            seo: toolSeo('UUID 生成器', '批量生成 UUID v1 与 UUID v4，支持连字符、大写与复制导出。', [
              'UUID',
              'GUID生成',
              '批量生成'
            ])
          }
        },
        {
          path: 'regex',
          name: 'regex',
          component: () => import('@/views/tools/dev/RegexTester.vue'),
          meta: {
            seo: toolSeo('正则测试', '在线测试正则表达式匹配结果，适合文本提取、表单校验和规则调试。', [
              '正则表达式',
              'Regex',
              '模式匹配'
            ])
          }
        },
        {
          path: 'url-encode',
          name: 'url-encode',
          component: () => import('@/views/tools/dev/UrlEncoder.vue'),
          meta: {
            seo: toolSeo('URL 编解码', '支持 URL 参数编码与解码，快速处理 query、URI 与接口请求内容。', [
              'URL编码',
              'URL解码',
              'URI工具'
            ])
          }
        },
        {
          path: 'url-parser',
          name: 'url-parser',
          component: () => import('@/views/tools/dev/UrlParser.vue'),
          meta: {
            seo: toolSeo('URL 参数解析', '解析 URL 协议、路径、Hash 与查询参数，并支持编辑后重新组装链接。', [
              'URL参数',
              'Query解析',
              '链接重组'
            ])
          }
        },
        {
          path: 'md5',
          name: 'md5',
          component: () => import('@/views/tools/dev/Md5Hasher.vue'),
          meta: {
            seo: toolSeo('MD5 加密', '在线计算 32 位与 16 位 MD5 哈希值，适合文本摘要、签名校验与调试验证。', [
              'MD5',
              '哈希计算',
              '摘要工具'
            ])
          }
        },
        {
          path: 'screen-recorder',
          name: 'screen-recorder',
          component: () => import('@/views/tools/dev/ScreenRecorder.vue'),
          meta: {
            seo: toolSeo('录屏', '在线录制屏幕、窗口或标签页，支持麦克风与系统音频，适合演示与问题复现。', [
              '屏幕录制',
              '录屏工具',
              '浏览器录屏'
            ])
          }
        },
        // Text Tools
        {
          path: 'word-count',
          name: 'word-count',
          component: () => import('@/views/tools/text/WordCount.vue'),
          meta: {
            seo: toolSeo('字数统计', '统计中文字符、英文单词、总字数、行数与段落数，适合写作与内容校对。', [
              '字符统计',
              '字数计算',
              '文本分析'
            ])
          }
        },
        {
          path: 'diff',
          name: 'diff',
          component: () => import('@/views/tools/text/TextDiff.vue'),
          meta: {
            seo: toolSeo('文本 Diff', '对比两段文本差异，高亮新增、删除与修改内容，适合配置比对和文档审校。', [
              '文本对比',
              'Diff工具',
              '差异比较'
            ])
          }
        },
        {
          path: 'case-converter',
          name: 'case-converter',
          component: () => import('@/views/tools/text/CaseConverter.vue'),
          meta: {
            seo: toolSeo('命名转换', '在驼峰、下划线、短横线、Pascal 等命名风格之间快速转换。', [
              '驼峰转换',
              '下划线命名',
              'Case转换'
            ])
          }
        },
        {
          path: 'password-gen',
          name: 'password-gen',
          component: () => import('@/views/tools/text/PasswordGenerator.vue'),
          meta: {
            seo: toolSeo('密码生成', '随机生成强密码，自定义长度与字符集，适合账号安全与临时密码创建。', [
              '随机密码',
              '强密码',
              '密码工具'
            ])
          }
        },
        {
          path: 'qrcode',
          name: 'qrcode',
          component: () => import('@/views/tools/image/QrCodeGenerator.vue'),
          meta: {
            seo: toolSeo('二维码生成', '在线生成文本、链接等内容的二维码，适合分享地址、表单与活动物料。', [
              '二维码',
              '二维码生成器',
              '链接转二维码'
            ])
          }
        },
        {
          path: 'color',
          name: 'color',
          component: () => import('@/views/tools/image/ColorConverter.vue'),
          meta: {
            seo: toolSeo('颜色转换', '支持 HEX、RGB、HSL、CMYK 互转，并提供色调预览与快速复制。', [
              'HEX转RGB',
              '颜色格式转换',
              '设计工具'
            ])
          }
        },
        {
          path: 'image-compress',
          name: 'image-compress',
          component: () => import('@/views/tools/image/ImageCompressor.vue'),
          meta: {
            seo: toolSeo('图片压缩', '本地压缩图片体积，优化上传与网页加载性能，兼顾隐私与效率。', [
              '图片压缩',
              '图片优化',
              '本地处理'
            ])
          }
        },
        {
          path: 'unit',
          name: 'unit-converter',
          component: () => import('@/views/tools/life/UnitConverter.vue'),
          meta: {
            seo: toolSeo('单位换算', '支持长度、面积、重量、温度、时间等多种常用单位快速换算。', [
              '单位转换',
              '长度换算',
              '温度换算'
            ])
          }
        },
        {
          path: 'pomodoro',
          name: 'pomodoro',
          component: () => import('@/views/tools/life/PomodoroTimer.vue'),
          meta: {
            seo: toolSeo('番茄钟', '使用番茄工作法进行专注倒计时，帮助学习、写作和开发过程保持节奏。', [
              'Pomodoro',
              '专注计时',
              '效率工具'
            ])
          }
        },
        {
          path: 'todo',
          name: 'todo',
          component: () => import('@/views/tools/life/TodoList.vue'),
          meta: {
            seo: toolSeo('待办清单', '轻量本地待办清单工具，快速记录任务、安排事项与跟踪完成状态。', [
              'Todo List',
              '待办事项',
              '任务管理'
            ])
          }
        },
        {
          path: 'random',
          name: 'random',
          component: () => import('@/views/tools/life/DecisionWheel.vue'),
          meta: {
            seo: toolSeo('决策转盘', '通过随机转盘与随机数帮助做选择，适合抽签、分配与轻量娱乐场景。', [
              '随机转盘',
              '随机选择',
              '抽签工具'
            ])
          }
        }
      ]
    }
  ]
})

router.afterEach((to) => {
  applySeoMeta(to.meta.seo as PageSeoMeta | undefined, to.fullPath)
})

export default router

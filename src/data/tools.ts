import { 
  Code2, 
  FileJson, 
  Clock, 
  Binary, 
  Fingerprint, 
  Regex, 
  Link, 
  Type, 
  AlignLeft, 
  ArrowLeftRight, 
  KeyRound, 
  CaseUpper,
  Image as ImageIcon,
  QrCode,
  Palette,
  Minimize,
  Calculator,
  ListTodo,
  Dices
} from 'lucide-vue-next'

export interface Tool {
  name: string
  desc: string
  icon: any
  path: string
  status: string
}

export interface Category {
  title: string
  id: string
  icon: any
  color: string
  bg: string
  tools: Tool[]
}

export const toolsData: Category[] = [
  {
    title: '开发者工具',
    id: 'dev-tools',
    icon: Code2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    tools: [
      { name: 'JSON 格式化', desc: '美化、压缩、校验 JSON 数据', icon: FileJson, path: '/json-formatter', status: '已开发' },
      { name: '时间戳转换', desc: 'Unix 时间戳与日期互相转换', icon: Clock, path: '/timestamp', status: '已开发' },
      { name: 'Base64 编解码', desc: '文本/图片 Base64 转换', icon: Binary, path: '/base64', status: '已开发' },
      { name: 'UUID 生成器', desc: '批量生成 Version 1/4 UUID', icon: Fingerprint, path: '/uuid', status: '已开发' },
      { name: '正则测试', desc: '正则表达式实时测试', icon: Regex, path: '/regex', status: '已开发' },
      { name: 'URL 编解码', desc: 'URL 参数 Encode/Decode', icon: Link, path: '/url-encode', status: '已开发' },
    ]
  },
  {
    title: '文本与数据',
    id: 'text-tools',
    icon: Type,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    tools: [
      { name: '字数统计', desc: '统计汉字、单词、字符数', icon: AlignLeft, path: '/word-count', status: '已开发' },
      { name: '文本 Diff', desc: '两段文本差异对比', icon: ArrowLeftRight, path: '/diff', status: '已开发' },
      { name: '密码生成', desc: '随机生成强密码', icon: KeyRound, path: '/password-gen', status: '已开发' },
      { name: '命名转换', desc: '驼峰、下划线等风格转换', icon: CaseUpper, path: '/case-converter', status: '已开发' },
    ]
  },
  {
    title: '图形与设计',
    id: 'image-tools',
    icon: ImageIcon,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    tools: [
      { name: '二维码生成', desc: '文本/链接生成二维码', icon: QrCode, path: '/qrcode', status: '已开发' },
      { name: '颜色转换', desc: 'HEX, RGB, HSL 互转', icon: Palette, path: '/color', status: '已开发' },
      { name: '图片压缩', desc: '本地图片压缩减小体积', icon: Minimize, path: '/image-compress', status: '已开发' },
    ]
  },
  {
    title: '生活与效率',
    id: 'life-tools',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    tools: [
      { name: '单位换算', desc: '常用物理单位换算', icon: Calculator, path: '/unit', status: '已开发' },
      { name: '番茄钟', desc: '专注工作倒计时', icon: Clock, path: '/pomodoro', status: '待开发' },
      { name: '待办清单', desc: '简单的本地 Todo List', icon: ListTodo, path: '/todo', status: '待开发' },
      { name: '决策转盘', desc: '随机选择与随机数', icon: Dices, path: '/random', status: '待开发' },
    ]
  }
]

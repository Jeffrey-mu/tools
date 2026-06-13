export interface PageSeoMeta {
  title: string
  description: string
  keywords?: string[]
  canonicalPath?: string
  robots?: string
  image?: string
  type?: 'website' | 'article'
}

const SITE_NAME = '开发者日常工具箱'
const DEFAULT_IMAGE = '/assets/images/logo.png'

export const defaultSeoMeta: PageSeoMeta = {
  title: SITE_NAME,
  description:
    '专为开发者打造的免费在线工具箱。提供 JSON 格式化、文本 Diff、二维码生成、正则测试、UUID 生成、颜色转换等实用工具。纯本地运行，无广告，无追踪。',
  keywords: [
    '开发者工具箱',
    '在线工具',
    'JSON格式化',
    '文本对比',
    '二维码生成',
    '正则测试',
    'UUID生成',
    '颜色转换',
    '本地运行',
    '隐私安全'
  ],
  canonicalPath: '/',
  robots: 'index,follow',
  image: DEFAULT_IMAGE,
  type: 'website'
}

const titleTemplate = (title: string) => {
  if (!title || title === SITE_NAME) return defaultSeoMeta.title
  return `${title} | ${SITE_NAME}`
}

const getSiteUrl = () => {
  const envSiteUrl = import.meta.env.VITE_SITE_URL?.trim()
  if (envSiteUrl) {
    return envSiteUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  return ''
}

const resolveUrl = (pathOrUrl: string) => {
  if (!pathOrUrl) return ''
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl

  const siteUrl = getSiteUrl()
  if (!siteUrl) return ''

  return new URL(pathOrUrl, `${siteUrl}/`).toString()
}

const ensureMetaTag = (attr: 'name' | 'property', key: string) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }

  return tag
}

const ensureCanonicalTag = () => {
  let tag = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', 'canonical')
    document.head.appendChild(tag)
  }

  return tag
}

export const applySeoMeta = (meta?: Partial<PageSeoMeta>, currentPath = '/') => {
  if (typeof document === 'undefined') return

  const mergedMeta: PageSeoMeta = {
    ...defaultSeoMeta,
    ...meta,
    keywords: meta?.keywords?.length ? meta.keywords : defaultSeoMeta.keywords,
    canonicalPath: meta?.canonicalPath || currentPath
  }

  const title = titleTemplate(mergedMeta.title)
  const canonicalUrl = resolveUrl(mergedMeta.canonicalPath || currentPath)
  const imageUrl = resolveUrl(mergedMeta.image || DEFAULT_IMAGE)
  const keywords = (mergedMeta.keywords || []).join(', ')

  document.documentElement.lang = 'zh-CN'
  document.title = title

  ensureMetaTag('name', 'description').content = mergedMeta.description
  ensureMetaTag('name', 'keywords').content = keywords
  ensureMetaTag('name', 'robots').content = mergedMeta.robots || 'index,follow'

  ensureMetaTag('property', 'og:title').content = title
  ensureMetaTag('property', 'og:description').content = mergedMeta.description
  ensureMetaTag('property', 'og:type').content = mergedMeta.type || 'website'
  ensureMetaTag('property', 'og:site_name').content = SITE_NAME
  ensureMetaTag('property', 'og:image').content = imageUrl

  if (canonicalUrl) {
    ensureMetaTag('property', 'og:url').content = canonicalUrl
    ensureCanonicalTag().href = canonicalUrl
  }

  ensureMetaTag('name', 'twitter:card').content = 'summary_large_image'
  ensureMetaTag('name', 'twitter:title').content = title
  ensureMetaTag('name', 'twitter:description').content = mergedMeta.description
  ensureMetaTag('name', 'twitter:image').content = imageUrl
}

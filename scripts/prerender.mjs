/**
 * Build-time prerender for public pages.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle).
 * Injects the server-rendered markup into the app shell and writes a static
 * HTML file per public route, so crawlers and AI answer engines receive real
 * content without executing JavaScript.
 *
 *   /          -> dist/index.html
 *   /founders  -> dist/founders.html
 *
 * The SPA still boots normally on the client and takes over after load.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const serverBundle = path.join(root, 'dist-ssr', 'entry-server.js')

const SITE_URL = 'https://skillsaarthi.vercel.app'

const PAGES = [
  {
    path: '/',
    out: 'index.html',
    title: 'skillसारथी — One-Stop Personalized Career & Education Advisor',
    description:
      'SkillSaarthi (skillसारथी) is a free, personalized career and education advisor. Map your skills to real careers, find your skill gaps, and follow a step-by-step learning roadmap.',
  },
  {
    path: '/founders',
    out: 'founders.html',
    title: 'Meet the Founders | SkillSaarthi',
    description:
      'Meet the people behind SkillSaarthi and learn about the vision behind the platform.',
  },
]

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)
  if (!re.test(html)) return html
  return html.replace(re, `$1${escapeHtml(value)}$2`)
}

function injectHead(html, { title, description, url }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  out = setMeta(out, 'name', 'description', description)
  out = setMeta(out, 'property', 'og:title', title)
  out = setMeta(out, 'name', 'twitter:title', title)
  out = setMeta(out, 'property', 'og:description', description)
  out = setMeta(out, 'name', 'twitter:description', description)
  out = setMeta(out, 'property', 'og:url', url)
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(url)}$2`)
  return out
}

async function main() {
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
  const { render } = await import(pathToFileURL(serverBundle).href)

  for (const page of PAGES) {
    const appHtml = render(page.path)
    const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`

    let html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    )
    html = injectHead(html, { title: page.title, description: page.description, url })

    await writeFile(path.join(distDir, page.out), html, 'utf8')
    console.log(`  + prerendered ${page.path} -> dist/${page.out} (${appHtml.length} bytes of markup)`)
  }
}

main().catch((error) => {
  console.error('\nPrerender failed:', error?.message || error)
  process.exitCode = 1
})

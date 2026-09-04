import { useRef, useState, useEffect } from 'react'
import { chatAssistant } from '../../services/assistant'
import TopBar from '../../components/layout/TopBar'

function Markdown({ content }) {
  const lines = String(content || '').split('\n')
  const els = []
  let list = []
  const flushList = () => {
    if (list.length) {
      els.push(<ul key={`ul-${els.length}`} className="my-2 ml-4 list-disc space-y-1">{list.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>)
      list = []
    }
  }
  const inline = (t) => {
    const parts = []
    let last = 0
    const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(\[.+?\]\(.+?\))/g
    let m
    while ((m = re.exec(t))) {
      if (m.index > last) parts.push(t.slice(last, m.index))
      if (m[1]) parts.push(<strong key={m.index}>{m[1]}</strong>)
      else if (m[2]) parts.push(<em key={m.index}>{m[2]}</em>)
      else if (m[3]) parts.push(<code key={m.index} className="rounded bg-white px-1 py-0.5 text-xs">{m[3]}</code>)
      else if (m[4]) {
        const mm = m[4].match(/\[(.+?)\]\((.+?)\)/)
        if (mm) parts.push(<a key={m.index} href={mm[2]} target="_blank" rel="noreferrer" className="text-brand-deep underline">{mm[1]}</a>)
        else parts.push(m[4])
      }
      last = m.index + m[0].length
    }
    if (last < t.length) parts.push(t.slice(last))
    return parts.length ? <>{parts}</> : t
  }
  lines.forEach((line, idx) => {
    const h = line.match(/^(#{1,3})\s+(.*)/)
    if (h) {
      flushList()
      const lvl = h[1].length
      const text = h[2]
      const cls = lvl === 1 ? 'text-base font-black mt-3 mb-1' : lvl === 2 ? 'text-sm font-black mt-2 mb-1' : 'text-sm font-bold mt-2'
      els.push(<div key={idx} className={cls}>{inline(text)}</div>)
      return
    }
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ''))
      return
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushList()
      els.push(<div key={idx} className="ml-4">{inline(line)}</div>)
      return
    }
    if (line.trim() === '') { flushList(); els.push(<div key={idx} className="h-2" />); return }
    flushList()
    els.push(<div key={idx} className="leading-relaxed">{inline(line)}</div>)
  })
  flushList()
  return <div className="prose prose-sm max-w-none">{els}</div>
}

const QUICK = [
  "What careers suit my profile best?",
  "What are my top skill gaps?",
  "Build me a 3-month roadmap",
  "How do I improve for Data Scientist?",
]

export default function Assistant() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I am skillsaarthi AI Assistant. Ask me about careers, skill gaps, or roadmaps based on your profile.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    const history = messages.slice(-8)
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await chatAssistant(msg, history)
      setMessages(m => [...m, { role: 'assistant', content: res.reply }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: err?.response?.data?.message || 'Assistant unavailable. Try again shortly.' }])
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-black tracking-tight">AI Career Assistant</h1>
        <p className="mt-1 text-sm text-ink-muted">Context-aware: uses your education, skills, interests, and goals.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold hover:bg-brand-soft">
              {q}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-line bg-white p-4 h-[55vh] overflow-auto">
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-brand text-white whitespace-pre-wrap' : 'bg-warm text-ink'}`}>
                {m.role === 'user' ? m.content : <Markdown content={m.content} />}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-ink-soft">Thinking…</div>}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about your career path..." className="input-base flex-1" />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">Send</button>
        </div>
      </main>
    </div>
  )
}

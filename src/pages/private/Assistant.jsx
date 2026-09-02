import { useRef, useState, useEffect } from 'react'
import { chatAssistant } from '../../services/assistant'
import TopBar from '../../components/layout/TopBar'

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
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-brand text-white' : 'bg-warm text-ink'}`}>
                {m.content}
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

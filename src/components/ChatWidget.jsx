import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const css = `
.cw-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  font-family: inherit;
}
.cw-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--teal, #0ABFBF);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(10,191,191,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
}
.cw-btn:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(10,191,191,0.45); }
.cw-panel {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 460px;
  animation: cw-pop 0.18s ease;
}
@keyframes cw-pop {
  from { opacity:0; transform: scale(0.92) translateY(8px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}
.cw-header {
  background: var(--teal, #0ABFBF);
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 0.9rem;
}
.cw-header-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #5fffaa;
  flex-shrink: 0;
}
.cw-thread {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cw-bubble {
  max-width: 82%;
  padding: 8px 12px;
  border-radius: 14px;
  font-size: 0.82rem;
  line-height: 1.45;
  word-break: break-word;
}
.cw-bubble.mine {
  background: var(--teal, #0ABFBF);
  color: #fff;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.cw-bubble.theirs {
  background: #F0F4F8;
  color: #1a2733;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.cw-bubble.typing {
  background: #F0F4F8;
  align-self: flex-start;
  color: #888;
  font-style: italic;
  font-size: 0.78rem;
}
.cw-input-row {
  display: flex;
  border-top: 1px solid #eef0f2;
  padding: 10px 12px;
  gap: 8px;
}
.cw-input {
  flex: 1;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 0.82rem;
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  max-height: 80px;
  overflow-y: auto;
}
.cw-input:focus { border-color: var(--teal, #0ABFBF); }
.cw-send {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--teal, #0ABFBF);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-end;
  transition: opacity 0.15s;
}
.cw-send:disabled { opacity: 0.4; cursor: default; }
`

const INTRO = { id: 'intro', body: "I'm your AptPilot guide. Ask me what you qualify for, what's missing from your application, what's on the market, or anything about how renting in New York actually works.", from_admin: true }

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([INTRO])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const threadRef = useRef(null)

  useEffect(() => {
    if (open && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, open])

  async function send() {
    const body = input.trim()
    if (!body || loading) return
    setInput('')
    const userMsg = { id: `u-${Date.now()}`, body, from_admin: false }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      // The server derives identity from this token, not from anything we
      // claim in the body — a browser-supplied user id would let anyone read
      // another renter's account.
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: body, conversationHistory: messages.slice(-8) }),
      })
      const { reply } = await res.json()
      if (reply) {
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, body: reply, from_admin: true }])
      }
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, body: 'Sorry, something went wrong. Try again.', from_admin: true }])
    }
    setLoading(false)
  }

  return (
    <>
      <style>{css}</style>
      <div className="cw-fab">
        {open && (
          <div className="cw-panel">
            <div className="cw-header">
              <div className="cw-header-dot" />
              AptPilot Support
            </div>
            <div className="cw-thread" ref={threadRef}>
              {messages.map(m => (
                <div key={m.id} className={`cw-bubble ${m.from_admin ? 'theirs' : 'mine'}`}>
                  {m.body}
                </div>
              ))}
              {loading && <div className="cw-bubble typing">Typing…</div>}
            </div>
            <div className="cw-input-row">
              <textarea
                className="cw-input"
                placeholder="Ask a question…"
                value={input}
                rows={1}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              />
              <button className="cw-send" onClick={send} disabled={loading || !input.trim()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}
        <button className="cw-btn" onClick={() => setOpen(o => !o)} aria-label="Support chat">
          {open
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
        </button>
      </div>
    </>
  )
}

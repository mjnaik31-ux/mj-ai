import { useState, useEffect, useRef, useCallback } from 'react'
import Orb from './components/Orb.jsx'
import Sidebar from './components/Sidebar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import InputBar from './components/InputBar.jsx'
import Cursor from './components/Cursor.jsx'
import BgParticles from './components/BgParticles.jsx'
import './App.css'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const MODE_CONFIG = {
  chat:         { label: 'Ask me anything',        hint: 'or click the orb',        status: 'Chat ready' },
  voice:        { label: 'Listening...',            hint: 'speak your request',       status: 'Voice active' },
  productivity: { label: 'What shall I help with?', hint: 'tasks, notes, reminders', status: 'Productivity mode' },
  creative:     { label: 'Lets create together',    hint: 'writing, ideas, art',      status: 'Creative mode' },
}

export default function App() {
  const [mode, setMode]               = useState('chat')
  const [messages, setMessages]       = useState([{ role: 'ai', text: 'Hi! I am MJ, your personal AI. How can I help today?', time: nowTime() }])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const [status, setStatus]           = useState('Chat ready')
  const [inputVal, setInputVal]       = useState('')
  const historyRef = useRef([])
  const recognitionRef = useRef(null)

  // Mode change
  const handleModeChange = (m) => {
    setMode(m)
    setStatus(MODE_CONFIG[m].status)
  }

  // Send message
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return
    setInputVal('')

    const userMsg = { role: 'user', text, time: nowTime() }
    setMessages(prev => [...prev, userMsg])
    historyRef.current.push({ role: 'user', parts: [{ text }] })

    setStatus('Thinking...')
    setIsSpeaking(false)

    // Typing indicator
    setMessages(prev => [...prev, { role: 'typing', text: '', time: '' }])

    try {
      const res = await fetch(`${BACKEND}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyRef.current, mode })
      })
      const data = await res.json()
      const reply = data.reply || data.error || 'Sorry, I could not respond.'

      historyRef.current.push({ role: 'model', parts: [{ text: reply }] })

      setMessages(prev => prev.filter(m => m.role !== 'typing').concat({ role: 'ai', text: reply, time: nowTime() }))
      setStatus(MODE_CONFIG[mode].status)
      setIsSpeaking(true)
      speakReply(reply, () => setIsSpeaking(false))
    } catch (err) {
      setMessages(prev => prev.filter(m => m.role !== 'typing').concat({ role: 'ai', text: 'Connection error. Is the backend running?', time: nowTime() }))
      setStatus('Error')
      setIsSpeaking(false)
    }
  }, [mode])

  // Voice
  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening])

  const startListening = () => {
    setIsListening(true)
    setStatus('Listening...')
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setIsListening(false); setStatus(MODE_CONFIG[mode].status); return }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setInputVal(text)
      setIsListening(false)
      sendMessage(text)
    }
    rec.onerror = () => { setIsListening(false); setStatus(MODE_CONFIG[mode].status) }
    rec.onend   = () => { setIsListening(false) }
    rec.start()
    recognitionRef.current = rec
  }

  const stopListening = () => {
    setIsListening(false)
    setStatus(MODE_CONFIG[mode].status)
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch(e) {} }
  }

  const clearChat = () => {
    historyRef.current = []
    setMessages([{ role: 'ai', text: 'Chat cleared. How can I help you?', time: nowTime() }])
  }

  const quickPrompt = (text) => sendMessage(text)

  const cfg = MODE_CONFIG[mode]

  return (
    <div className="app">
      <BgParticles />
      <Cursor />
      <Sidebar mode={mode} onModeChange={handleModeChange} />
      <header className="topbar">
        <div className="mode-tabs">
          {['chat','voice','productivity','creative'].map(m => (
            <div key={m} className={`mode-tab${mode===m?' active':''}`} onClick={() => handleModeChange(m)}>
              {m.charAt(0).toUpperCase()+m.slice(1)}
            </div>
          ))}
        </div>
        <div className="topbar-right">
          <span className="ai-status">{status}</span>
          <div className="status-dot"/>
        </div>
      </header>
      <main className="orb-panel">
        <div className="orb-wrap" id="orb-wrap">
          <Orb isListening={isListening} isSpeaking={isSpeaking} />
          <div className="orb-label">{cfg.label}</div>
          <div className="orb-hint">{cfg.hint}</div>
        </div>
        <div className="quick-actions">
          <button className="qa-btn" onClick={() => quickPrompt('Summarize my day')}>Summarize day</button>
          <button className="qa-btn" onClick={() => quickPrompt('Help me plan my tasks')}>Plan tasks</button>
          <button className="qa-btn" onClick={() => quickPrompt('Write something creative')}>Get creative</button>
        </div>
      </main>
      <ChatPanel messages={messages} onClear={clearChat} />
      <InputBar
        value={inputVal}
        onChange={setInputVal}
        onSend={sendMessage}
        onMic={toggleMic}
        isListening={isListening}
      />
    </div>
  )
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function speakReply(text, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return }
  speechSynthesis.cancel()
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.volume = 1; utt.rate = 0.90; utt.pitch = 1.15
    const voices = speechSynthesis.getVoices()
    const priority = ['Google UK English Female','Microsoft Aria Online (Natural) - English (United States)','Microsoft Jenny Online (Natural) - English (United States)','Samantha','Karen','Moira']
    let picked = null
    for (const name of priority) {
      picked = voices.find(v => v.name === name)
      if (picked) break
    }
    if (!picked) picked = voices.find(v => v.lang === 'en-US')
    if (picked) utt.voice = picked
    utt.onend = onEnd
    speechSynthesis.speak(utt)
  }, 150)
}

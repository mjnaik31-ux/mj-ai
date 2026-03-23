import { useRef } from 'react'
import './InputBar.css'

export default function InputBar({ value, onChange, onSend, onMic, isListening }) {
  const textareaRef = useRef(null)

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend(value)
    }
  }

  const handleInput = (e) => {
    onChange(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
  }

  return (
    <footer className="input-bar">
      <div className="input-wrap">
        <textarea
          ref={textareaRef}
          className="chat-input"
          rows={1}
          placeholder="Ask MJ anything..."
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
        />
        {isListening && (
          <div className="voice-wave">
            <div className="vbar"/><div className="vbar"/><div className="vbar"/><div className="vbar"/><div className="vbar"/>
          </div>
        )}
      </div>
      <button className={`mic-btn${isListening ? ' listening' : ''}`} onClick={onMic} title="Voice input">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
        </svg>
      </button>
      <button className="send-btn" onClick={() => onSend(value)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </footer>
  )
}

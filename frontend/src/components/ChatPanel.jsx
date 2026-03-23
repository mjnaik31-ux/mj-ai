import { useEffect, useRef } from 'react'
import './ChatPanel.css'

export default function ChatPanel({ messages, onClear }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <aside className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">Conversation</span>
        <span className="clear-btn" onClick={onClear}>Clear</span>
      </div>
      <div className="messages">
        {messages.map((msg, i) => (
          msg.role === 'typing'
            ? <div key={i} className="msg ai"><div className="typing-bubble"><div className="dot"/><div className="dot"/><div className="dot"/></div></div>
            : <div key={i} className={`msg ${msg.role}`}>
                <div className="bubble">{msg.text}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
        ))}
        <div ref={bottomRef}/>
      </div>
    </aside>
  )
}

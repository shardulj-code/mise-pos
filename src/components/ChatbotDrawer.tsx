import React, { useState, useRef, useEffect } from 'react'
import type { AppStore } from '../storage'
import { processChatQuery, type ChatMessage } from '../chatbotEngine'

interface ChatbotDrawerProps {
  isOpen: boolean
  onClose: () => void
  store: AppStore
  onNavigate: (screen: string) => void
  initialQuery?: string
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  store,
  onNavigate,
  initialQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: `Hello! I am Mise Assistant, your 24/7 in-app support partner. Since Mise does not rely on a call centre or phone queue, I can diagnose printer IPs, guide your operations, answer GST questions, or navigate modules instantly. How can I help you today?`,
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery)
    }
  }, [initialQuery, isOpen])

  const handleSend = (queryText?: string) => {
    const textToSend = (queryText ?? input).trim()
    if (!textToSend) return

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMsg])
    if (!queryText) setInput('')

    setTimeout(() => {
      const botResponse = processChatQuery(textToSend, store, onNavigate)
      setMessages(prev => [...prev, botResponse])
    }, 200)
  }

  if (!isOpen) return null

  const quickPrompts = [
    { label: '🩺 Run System Diagnostics', q: 'run diagnostics check system' },
    { label: '💰 Today Sales Summary', q: 'today sales report' },
    { label: '🖨️ Printer IP Troubleshoot', q: 'printer help not printing' },
    { label: '📦 Low Grocery Stock', q: 'pantry low stock check' },
    { label: '🏛️ GST & Tax Rate Settings', q: 'change gst rate tax' },
    { label: '📱 Module Codes for Devices', q: 'device codes pairing' }
  ]

  return (
    <aside className="chatbot-drawer" aria-label="Mise Support Assistant">
      <div className="chatbot-header">
        <div className="chatbot-title-box">
          <span className="chatbot-avatar">🤖</span>
          <div>
            <h3>Mise 24/7 Assistant</h3>
            <p className="status-indicator">
              <span className="dot-online" /> Real-time Self-Service Support
            </p>
          </div>
        </div>
        <button className="chatbot-close-btn" onClick={onClose} aria-label="Close assistant">✕</button>
      </div>

      <div className="chatbot-prompts-bar">
        {quickPrompts.map((p, i) => (
          <button key={i} className="chip-prompt" onClick={() => handleSend(p.q)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="chatbot-body">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message is-${msg.sender}`}>
            <div className="chat-bubble">
              <div className="chat-text">{msg.text}</div>

              {/* Diagnostics Card */}
              {msg.diagnostics && (
                <div className="diagnostics-card">
                  <div className="diag-header">⚡ Live Hardware & System Diagnostics</div>
                  {msg.diagnostics.map((d, index) => (
                    <div key={index} className={`diag-row status-${d.status.toLowerCase()}`}>
                      <div className="diag-title">
                        <span className="diag-status-icon">
                          {d.status === 'PASS' ? '🟢' : d.status === 'WARN' ? '🟡' : '🔴'}
                        </span>
                        <strong>{d.name}</strong>
                      </div>
                      <div className="diag-detail">{d.detail}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              {msg.action && (
                <button
                  className="chat-action-btn"
                  onClick={() => {
                    if (msg.action?.screen) {
                      onNavigate(msg.action.screen)
                      onClose()
                    }
                  }}
                >
                  {msg.action.label} &rarr;
                </button>
              )}

              <span className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-footer">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSend()
          }}
          className="chatbot-input-row"
        >
          <input
            type="text"
            className="chatbot-input"
            placeholder="Type your issue (e.g. 'printer error', 'kitna sale hua', 'edit menu')..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="chatbot-send-btn" disabled={!input.trim()}>
            Send
          </button>
        </form>
        <p className="chatbot-disclaimer">
          Instant offline AI-free intelligence. No call waiting or technician delays.
        </p>
      </div>
    </aside>
  )
}


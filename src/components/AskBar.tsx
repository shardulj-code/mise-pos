import React, { useState, useEffect, useRef } from 'react'
import type { MenuItem, TableItem } from '../types'
import { formatINR } from '../gstEngine'

interface AskBarProps {
  isOpen: boolean
  onClose: () => void
  menu: MenuItem[]
  tables: TableItem[]
  onSelectScreen: (screen: string) => void
  onSelectTable?: (tableId: string) => void
  onAskChatbot: (query: string) => void
}

export const AskBar: React.FC<AskBarProps> = ({
  isOpen,
  onClose,
  menu,
  tables,
  onSelectScreen,
  onSelectTable,
  onAskChatbot
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open handled by parent, but if inside, close
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const q = query.toLowerCase().trim()

  // Filtered menu items
  const matchedMenu = q
    ? menu.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.nameHindi && m.nameHindi.toLowerCase().includes(q)) ||
        m.shortCode.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      ).slice(0, 5)
    : []

  // Filtered tables
  const matchedTables = q
    ? tables.filter(t => t.number.toLowerCase().includes(q) || t.section.toLowerCase().includes(q)).slice(0, 4)
    : []

  // Quick navigation destinations
  const navShortcuts = [
    { title: 'Order Taking (Waiter)', screen: 'waiter', icon: '📱', match: ['order', 'waiter', 'table', 'dine'] },
    { title: 'Kitchen Display System (KDS)', screen: 'kitchen', icon: '🍳', match: ['kitchen', 'kds', 'cook', 'rasoi', 'ticket'] },
    { title: 'Billing Counter', screen: 'counter', icon: '🧾', match: ['counter', 'bill', 'billing', 'pay', 'hisab'] },
    { title: 'Pantry & Grocery Audit', screen: 'manager', icon: '📦', match: ['pantry', 'grocery', 'stock', 'ration', 'audit'] },
    { title: 'Network Printers (IP:9100)', screen: 'manager', icon: '🖨️', match: ['printer', 'ip', 'print', 'paper'] },
    { title: 'GST & Tax Settings', screen: 'manager', icon: '🏛️', match: ['gst', 'tax', 'rate', 'admin'] }
  ]

  const matchedNav = q
    ? navShortcuts.filter(s => s.match.some(m => m.includes(q) || q.includes(m)))
    : navShortcuts.slice(0, 4)

  const handleRunBot = () => {
    if (!query.trim()) return
    onClose()
    onAskChatbot(query)
  }

  return (
    <div className="askbar-backdrop" onClick={onClose}>
      <div className="askbar-modal" onClick={e => e.stopPropagation()}>
        <div className="askbar-input-wrapper">
          <span className="askbar-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="askbar-input"
            placeholder="Type dish name, table, module or question (e.g. 'chai', 'table 2', 'sales')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (matchedMenu.length > 0) {
                  onSelectScreen('waiter')
                  onClose()
                } else if (matchedTables.length > 0 && onSelectTable) {
                  onSelectTable(matchedTables[0].id)
                  onSelectScreen('waiter')
                  onClose()
                } else if (matchedNav.length > 0) {
                  onSelectScreen(matchedNav[0].screen)
                  onClose()
                } else {
                  handleRunBot()
                }
              }
            }}
          />
          <button className="askbar-close-btn" onClick={onClose}>Esc</button>
        </div>

        <div className="askbar-results">
          {/* Ask Chatbot Option */}
          {query.trim().length > 1 && (
            <div className="askbar-section">
              <div className="askbar-section-title">AI / Support Assistance</div>
              <button className="askbar-item is-bot" onClick={handleRunBot}>
                <span className="askbar-item-icon">🤖</span>
                <div className="askbar-item-info">
                  <strong>Ask Assistant: "{query}"</strong>
                  <small>Get automated troubleshooting, policy guide or live calculation</small>
                </div>
                <span className="askbar-action-pill">Ask &rarr;</span>
              </button>
            </div>
          )}

          {/* Matched Dishes */}
          {matchedMenu.length > 0 && (
            <div className="askbar-section">
              <div className="askbar-section-title">Menu Dishes</div>
              {matchedMenu.map(item => (
                <button
                  key={item.id}
                  className="askbar-item"
                  onClick={() => {
                    onSelectScreen('waiter')
                    onClose()
                  }}
                >
                  <span className="askbar-item-icon">{item.isVeg ? '🟢' : '🔴'}</span>
                  <div className="askbar-item-info">
                    <strong>{item.name} {item.nameHindi && <span className="hindi-label">({item.nameHindi})</span>}</strong>
                    <small>{item.category} • Code: {item.shortCode} • Station: {item.station}</small>
                  </div>
                  <span className="askbar-price">{formatINR(item.pricePaise)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Tables */}
          {matchedTables.length > 0 && (
            <div className="askbar-section">
              <div className="askbar-section-title">Tables & Sections</div>
              {matchedTables.map(t => (
                <button
                  key={t.id}
                  className="askbar-item"
                  onClick={() => {
                    if (onSelectTable) onSelectTable(t.id)
                    onSelectScreen('waiter')
                    onClose()
                  }}
                >
                  <span className="askbar-item-icon">🪑</span>
                  <div className="askbar-item-info">
                    <strong>{t.number} ({t.section})</strong>
                    <small>Status: {t.status} • Capacity: {t.capacity} covers</small>
                  </div>
                  <span className={`status-badge status-${t.status.toLowerCase()}`}>{t.status}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Shortcuts */}
          {matchedNav.length > 0 && (
            <div className="askbar-section">
              <div className="askbar-section-title">Fast Module Navigation</div>
              {matchedNav.map((nav, idx) => (
                <button
                  key={idx}
                  className="askbar-item"
                  onClick={() => {
                    onSelectScreen(nav.screen)
                    onClose()
                  }}
                >
                  <span className="askbar-item-icon">{nav.icon}</span>
                  <div className="askbar-item-info">
                    <strong>{nav.title}</strong>
                    <small>Jump directly to {nav.screen} workspace</small>
                  </div>
                  <span className="askbar-action-pill">Open</span>
                </button>
              ))}
            </div>
          )}

          {!q && (
            <div className="askbar-hints">
              <p>💡 Tip: Type short codes like <code>MC</code> for Masala Chai, <code>table 2</code>, <code>sales</code>, <code>pantry</code>, or <code>check printers</code>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


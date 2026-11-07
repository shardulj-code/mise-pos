import React from 'react'
import type { DeviceRole, Organisation, PrinterDevice } from '../types'

interface NavbarProps {
  org: Organisation | null
  activeRole: DeviceRole
  currentScreen: string
  printers: PrinterDevice[]
  onSelectScreen: (screen: string) => void
  onSelectRole: (role: DeviceRole) => void
  onOpenAskBar: () => void
  onToggleChatbot: () => void
  onOpenOrgModal: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  org,
  activeRole,
  currentScreen,
  printers,
  onSelectScreen,
  onSelectRole,
  onOpenAskBar,
  onToggleChatbot,
  onOpenOrgModal
}) => {
  const onlinePrinters = printers.filter(p => p.status === 'ONLINE').length
  const totalPrinters = printers.length

  const handleRoleSelect = (role: DeviceRole, screen: string) => {
    onSelectRole(role)
    onSelectScreen(screen)
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="wordmark" onClick={() => onSelectScreen('counter')} title="Mise Restaurant Operating System">
            mise
          </button>
          <span className="live-state" title="Zero cloud latency. Works 100% offline.">
            <span className="state-mark" aria-hidden="true" />
            <span>Local Engine</span>
          </span>
          {org && (
            <button className="org-pill" onClick={onOpenOrgModal} title="Manage Organisation & Module Codes">
              <span className="org-name">{org.name}</span>
              <span className="org-switch-hint">⚙️ Codes</span>
            </button>
          )}
        </div>

        {/* Desktop Search Bar (Ctrl+K) */}
        <div className="topbar-center">
          <button className="ask-bar-trigger" onClick={onOpenAskBar} title="Search everything or type a command (Ctrl+K)">
            <span className="search-icon">🔍</span>
            <span className="search-placeholder">Search dishes, tables, bills or ask anything...</span>
            <kbd className="search-kbd">Ctrl+K</kbd>
          </button>
        </div>

        <div className="topbar-right">
          {/* Mobile Search Button (visible <= 768px) */}
          <button 
            className="topbar-mobile-search-btn" 
            onClick={onOpenAskBar} 
            title="Search dishes & commands (Ctrl+K)"
            aria-label="Search"
          >
            🔍
          </button>

          {/* Printer Network Status Pill */}
          <div
            className={`printer-health-pill ${onlinePrinters === totalPrinters ? 'is-good' : 'is-warning'}`}
            title={`IP Thermal Printers: ${onlinePrinters}/${totalPrinters} reachable on port 9100`}
            onClick={() => onSelectScreen('manager')}
            role="button"
            tabIndex={0}
          >
            <span className="printer-icon">🖨️</span>
            <span className="printer-text">IP Printers {onlinePrinters}/{totalPrinters}</span>
          </div>

          {/* Desktop Role Selector Tabs */}
          <div className="role-switcher" title="Active Device Mode">
            <button
              className={`role-tab ${currentScreen === 'waiter' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('WAITER', 'waiter')}
            >
              📱 Waiter
            </button>
            <button
              className={`role-tab ${currentScreen === 'kitchen' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('KITCHEN', 'kitchen')}
            >
              🍳 Kitchen (KDS)
            </button>
            <button
              className={`role-tab ${currentScreen === 'counter' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('COUNTER', 'counter')}
            >
              🧾 Counter
            </button>
            <button
              className={`role-tab ${currentScreen === 'manager' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('MANAGER', 'manager')}
            >
              📊 Manager
            </button>
          </div>

          {/* 24/7 Support Chatbot Trigger */}
          <button className="chatbot-toggle-button" onClick={onToggleChatbot} title="Open 24/7 Self-Service Assistant">
            <span className="chatbot-icon">🤖</span>
            <span className="chatbot-label">Mise Assistant</span>
          </button>
        </div>
      </header>

      {/* Cross-Platform Mobile Bottom Navigation (Phones & Tablets) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          className={`bottom-nav-item ${currentScreen === 'waiter' ? 'active' : ''}`}
          onClick={() => handleRoleSelect('WAITER', 'waiter')}
          aria-label="Waiter Ordering"
        >
          <span className="bottom-nav-icon">📱</span>
          <span className="bottom-nav-label">Waiter</span>
        </button>

        <button
          className={`bottom-nav-item ${currentScreen === 'kitchen' ? 'active' : ''}`}
          onClick={() => handleRoleSelect('KITCHEN', 'kitchen')}
          aria-label="Kitchen Display System"
        >
          <span className="bottom-nav-icon">🍳</span>
          <span className="bottom-nav-label">Kitchen</span>
        </button>

        <button
          className={`bottom-nav-item ${currentScreen === 'counter' ? 'active' : ''}`}
          onClick={() => handleRoleSelect('COUNTER', 'counter')}
          aria-label="Billing Counter"
        >
          <span className="bottom-nav-icon">🧾</span>
          <span className="bottom-nav-label">Counter</span>
        </button>

        <button
          className={`bottom-nav-item ${currentScreen === 'manager' ? 'active' : ''}`}
          onClick={() => handleRoleSelect('MANAGER', 'manager')}
          aria-label="Manager & Reports"
        >
          <span className="bottom-nav-icon">📊</span>
          <span className="bottom-nav-label">Manager</span>
        </button>
      </nav>
    </>
  )
}

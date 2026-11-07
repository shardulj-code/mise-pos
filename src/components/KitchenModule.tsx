import React, { useState } from 'react'
import type { KOT, MenuItem } from '../types'

interface KitchenModuleProps {
  kots: KOT[]
  menu: MenuItem[]
  onUpdateKotStatus: (kotId: string, status: KOT['status']) => void
  onToggleItemAvailability: (itemId: string, available: boolean) => void
  onPrintKot: (kot: KOT) => void
  onToast: (msg: string) => void
}

export const KitchenModule: React.FC<KitchenModuleProps> = ({
  kots,
  menu,
  onUpdateKotStatus,
  onToggleItemAvailability,
  onPrintKot,
  onToast
}) => {
  const [stationFilter, setStationFilter] = useState<string>('All')
  const [show86Modal, setShow86Modal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [mobileColTab, setMobileColTab] = useState<'all' | 'new' | 'cooking' | 'ready'>('all')

  const stations = ['All', 'Kitchen', 'Tandoor', 'Bar', 'Dessert']

  const filteredKots = kots.filter(k =>
    stationFilter === 'All' ? true : k.station.toLowerCase() === stationFilter.toLowerCase()
  )

  const newTickets = filteredKots.filter(k => k.status === 'NEW')
  const cookingTickets = filteredKots.filter(k => k.status === 'COOKING')
  const readyTickets = filteredKots.filter(k => k.status === 'READY')

  const getElapsedTime = (createdMs: number) => {
    const elapsedMinutes = Math.floor((Date.now() - createdMs) / 60000)
    if (elapsedMinutes < 1) return 'Just now'
    return `${elapsedMinutes}m ago`
  }

  const getTimerClass = (createdMs: number) => {
    const elapsedMinutes = Math.floor((Date.now() - createdMs) / 60000)
    if (elapsedMinutes >= 15) return 'timer-critical' // red
    if (elapsedMinutes >= 8) return 'timer-warning'   // amber
    return 'timer-normal'                             // green
  }

  const renderTicketCard = (kot: KOT) => {
    return (
      <article key={kot.id} className="kds-ticket-card">
        <div className="ticket-top-bar">
          <div className="ticket-header-title">
            <span className="table-badge">{kot.table}</span>
            <span className="station-badge">{kot.station}</span>
          </div>
          <div className={`ticket-timer ${getTimerClass(kot.createdAt)}`}>
            ⏱️ {getElapsedTime(kot.createdAt)}
          </div>
        </div>

        <div className="ticket-meta-info">
          <span>KOT #{kot.kotNumber}</span>
          <span>{kot.type}</span>
          <span className={`print-tag ${kot.printed ? 'printed' : 'pending'}`}>
            {kot.printed ? '🖨️ Printed' : '⏳ Pending'}
          </span>
        </div>

        <ul className="ticket-items-list">
          {kot.lines.map(line => (
            <li key={line.id} className={`ticket-line ${line.action === 'CANCEL' ? 'is-cancelled' : ''}`}>
              <div className="line-row">
                <span className="item-qty">{line.qty} ×</span>
                <strong className="item-name">{line.name}</strong>
              </div>
              {line.notes && <div className="item-note">Note: {line.notes}</div>}
              {line.action === 'CANCEL' && <span className="cancel-pill">CANCELLED BY WAITER</span>}
            </li>
          ))}
        </ul>

        <div className="ticket-actions">
          {kot.status === 'NEW' && (
            <button
              className="kds-btn btn-start"
              onClick={() => {
                onUpdateKotStatus(kot.id, 'COOKING')
                onToast(`Started preparing KOT #${kot.kotNumber} for ${kot.table}.`)
              }}
            >
              🔥 Start Prep
            </button>
          )}

          {kot.status === 'COOKING' && (
            <button
              className="kds-btn btn-ready"
              onClick={() => {
                onUpdateKotStatus(kot.id, 'READY')
                onToast(`✅ KOT #${kot.kotNumber} for ${kot.table} marked Ready to Serve!`)
              }}
            >
              🛎️ Mark Ready
            </button>
          )}

          {kot.status === 'READY' && (
            <button
              className="kds-btn btn-served"
              onClick={() => {
                onUpdateKotStatus(kot.id, 'SERVED')
                onToast(`KOT #${kot.kotNumber} dispatched to guests.`)
              }}
            >
              ✔️ Served & Clear
            </button>
          )}

          <button
            className="kds-btn btn-print-mini"
            title="Thermal print KOT to Station IP printer"
            onClick={() => onPrintKot(kot)}
          >
            🖨️
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="kitchen-kds-layout">
      {/* Top KDS Control Bar */}
      <div className="kds-control-bar">
        <div className="kds-title-group">
          <h1>🍳 Kitchen Display System (KDS)</h1>
          <span className="live-pill">Live LAN Pass</span>
        </div>

        <div className="kds-actions-group">
          {/* Station Filters */}
          <div className="station-pills">
            {stations.map(st => (
              <button
                key={st}
                className={`st-pill ${stationFilter === st ? 'is-active' : ''}`}
                onClick={() => setStationFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              onToast(soundEnabled ? 'KDS order chime muted.' : 'KDS order chime enabled.')
            }}
          >
            {soundEnabled ? '🔔 Chime: On' : '🔕 Chime: Off'}
          </button>

          <button className="danger-button-outline" onClick={() => setShow86Modal(true)}>
            🚫 86 Dishes
          </button>
        </div>
      </div>

      {/* Mobile Column Tabs (<= 768px) */}
      <div className="kds-mobile-col-tabs">
        <button
          className={`kds-col-tab-btn ${mobileColTab === 'all' ? 'active' : ''}`}
          onClick={() => setMobileColTab('all')}
        >
          All ({filteredKots.length})
        </button>
        <button
          className={`kds-col-tab-btn ${mobileColTab === 'new' ? 'active' : ''}`}
          onClick={() => setMobileColTab('new')}
        >
          ⏳ New ({newTickets.length})
        </button>
        <button
          className={`kds-col-tab-btn ${mobileColTab === 'cooking' ? 'active' : ''}`}
          onClick={() => setMobileColTab('cooking')}
        >
          🔥 Cooking ({cookingTickets.length})
        </button>
        <button
          className={`kds-col-tab-btn ${mobileColTab === 'ready' ? 'active' : ''}`}
          onClick={() => setMobileColTab('ready')}
        >
          🛎️ Ready ({readyTickets.length})
        </button>
      </div>

      {/* 3 Columns: New / Cooking / Ready */}
      <div className="kds-columns-board">
        {/* Column 1: New / Pending */}
        {(mobileColTab === 'all' || mobileColTab === 'new') && (
          <section className="kds-column col-new">
            <div className="kds-column-header">
              <h2>⏳ New Orders ({newTickets.length})</h2>
              <small>Awaiting chef confirmation</small>
            </div>
            <div className="kds-cards-scroller">
              {newTickets.length === 0 ? (
                <div className="column-empty-state">No new tickets. All clear!</div>
              ) : (
                newTickets.map(renderTicketCard)
              )}
            </div>
          </section>
        )}

        {/* Column 2: Cooking */}
        {(mobileColTab === 'all' || mobileColTab === 'cooking') && (
          <section className="kds-column col-cooking">
            <div className="kds-column-header">
              <h2>🔥 In Kitchen ({cookingTickets.length})</h2>
              <small>Actively preparing on gas / tandoor</small>
            </div>
            <div className="kds-cards-scroller">
              {cookingTickets.length === 0 ? (
                <div className="column-empty-state">No active cooking tickets.</div>
              ) : (
                cookingTickets.map(renderTicketCard)
              )}
            </div>
          </section>
        )}

        {/* Column 3: Ready */}
        {(mobileColTab === 'all' || mobileColTab === 'ready') && (
          <section className="kds-column col-ready">
            <div className="kds-column-header">
              <h2>🛎️ Ready for Pick-up ({readyTickets.length})</h2>
              <small>Plated and ready for waiters to pick up</small>
            </div>
            <div className="kds-cards-scroller">
              {readyTickets.length === 0 ? (
                <div className="column-empty-state">No ready tickets awaiting pickup.</div>
              ) : (
                readyTickets.map(renderTicketCard)
              )}
            </div>
          </section>
        )}
      </div>

      {/* 86 Dishes Modal */}
      {show86Modal && (
        <div className="modal-backdrop" onClick={() => setShow86Modal(false)}>
          <div className="modal-content kds-86-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚫 86 Item Availability Manager</h3>
              <button className="modal-close-btn" onClick={() => setShow86Modal(false)}>✕</button>
            </div>
            <p className="modal-subtitle">
              If an ingredient runs out in the kitchen, toggle the item off here. Waiters will immediately see it marked 'Sold Out' and cannot order it.
            </p>

            <div className="item-86-grid">
              {menu.map(item => (
                <div key={item.id} className="item-86-row">
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.category} • {item.station}</small>
                  </div>
                  <button
                    className={`toggle-86-btn ${item.available ? 'is-available' : 'is-disabled'}`}
                    onClick={() => {
                      onToggleItemAvailability(item.id, !item.available)
                      onToast(item.available ? `86'd: '${item.name}' marked OUT OF STOCK.` : `Restored: '${item.name}' available.`)
                    }}
                  >
                    {item.available ? '🟢 In Stock' : '🔴 86 (Out of Stock)'}
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-actions-row">
              <button className="primary-button" onClick={() => setShow86Modal(false)}>
                Done & Return to KDS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

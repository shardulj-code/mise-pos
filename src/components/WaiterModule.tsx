import React, { useState } from 'react'
import type { TableItem, MenuItem, Order, OrderLine } from '../types'
import { formatINR } from '../gstEngine'

interface WaiterModuleProps {
  tables: TableItem[]
  menu: MenuItem[]
  orders: Order[]
  onSaveOrder: (order: Order) => void
  onSendKot: (orderId: string) => void
  onToast: (msg: string) => void
  selectedTableId?: string
}

export const WaiterModule: React.FC<WaiterModuleProps> = ({
  tables,
  menu,
  orders,
  onSaveOrder,
  onSendKot,
  onToast,
  selectedTableId
}) => {
  const [activeTableId, setActiveTableId] = useState<string>(selectedTableId || tables[0]?.id || 't_1')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [guestCount, setGuestCount] = useState<number>(2)
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart'>('menu')

  const activeTable = tables.find(t => t.id === activeTableId) || tables[0]
  const currentOrder = orders.find(o => o.tableId === activeTableId && o.status !== 'PAID' && o.status !== 'CANCELLED')

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))]

  const filteredMenu = menu.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
    const q = search.toLowerCase().trim()
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      (item.nameHindi && item.nameHindi.toLowerCase().includes(q)) ||
      item.shortCode.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  // Cart operations
  const currentLines = currentOrder?.lines || []
  const totalCartQty = currentLines.reduce((s, l) => s + l.qty, 0)
  const orderTotalPaise = currentLines.reduce((sum, l) => sum + l.pricePaise * l.qty, 0)
  const unsentCount = currentLines.filter(l => !l.sentToKitchen).length

  const handleAddItem = (item: MenuItem) => {
    if (!item.available) {
      onToast(`'${item.name}' is currently 86'd (out of stock in kitchen).`)
      return
    }

    let updatedOrder: Order
    const existingIndex = currentLines.findIndex(l => l.menuItemId === item.id && !l.sentToKitchen)

    if (currentOrder) {
      let newLines: OrderLine[]
      if (existingIndex >= 0) {
        newLines = currentLines.map((l, idx) =>
          idx === existingIndex ? { ...l, qty: l.qty + 1 } : l
        )
      } else {
        const newLine: OrderLine = {
          id: `ol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          menuItemId: item.id,
          name: item.name,
          pricePaise: item.pricePaise,
          qty: 1,
          station: item.station,
          sentToKitchen: false
        }
        newLines = [...currentLines, newLine]
      }
      updatedOrder = {
        ...currentOrder,
        lines: newLines,
        updatedAt: Date.now()
      }
    } else {
      // Create new order for this table
      const newLine: OrderLine = {
        id: `ol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        menuItemId: item.id,
        name: item.name,
        pricePaise: item.pricePaise,
        qty: 1,
        station: item.station,
        sentToKitchen: false
      }
      updatedOrder = {
        id: `ord_${Date.now()}`,
        orderNo: Math.floor(100 + Math.random() * 900),
        tableId: activeTable.id,
        tableName: activeTable.number,
        type: activeTable.number.toLowerCase().includes('takeaway') ? 'TAKEAWAY' : 'DINE_IN',
        status: 'OPEN',
        lines: [newLine],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        guestCount,
        waiterName: 'Staff'
      }
    }

    onSaveOrder(updatedOrder)
  }

  const handleChangeQty = (lineId: string, delta: number) => {
    if (!currentOrder) return

    const line = currentOrder.lines.find(l => l.id === lineId)
    if (!line) return

    if (line.sentToKitchen && delta < 0) {
      onToast('Item already sent to kitchen. Post-KOT void requires manager confirmation.')
      return
    }

    const newLines = currentOrder.lines
      .map(l => (l.id === lineId ? { ...l, qty: l.qty + delta } : l))
      .filter(l => l.qty > 0)

    const updatedOrder: Order = {
      ...currentOrder,
      lines: newLines,
      status: newLines.length === 0 ? 'OPEN' : currentOrder.status,
      updatedAt: Date.now()
    }
    onSaveOrder(updatedOrder)
  }

  const handleSendToKitchen = () => {
    if (!currentOrder || currentOrder.lines.length === 0) {
      onToast('Please add items before sending an order to the kitchen.')
      return
    }

    const unsentLines = currentOrder.lines.filter(l => !l.sentToKitchen)
    if (unsentLines.length === 0) {
      onToast('All items have already been sent to kitchen.')
      return
    }

    onSendKot(currentOrder.id)
    onToast(`✅ KOT sent to Kitchen & Stations for ${activeTable.number}!`)
  }

  return (
    <div className="waiter-layout">
      {/* 1. Table Rail / Map */}
      <div className="waiter-table-rail" role="tablist" aria-label="Restaurant tables">
        {tables.map(t => {
          const isCurrent = t.id === activeTableId
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isCurrent}
              className={`table-pill status-${t.status.toLowerCase()} ${isCurrent ? 'is-current' : ''}`}
              onClick={() => {
                setActiveTableId(t.id)
                // Stay on current mobile tab
              }}
            >
              <div className="pill-top">
                <span className="pill-num">{t.number}</span>
                <span className="pill-status-dot" />
              </div>
              <small className="pill-desc">{t.status} • {t.section}</small>
            </button>
          )
        })}
      </div>

      {/* Mobile Toggle: Menu vs Cart */}
      <div className="waiter-mobile-view-toggle">
        <button
          className={`toggle-view-btn ${mobileTab === 'menu' ? 'active' : ''}`}
          onClick={() => setMobileTab('menu')}
        >
          🍽️ Menu Dishes ({filteredMenu.length})
        </button>
        <button
          className={`toggle-view-btn ${mobileTab === 'cart' ? 'active' : ''}`}
          onClick={() => setMobileTab('cart')}
        >
          🛒 {activeTable.number} Ticket ({totalCartQty})
        </button>
      </div>

      <div className="waiter-workspace-grid">
        {/* 2. Menu Catalog Area */}
        <section 
          className="waiter-menu-section"
          style={{ display: mobileTab === 'cart' ? undefined : undefined }}
        >
          <div className="menu-header-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search dish name, Hindi name, or code (e.g. MC, VP, Biryani)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
            </div>

            {/* Category Filter Chips */}
            <div className="category-chips-row">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-cards-grid">
            {filteredMenu.map(item => {
              const inCartQty = currentLines
                .filter(l => l.menuItemId === item.id)
                .reduce((s, l) => s + l.qty, 0)

              return (
                <article
                  key={item.id}
                  className={`dish-card ${!item.available ? 'is-86' : ''}`}
                  onClick={() => handleAddItem(item)}
                >
                  <div className="dish-top">
                    <span className={`veg-tag ${item.isVeg ? 'veg' : 'non-veg'}`}>
                      {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                    <span className="dish-station">{item.station}</span>
                  </div>

                  <h3 className="dish-title">
                    {item.name}
                    {item.nameHindi && <span className="dish-hindi">{item.nameHindi}</span>}
                  </h3>

                  <div className="dish-bottom">
                    <span className="dish-price">{formatINR(item.pricePaise)}</span>
                    <span className="dish-code">{item.shortCode}</span>
                    {item.available ? (
                      <button className="add-btn" aria-label={`Add ${item.name}`}>
                        {inCartQty > 0 ? `+ (${inCartQty})` : '+ Add'}
                      </button>
                    ) : (
                      <span className="badge-out">86'd (Sold Out)</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* 3. Table Order & Cart Sidebar */}
        <aside className="waiter-cart-panel" aria-label="Current Table Order">
          <div className="cart-header">
            <div>
              <h2>{activeTable.number}</h2>
              <span className="cart-meta">{activeTable.section} • Status: {activeTable.status}</span>
            </div>
            <div className="guest-selector">
              <label>Covers:</label>
              <select value={guestCount} onChange={e => setGuestCount(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                  <option key={n} value={n}>{n} Guests</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cart-lines-scroller">
            {currentLines.length === 0 ? (
              <div className="cart-empty-state">
                <span className="empty-icon">🍽️</span>
                <strong>No dishes added yet</strong>
                <p>Tap any item from the menu to punch this order for {activeTable.number}.</p>
              </div>
            ) : (
              currentLines.map(line => (
                <div key={line.id} className={`order-line-item ${line.sentToKitchen ? 'is-sent' : 'is-draft'}`}>
                  <div className="line-details">
                    <div className="line-title-row">
                      <strong>{line.name}</strong>
                      <span className="line-badge">{line.sentToKitchen ? '🍳 In Kitchen' : '📝 Unsent Draft'}</span>
                    </div>
                    <div className="line-price-info">
                      <span>{formatINR(line.pricePaise)} each</span>
                      <span className="line-station-tag">{line.station}</span>
                    </div>
                  </div>

                  <div className="line-controls">
                    <button
                      className="qty-btn minus"
                      disabled={line.sentToKitchen && line.qty <= 1}
                      onClick={() => handleChangeQty(line.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{line.qty}</span>
                    <button
                      className="qty-btn plus"
                      onClick={() => handleChangeQty(line.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="line-total">
                    {formatINR(line.pricePaise * line.qty)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-totals-row">
              <span>Running Subtotal</span>
              <strong>{formatINR(orderTotalPaise)}</strong>
            </div>

            <button
              className="send-kot-button"
              disabled={unsentCount === 0}
              onClick={handleSendToKitchen}
            >
              <span>🚀 Send to Kitchen</span>
              <span>{unsentCount > 0 ? `(${unsentCount} New Items)` : 'All Sent'}</span>
            </button>

            <p className="cart-reassurance">
              Orders are immediately saved locally and dispatched to kitchen station printers.
            </p>
          </div>
        </aside>
      </div>

      {/* Floating Cart Button for Quick Mobile Access */}
      {totalCartQty > 0 && (
        <div 
          className="mobile-floating-cart-bar" 
          onClick={() => setMobileTab('cart')}
          style={{ display: mobileTab === 'menu' ? 'flex' : 'none' }}
        >
          <div>
            <strong>🛒 {totalCartQty} Items • {formatINR(orderTotalPaise)}</strong>
            <small style={{ display: 'block', fontSize: '0.72rem', opacity: 0.8 }}>
              {activeTable.number} • {unsentCount} unsent
            </small>
          </div>
          <button className="cart-btn-pill">
            View Ticket &rarr;
          </button>
        </div>
      )}
    </div>
  )
}

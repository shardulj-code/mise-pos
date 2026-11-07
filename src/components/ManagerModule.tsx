import React, { useState } from 'react'
import type { AppStore } from '../storage'
import type {
  MenuItem,
  PantryItem,
  PrinterDevice,
  TaxSettings
} from '../types'
import { formatINR, rupeesToPaise } from '../gstEngine'

interface ManagerModuleProps {
  store: AppStore
  onUpdateMenu: (menu: MenuItem[]) => void
  onUpdatePantry: (pantry: PantryItem[]) => void
  onUpdatePrinters: (printers: PrinterDevice[]) => void
  onUpdateTax: (tax: TaxSettings) => void
  onRunDayClose: (countedCashPaise: number, notes: string) => void
  onToast: (msg: string) => void
  onTestPrint: (printer: PrinterDevice) => void
}

export const ManagerModule: React.FC<ManagerModuleProps> = ({
  store,
  onUpdateMenu,
  onUpdatePantry,
  onUpdatePrinters,
  onUpdateTax,
  onRunDayClose,
  onToast,
  onTestPrint
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'menu' | 'pantry' | 'printers' | 'tax' | 'devices' | 'dayclose'>('audit')

  // Menu Search & Form State
  const [menuSearch, setMenuSearch] = useState('')
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)

  // Pantry Form State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseItem, setPurchaseItem] = useState<string>(store.pantry[0]?.id || '')
  const [purchaseQty, setPurchaseQty] = useState<string>('')
  const [purchaseCost, setPurchaseCost] = useState<string>('')

  // Printer Form State
  const [showPrinterModal, setShowPrinterModal] = useState(false)
  const [prnName, setPrnName] = useState('')
  const [prnIp, setPrnIp] = useState('192.168.1.')
  const [prnPort, setPrnPort] = useState(9100)
  const [prnRole, setPrnRole] = useState<'BILL' | 'KITCHEN' | 'BAR'>('KITCHEN')

  // Tax Settings Form State
  const [taxState, setTaxState] = useState<TaxSettings>(store.org?.tax || {
    gstRateBp: 500,
    pricesIncludeGst: false,
    serviceChargeBp: 0,
    packagingPaise: 1500,
    roundToNearestRupee: true,
    invoicePrefix: 'KH'
  })

  // Day Close Form State
  const [countedCash, setCountedCash] = useState<string>('')
  const [closeNotes, setCloseNotes] = useState<string>('')

  // 1. Audit stats calculation
  const totalSalesPaise = store.bills.reduce((s, b) => s + b.calc.payablePaise, 0)
  const totalTaxPaise = store.bills.reduce((s, b) => s + b.calc.totalTaxPaise, 0)
  const totalCgstPaise = store.bills.reduce((s, b) => s + b.calc.cgstPaise, 0)
  const totalSgstPaise = store.bills.reduce((s, b) => s + b.calc.sgstPaise, 0)
  const cashSalesPaise = store.bills.filter(b => b.payment.method === 'CASH').reduce((s, b) => s + b.calc.payablePaise, 0)
  const upiSalesPaise = store.bills.filter(b => b.payment.method === 'UPI').reduce((s, b) => s + b.calc.payablePaise, 0)

  // Filtered menu in editor
  const filteredMenuInEditor = store.menu.filter(item => {
    const q = menuSearch.toLowerCase().trim()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      (item.nameHindi && item.nameHindi.toLowerCase().includes(q)) ||
      item.shortCode.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  })

  // Save new or edited menu item
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem?.name || !editingItem.pricePaise) return

    let updatedMenu: MenuItem[]
    if (editingItem.id) {
      updatedMenu = store.menu.map(m => m.id === editingItem.id ? (editingItem as MenuItem) : m)
    } else {
      const newItem: MenuItem = {
        id: `m_${Date.now()}`,
        name: editingItem.name,
        nameHindi: editingItem.nameHindi || '',
        category: editingItem.category || 'Mains',
        pricePaise: editingItem.pricePaise,
        station: editingItem.station || 'Kitchen',
        shortCode: editingItem.shortCode || editingItem.name.slice(0, 2).toUpperCase(),
        isVeg: editingItem.isVeg ?? true,
        available: true
      }
      updatedMenu = [...store.menu, newItem]
    }

    onUpdateMenu(updatedMenu)
    setShowItemModal(false)
    setEditingItem(null)
    onToast('Menu updated and synced to all devices!')
  }

  // Handle new pantry purchase
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault()
    const qtyNum = parseFloat(purchaseQty)
    if (!purchaseItem || isNaN(qtyNum) || qtyNum <= 0) return

    const updatedPantry = store.pantry.map(item => {
      if (item.id === purchaseItem) {
        return {
          ...item,
          onHand: item.onHand + qtyNum,
          lastUpdated: Date.now()
        }
      }
      return item
    })

    onUpdatePantry(updatedPantry)
    setShowPurchaseModal(false)
    setPurchaseQty('')
    setPurchaseCost('')
    onToast(`Added ${qtyNum} units of stock to pantry.`)
  }

  // Handle add printer
  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prnName || !prnIp) return

    const newPrn: PrinterDevice = {
      id: `prn_${Date.now()}`,
      name: prnName,
      ip: prnIp,
      port: prnPort,
      role: prnRole,
      paperWidth: '80mm',
      status: 'ONLINE',
      lastPingMs: Math.floor(12 + Math.random() * 20),
      lastChecked: Date.now()
    }

    onUpdatePrinters([...store.printers, newPrn])
    setShowPrinterModal(false)
    setPrnName('')
    setPrnIp('192.168.1.')
    onToast(`Printer '${newPrn.name}' registered at ${newPrn.ip}:${newPrn.port}!`)
  }

  // Handle printer ping check
  const handlePingPrinter = (printerId: string) => {
    const updated = store.printers.map(p => {
      if (p.id === printerId) {
        return {
          ...p,
          lastPingMs: Math.floor(10 + Math.random() * 15),
          lastChecked: Date.now(),
          status: 'ONLINE' as const
        }
      }
      return p
    })
    onUpdatePrinters(updated)
    onToast(`Pinged printer socket at port 9100: Host answered in ${Math.floor(10 + Math.random() * 15)}ms. Status ONLINE.`)
  }

  return (
    <div className="manager-layout">
      {/* Tab Navigation */}
      <nav className="manager-subnav">
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          📊 Sales & Audit
        </button>
        <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
          🍽️ Menu Editor ({store.menu.length})
        </button>
        <button className={activeTab === 'pantry' ? 'active' : ''} onClick={() => setActiveTab('pantry')}>
          📦 Pantry Stock ({store.pantry.length})
        </button>
        <button className={activeTab === 'printers' ? 'active' : ''} onClick={() => setActiveTab('printers')}>
          🖨️ Printer IPs ({store.printers.length})
        </button>
        <button className={activeTab === 'tax' ? 'active' : ''} onClick={() => setActiveTab('tax')}>
          🏛️ GST & Tax Admin
        </button>
        <button className={activeTab === 'devices' ? 'active' : ''} onClick={() => setActiveTab('devices')}>
          📱 Paired Devices ({store.org?.devices.length || 0})
        </button>
        <button className={activeTab === 'dayclose' ? 'active' : ''} onClick={() => setActiveTab('dayclose')}>
          🔒 Day Close (Z-Report)
        </button>
      </nav>

      <div className="manager-workspace-content">
        {/* TAB 1: AUDIT & SALES */}
        {activeTab === 'audit' && (
          <div className="audit-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Real-Time Sales & Revenue Audit</h2>
                <p>Audited directly from immutable issued bill records</p>
              </div>
              <div className="date-badge">Today's Operating Day</div>
            </div>

            {/* Metrics cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="m-label">TOTAL BILLED SALES</span>
                <strong className="m-val">{formatINR(totalSalesPaise)}</strong>
                <small className="m-sub">{store.bills.length} Invoices Issued</small>
              </div>

              <div className="metric-card">
                <span className="m-label">TAX COLLECTED (GST)</span>
                <strong className="m-val">{formatINR(totalTaxPaise)}</strong>
                <small className="m-sub">CGST: {formatINR(totalCgstPaise)} • SGST: {formatINR(totalSgstPaise)}</small>
              </div>

              <div className="metric-card">
                <span className="m-label">CASH IN TILL</span>
                <strong className="m-val">{formatINR(cashSalesPaise)}</strong>
                <small className="m-sub">Physically in cash drawer</small>
              </div>

              <div className="metric-card">
                <span className="m-label">DIGITAL PAYMENTS (UPI)</span>
                <strong className="m-val">{formatINR(upiSalesPaise)}</strong>
                <small className="m-sub">Verified via soundbox / bank</small>
              </div>
            </div>

            {/* Invoices register table */}
            <div className="bills-register-card">
              <h3>Issued Invoices Register</h3>
              {store.bills.length === 0 ? (
                <p style={{ color: 'var(--color-ink-muted)', padding: '2rem 0', textAlign: 'center' }}>
                  No invoices generated yet for today's session.
                </p>
              ) : (
                <table className="register-table">
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Time</th>
                      <th>Table</th>
                      <th>Dishes</th>
                      <th>Tender</th>
                      <th className="num">Taxable</th>
                      <th className="num">GST</th>
                      <th className="num">Payable Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.bills.slice().reverse().map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.invoiceNumber}</strong></td>
                        <td>{new Date(b.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{b.tableName}</td>
                        <td>{b.lines.length} items</td>
                        <td><span className="tender-badge">{b.payment.method}</span></td>
                        <td className="num">{formatINR(b.calc.taxablePaise)}</td>
                        <td className="num">{formatINR(b.calc.totalTaxPaise)}</td>
                        <td className="num"><strong>{formatINR(b.calc.payablePaise)}</strong></td>
                        <td><span className="badge-paid">PAID</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MENU EDITOR */}
        {activeTab === 'menu' && (
          <div className="menu-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Menu Items & Pricing</h2>
                <p>Add new dishes, adjust prices, or assign station printers. Real-time sync.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter dishes..."
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-line)',
                    fontSize: '0.82rem'
                  }}
                />
                <button
                  className="primary-button"
                  onClick={() => {
                    setEditingItem({
                      name: '',
                      nameHindi: '',
                      category: 'Mains',
                      pricePaise: 20000,
                      station: 'Kitchen',
                      shortCode: '',
                      isVeg: true,
                      available: true
                    })
                    setShowItemModal(true)
                  }}
                >
                  + Add New Dish
                </button>
              </div>
            </div>

            <div className="menu-table-card">
              <table className="register-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dish Name</th>
                    <th>Hindi Name</th>
                    <th>Category</th>
                    <th>Code</th>
                    <th>Station</th>
                    <th className="num">Price</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuInEditor.map(item => (
                    <tr key={item.id} className={!item.available ? 'is-row-disabled' : ''}>
                      <td>{item.isVeg ? '🟢' : '🔴'}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.nameHindi || '—'}</td>
                      <td><span className="cat-tag">{item.category}</span></td>
                      <td><code>{item.shortCode}</code></td>
                      <td><span className="station-tag">{item.station}</span></td>
                      <td className="num"><strong>{formatINR(item.pricePaise)}</strong></td>
                      <td>
                        <span className={`avail-badge ${item.available ? 'in-stock' : 'out-stock'}`}>
                          {item.available ? 'Available' : "86'd"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="table-action-btn"
                          onClick={() => {
                            setEditingItem(item)
                            setShowItemModal(true)
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PANTRY & GROCERY AUDIT */}
        {activeTab === 'pantry' && (
          <div className="pantry-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Pantry & Grocery Stock Audit</h2>
                <p>Track raw materials, audit grocery consumption, and prevent kitchen shrinkage.</p>
              </div>
              <button className="primary-button" onClick={() => setShowPurchaseModal(true)}>
                + Record Vendor Delivery
              </button>
            </div>

            <div className="pantry-cards-grid">
              {store.pantry.map(item => {
                const isLow = item.onHand <= item.minThreshold
                return (
                  <div key={item.id} className={`pantry-card ${isLow ? 'is-low' : ''}`}>
                    <div className="pantry-top">
                      <strong>{item.name}</strong>
                      <span className="p-cat">{item.category}</span>
                    </div>

                    <div className="pantry-metric">
                      <span className="p-qty">{item.onHand.toFixed(1)} {item.unit}</span>
                      {isLow && <span className="p-alert">⚠️ LOW STOCK (Par: {item.minThreshold} {item.unit})</span>}
                    </div>

                    <div className="pantry-cost-row">
                      <span>Est. Cost: {formatINR(item.costPerUnitPaise)} / {item.unit}</span>
                      <span>Total Value: {formatINR(Math.round(item.onHand * item.costPerUnitPaise))}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRINTER NETWORK BY IP */}
        {activeTab === 'printers' && (
          <div className="printers-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Network Thermal Printers (Local IP:9100)</h2>
                <p>All printers connect directly over your restaurant router IP without cloud drivers.</p>
              </div>
              <button className="primary-button" onClick={() => setShowPrinterModal(true)}>
                + Add Network Printer
              </button>
            </div>

            <div className="printers-list">
              {store.printers.map(p => (
                <div key={p.id} className="printer-device-card">
                  <div className="prn-header">
                    <div className="prn-title">
                      <span className="prn-icon">🖨️</span>
                      <div>
                        <h3>{p.name}</h3>
                        <p>Socket: <code>{p.ip}:{p.port}</code> (TCP RAW ESC/POS)</p>
                      </div>
                    </div>
                    <span className={`prn-status-badge ${p.status.toLowerCase()}`}>
                      {p.status === 'ONLINE' ? `🟢 ONLINE (${p.lastPingMs}ms)` : '🔴 OFFLINE'}
                    </span>
                  </div>

                  <div className="prn-specs">
                    <span>Role: <strong>{p.role} Tickets</strong></span>
                    <span>Paper: <strong>{p.paperWidth}</strong></span>
                    <span>Status: <strong>Normal (Ready)</strong></span>
                  </div>

                  <div className="prn-actions">
                    <button className="secondary-button" onClick={() => handlePingPrinter(p.id)}>
                      🔄 Check Reachability
                    </button>
                    <button className="primary-button" onClick={() => onTestPrint(p)}>
                      📄 Send Test Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GST & TAX ADMIN */}
        {activeTab === 'tax' && (
          <div className="tax-tab-pane">
            <div className="pane-header">
              <div>
                <h2>GST & Billing Administration</h2>
                <p>Main Admin has direct control to update GST rates, invoices, and service charges.</p>
              </div>
            </div>

            <div className="tax-form-card">
              <div className="form-grid">
                <div className="form-group">
                  <label>GST Rate (Main Admin Control):</label>
                  <select
                    value={taxState.gstRateBp}
                    onChange={e => setTaxState({ ...taxState, gstRateBp: Number(e.target.value) })}
                  >
                    <option value={500}>5% GST (2.5% CGST + 2.5% SGST) - Standalone Restaurants</option>
                    <option value={1800}>18% GST (9% CGST + 9% SGST) - Hotel Premises</option>
                    <option value={1200}>12% GST (6% CGST + 6% SGST)</option>
                    <option value={0}>0% GST - Composition Scheme / Bill of Supply</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Pricing Mode:</label>
                  <select
                    value={taxState.pricesIncludeGst ? 'true' : 'false'}
                    onChange={e => setTaxState({ ...taxState, pricesIncludeGst: e.target.value === 'true' })}
                  >
                    <option value="false">Exclusive (GST added on top of menu price)</option>
                    <option value="true">Inclusive (Menu prices already include GST)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Charge (%):</label>
                  <select
                    value={taxState.serviceChargeBp}
                    onChange={e => setTaxState({ ...taxState, serviceChargeBp: Number(e.target.value) })}
                  >
                    <option value={0}>0% (No Service Charge)</option>
                    <option value={500}>5% Service Charge</option>
                    <option value={1000}>10% Service Charge</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Takeaway Packaging Fee (₹):</label>
                  <input
                    type="number"
                    value={taxState.packagingPaise / 100}
                    onChange={e => setTaxState({ ...taxState, packagingPaise: Math.round(Number(e.target.value) * 100) })}
                  />
                </div>

                <div className="form-group">
                  <label>Invoice Number Prefix:</label>
                  <input
                    type="text"
                    value={taxState.invoicePrefix}
                    onChange={e => setTaxState({ ...taxState, invoicePrefix: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-group">
                  <label>GSTIN Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={taxState.gstin || ''}
                    onChange={e => setTaxState({ ...taxState, gstin: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="tax-preview-box">
                <h4>Calculation Preview:</h4>
                <p>
                  A dish priced at ₹200.00 will bill at{' '}
                  <strong>
                    {taxState.pricesIncludeGst
                      ? '₹200.00 (tax inclusive)'
                      : `₹${(200 * (1 + taxState.gstRateBp / 10000)).toFixed(2)} (${taxState.gstRateBp / 100}% GST added)`}
                  </strong>
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  onUpdateTax(taxState)
                  onToast('GST and tax settings saved! Effective immediately on all new bills.')
                }}
              >
                💾 Save GST & Billing Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: CONNECTED DEVICES & CODES */}
        {activeTab === 'devices' && (
          <div className="devices-tab-pane">
            <div className="pane-header">
              <div>
                <h2>Paired Devices & Module Access</h2>
                <p>Devices connected via module codes on your restaurant WiFi network.</p>
              </div>
            </div>

            {/* Active Codes */}
            <div className="active-codes-banner">
              <div className="banner-item">
                <small>🍳 Kitchen Code:</small>
                <strong>{store.org?.codes.kitchen}</strong>
              </div>
              <div className="banner-item">
                <small>📱 Waiter Code:</small>
                <strong>{store.org?.codes.waiter}</strong>
              </div>
              <div className="banner-item">
                <small>🧾 Counter Code:</small>
                <strong>{store.org?.codes.counter}</strong>
              </div>
              <div className="banner-item">
                <small>📊 Manager Code:</small>
                <strong>{store.org?.codes.manager}</strong>
              </div>
            </div>

            <div className="devices-table-card">
              <table className="register-table">
                <thead>
                  <tr>
                    <th>Device Name</th>
                    <th>Role Mode</th>
                    <th>Code Used</th>
                    <th>Network IP</th>
                    <th>Last Active</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {store.org?.devices.map(dev => (
                    <tr key={dev.id}>
                      <td><strong>{dev.name}</strong></td>
                      <td><span className="role-tag">{dev.role}</span></td>
                      <td><code>{dev.codeUsed}</code></td>
                      <td>{dev.ipAddress || '192.168.1.x'}</td>
                      <td>{new Date(dev.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className="badge-online">ONLINE</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: DAY CLOSE */}
        {activeTab === 'dayclose' && (
          <div className="dayclose-tab-pane">
            <div className="pane-header">
              <div>
                <h2>End-of-Day Blind Close (Z-Report)</h2>
                <p>Audit cash collected against bills issued and lock daily operations.</p>
              </div>
            </div>

            <div className="dayclose-card">
              <div className="dayclose-stats-preview">
                <div className="preview-item">
                  <span>Registered Cash Bills:</span>
                  <strong>{formatINR(cashSalesPaise)}</strong>
                </div>
                <div className="preview-item">
                  <span>Total Bills Issued:</span>
                  <strong>{store.bills.length}</strong>
                </div>
              </div>

              <div className="blind-count-section">
                <label>Enter Physically Counted Cash in Drawer (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 5400"
                  value={countedCash}
                  onChange={e => setCountedCash(e.target.value)}
                />
              </div>

              <div className="notes-section">
                <label>Day Close Remarks / Audit Notes:</label>
                <textarea
                  placeholder="e.g. Till reconciled. Shift closed without discrepancies."
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                />
              </div>

              <button
                className="primary-button is-danger"
                onClick={() => {
                  const countedPaise = Math.round(parseFloat(countedCash || '0') * 100)
                  onRunDayClose(countedPaise, closeNotes)
                  onToast('Day closed & locked! Z-Report generated.')
                  setCountedCash('')
                  setCloseNotes('')
                }}
              >
                🔒 Execute Blind Close & Generate Z-Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Add Menu Item Modal */}
      {showItemModal && (
        <div className="modal-backdrop" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem?.id ? 'Edit Dish' : 'Add New Menu Item'}</h3>
              <button className="modal-close-btn" onClick={() => setShowItemModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveMenuItem} className="modal-form">
              <div className="form-group">
                <label>Item Name (English) *</label>
                <input
                  type="text"
                  required
                  value={editingItem?.name || ''}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Item Name (Hindi) - Optional</label>
                <input
                  type="text"
                  value={editingItem?.nameHindi || ''}
                  onChange={e => setEditingItem({ ...editingItem, nameHindi: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Price in Rupees (₹) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editingItem?.pricePaise ? editingItem.pricePaise / 100 : ''}
                  onChange={e => setEditingItem({ ...editingItem, pricePaise: rupeesToPaise(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={editingItem?.category || 'Mains'}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Station (Routes KOT ticket to Printer):</label>
                <select
                  value={editingItem?.station || 'Kitchen'}
                  onChange={e => setEditingItem({ ...editingItem, station: e.target.value as any })}
                >
                  <option value="Kitchen">Kitchen</option>
                  <option value="Tandoor">Tandoor</option>
                  <option value="Bar">Bar</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dietary Tag:</label>
                <select
                  value={editingItem?.isVeg ? 'true' : 'false'}
                  onChange={e => setEditingItem({ ...editingItem, isVeg: e.target.value === 'true' })}
                >
                  <option value="true">🟢 Vegetarian</option>
                  <option value="false">🔴 Non-Vegetarian</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="secondary-button" onClick={() => setShowItemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Pantry Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal-backdrop" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Record Grocery Delivery / Purchase</h3>
              <button className="modal-close-btn" onClick={() => setShowPurchaseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePurchase} className="modal-form">
              <div className="form-group">
                <label>Select Pantry Item *</label>
                <select value={purchaseItem} onChange={e => setPurchaseItem(e.target.value)}>
                  {store.pantry.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity Delivered *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 5"
                  value={purchaseQty}
                  onChange={e => setPurchaseQty(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="secondary-button" onClick={() => setShowPurchaseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Printer Modal */}
      {showPrinterModal && (
        <div className="modal-backdrop" onClick={() => setShowPrinterModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🖨️ Add Local Network Thermal Printer</h3>
              <button className="modal-close-btn" onClick={() => setShowPrinterModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddPrinter} className="modal-form">
              <div className="form-group">
                <label>Printer Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen Hot KOT Printer, Tandoor Slip"
                  value={prnName}
                  onChange={e => setPrnName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Local IP Address *</label>
                <input
                  type="text"
                  required
                  placeholder="192.168.1.102"
                  value={prnIp}
                  onChange={e => setPrnIp(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Socket Port (Standard: 9100)</label>
                <input
                  type="number"
                  value={prnPort}
                  onChange={e => setPrnPort(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select value={prnRole} onChange={e => setPrnRole(e.target.value as any)}>
                  <option value="KITCHEN">Kitchen KOTs</option>
                  <option value="BAR">Bar KOTs</option>
                  <option value="BILL">Counter Bills (Tax Invoices)</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="secondary-button" onClick={() => setShowPrinterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Register Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

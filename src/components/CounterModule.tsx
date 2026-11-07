import React, { useState } from 'react'
import type { Order, Bill, TaxSettings, PaymentRecord } from '../types'
import { calculateBill, formatINR, generateInvoiceNumber, rupeesToPaise } from '../gstEngine'

interface CounterModuleProps {
  orders: Order[]
  bills: Bill[]
  taxSettings: TaxSettings
  onSettleBill: (bill: Bill) => void
  onPrintBill: (bill: Bill) => void
  onToast: (msg: string) => void
  nextInvoiceNo: number
}

export const CounterModule: React.FC<CounterModuleProps> = ({
  orders,
  bills,
  taxSettings,
  onSettleBill,
  onPrintBill,
  onToast,
  nextInvoiceNo
}) => {
  const activeOrders = orders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED')
  const [selectedOrderId, setSelectedOrderId] = useState<string>(activeOrders[0]?.id || '')
  const [discountRupees, setDiscountRupees] = useState<string>('')
  const [selectedTender, setSelectedTender] = useState<'CASH' | 'UPI' | 'CARD' | 'SPLIT'>('CASH')
  const [cashTenderedRupees, setCashTenderedRupees] = useState<string>('')
  const [upiRef, setUpiRef] = useState<string>('')
  const [upiConfirmed, setUpiConfirmed] = useState<boolean>(false)
  const [mobileTab, setMobileTab] = useState<'tables' | 'checkout'>('tables')

  const currentOrder = activeOrders.find(o => o.id === selectedOrderId) || activeOrders[0]

  const discountPaise = rupeesToPaise(discountRupees || '0')
  const isTakeaway = currentOrder?.type === 'TAKEAWAY'

  const calc = currentOrder
    ? calculateBill(currentOrder.lines, taxSettings, discountPaise, isTakeaway)
    : calculateBill([], taxSettings, 0)

  const payableRupees = calc.payablePaise / 100
  const cashGiven = parseFloat(cashTenderedRupees || '0')
  const changeToReturnPaise = cashGiven > 0 ? Math.max(0, Math.round(cashGiven * 100) - calc.payablePaise) : 0

  const handleSettle = () => {
    if (!currentOrder) return

    if (selectedTender === 'UPI' && !upiConfirmed) {
      onToast('Please verify that the UPI payment was received on your soundbox or merchant app.')
      return
    }

    const invoiceNumber = generateInvoiceNumber(taxSettings.invoicePrefix, nextInvoiceNo)

    const payment: PaymentRecord = {
      method: selectedTender,
      amountPaise: calc.payablePaise,
      receivedPaise: cashGiven > 0 ? Math.round(cashGiven * 100) : calc.payablePaise,
      changePaise: changeToReturnPaise,
      upiRef: upiRef.trim() || undefined,
      recordedAt: Date.now(),
      recordedBy: 'Cashier'
    }

    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      invoiceNumber,
      orderId: currentOrder.id,
      tableName: currentOrder.tableName,
      lines: currentOrder.lines,
      calc,
      payment,
      issuedAt: Date.now(),
      status: 'PAID'
    }

    onSettleBill(newBill)
    onToast(`✅ Bill ${invoiceNumber} settled & printed for ${currentOrder.tableName}!`)
    setDiscountRupees('')
    setCashTenderedRupees('')
    setUpiRef('')
    setUpiConfirmed(false)
    setMobileTab('tables')
  }

  return (
    <div className="counter-layout-v3">
      {/* Left: Active Tables / Orders */}
      <section 
        className="counter-orders-sidebar"
        style={{ display: mobileTab === 'checkout' ? undefined : undefined }}
      >
        <div className="sidebar-header">
          <h2>Active Tables & Bills</h2>
          <span className="count-pill">{activeOrders.length} Open</span>
        </div>

        <div className="counter-order-cards">
          {activeOrders.length === 0 ? (
            <div className="empty-bills-box">
              <span className="icon">🏁</span>
              <strong>No active tables</strong>
              <p>All tables are free and settled.</p>
            </div>
          ) : (
            activeOrders.map(ord => {
              const orderSubtotal = ord.lines.reduce((s, l) => s + l.pricePaise * l.qty, 0)
              const isSelected = ord.id === currentOrder?.id
              return (
                <div
                  key={ord.id}
                  className={`counter-table-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedOrderId(ord.id)
                    setCashTenderedRupees('')
                    setDiscountRupees('')
                    setMobileTab('checkout')
                  }}
                >
                  <div className="card-top">
                    <strong className="table-name">{ord.tableName}</strong>
                    <span className={`status-tag status-${ord.status.toLowerCase()}`}>{ord.status}</span>
                  </div>
                  <div className="card-mid">
                    <span>{ord.lines.length} Dishes</span>
                    <span>Order #{ord.orderNo}</span>
                  </div>
                  <div className="card-bottom">
                    <span className="time-ago">
                      {Math.floor((Date.now() - ord.createdAt) / 60000)}m ago
                    </span>
                    <strong className="order-amt">{formatINR(orderSubtotal)}</strong>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recently Settled Bills */}
        <div className="recent-bills-section">
          <h3>Recent Issued Invoices</h3>
          <div className="recent-bills-list">
            {bills.slice(-4).reverse().map(b => (
              <div key={b.id} className="recent-bill-row">
                <div>
                  <strong>{b.invoiceNumber}</strong>
                  <small>{b.tableName} • {b.payment.method}</small>
                </div>
                <div className="recent-amt">
                  <span>{formatINR(b.calc.payablePaise)}</span>
                  <button className="reprint-icon-btn" title="Reprint thermal invoice" onClick={() => onPrintBill(b)}>
                    🖨️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right: Bill Preview & Settlement Checkout */}
      <section 
        className="counter-checkout-panel"
        style={{ display: mobileTab === 'tables' ? undefined : undefined }}
      >
        {currentOrder ? (
          <div className="checkout-card">
            <div className="checkout-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <button 
                    className="secondary-button"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}
                    onClick={() => setMobileTab('tables')}
                  >
                    &larr; All Tables
                  </button>
                  <h1 style={{ margin: 0 }}>Final Bill: {currentOrder.tableName}</h1>
                </div>
                <p>Order #{currentOrder.orderNo} • {currentOrder.type} • {currentOrder.guestCount} Guests</p>
              </div>
              <div className="invoice-preview-tag">
                Next Invoice: <strong>{generateInvoiceNumber(taxSettings.invoicePrefix, nextInvoiceNo)}</strong>
              </div>
            </div>

            {/* Line items table */}
            <div className="bill-items-table-container">
              <table className="bill-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th className="num">Rate</th>
                    <th className="num">Qty</th>
                    <th className="num">Gross Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.lines.map(line => (
                    <tr key={line.id}>
                      <td>
                        <strong>{line.name}</strong>
                        {line.notes && <span className="item-note-inline">({line.notes})</span>}
                      </td>
                      <td className="num">{formatINR(line.pricePaise)}</td>
                      <td className="num">{line.qty}</td>
                      <td className="num">{formatINR(line.pricePaise * line.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="bill-calculation-summary">
              <div className="calc-row">
                <span>Subtotal ({currentOrder.lines.length} items)</span>
                <span>{formatINR(calc.subtotalPaise)}</span>
              </div>

              {/* Discount Input */}
              <div className="calc-row discount-row">
                <div className="discount-input-group">
                  <label>Apply Discount (₹):</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discountRupees}
                    onChange={e => setDiscountRupees(e.target.value)}
                  />
                  <div className="quick-discount-buttons">
                    <button onClick={() => setDiscountRupees('50')}>₹50</button>
                    <button onClick={() => setDiscountRupees('100')}>₹100</button>
                    <button onClick={() => setDiscountRupees(String(Math.round((calc.subtotalPaise * 0.1) / 100)))}>10%</button>
                  </div>
                </div>
                <span className="discount-amt">-{formatINR(calc.discountPaise)}</span>
              </div>

              {calc.serviceChargePaise > 0 && (
                <div className="calc-row">
                  <span>Service Charge ({taxSettings.serviceChargeBp / 100}%)</span>
                  <span>+{formatINR(calc.serviceChargePaise)}</span>
                </div>
              )}

              {calc.packagingPaise > 0 && (
                <div className="calc-row">
                  <span>Takeaway Packaging Charge</span>
                  <span>+{formatINR(calc.packagingPaise)}</span>
                </div>
              )}

              <div className="calc-row net-row">
                <span>Taxable Supply Value</span>
                <strong>{formatINR(calc.taxablePaise)}</strong>
              </div>

              {/* GST Split */}
              {taxSettings.gstRateBp > 0 ? (
                <>
                  <div className="calc-row tax-split-row">
                    <span>CGST ({(taxSettings.gstRateBp / 200).toFixed(1)}%)</span>
                    <span>+{formatINR(calc.cgstPaise)}</span>
                  </div>
                  <div className="calc-row tax-split-row">
                    <span>SGST ({(taxSettings.gstRateBp / 200).toFixed(1)}%)</span>
                    <span>+{formatINR(calc.sgstPaise)}</span>
                  </div>
                </>
              ) : (
                <div className="calc-row tax-split-row">
                  <span>GST (0% - Composition / Unregistered)</span>
                  <span>₹0.00</span>
                </div>
              )}

              {calc.roundOffPaise !== 0 && (
                <div className="calc-row roundoff-row">
                  <span>Round-off (Nearest Rupee)</span>
                  <span>{calc.roundOffPaise > 0 ? `+${formatINR(calc.roundOffPaise)}` : formatINR(calc.roundOffPaise)}</span>
                </div>
              )}

              <div className="calc-row grand-total-row">
                <div>
                  <span className="payable-label">NET PAYABLE AMOUNT</span>
                  <small>Integer paise arithmetic guaranteed</small>
                </div>
                <strong className="payable-value">{formatINR(calc.payablePaise)}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-tender-box">
              <h3>Select Tender Method:</h3>
              <div className="tender-buttons-row">
                <button
                  className={`tender-btn ${selectedTender === 'CASH' ? 'is-active' : ''}`}
                  onClick={() => setSelectedTender('CASH')}
                >
                  💵 Cash
                </button>
                <button
                  className={`tender-btn ${selectedTender === 'UPI' ? 'is-active' : ''}`}
                  onClick={() => setSelectedTender('UPI')}
                >
                  📱 UPI / QR
                </button>
                <button
                  className={`tender-btn ${selectedTender === 'CARD' ? 'is-active' : ''}`}
                  onClick={() => setSelectedTender('CARD')}
                >
                  💳 Debit / Credit Card
                </button>
              </div>

              {/* Tender-Specific Inputs */}
              {selectedTender === 'CASH' && (
                <div className="tender-details-cash">
                  <div className="cash-input-group">
                    <label>Cash Tendered by Customer (₹):</label>
                    <input
                      type="number"
                      placeholder={String(payableRupees)}
                      value={cashTenderedRupees}
                      onChange={e => setCashTenderedRupees(e.target.value)}
                    />
                    <div className="quick-cash-chips">
                      {[100, 200, 500, 1000, 2000].map(val => (
                        <button key={val} onClick={() => setCashTenderedRupees(String(val))}>₹{val}</button>
                      ))}
                    </div>
                  </div>
                  {cashGiven > 0 && (
                    <div className="change-due-box">
                      <span>Change to Return:</span>
                      <strong>{formatINR(changeToReturnPaise)}</strong>
                    </div>
                  )}
                </div>
              )}

              {selectedTender === 'UPI' && (
                <div className="tender-details-upi">
                  <div className="upi-qr-card">
                    <div className="simulated-qr-box">
                      <div className="qr-graphic">
                        <span className="qr-sim">UPI QR: ₹{payableRupees}</span>
                      </div>
                      <small>Scan with Google Pay, PhonePe, Paytm, BHIM</small>
                    </div>
                    <div className="upi-fields">
                      <label className="checkbox-confirm">
                        <input
                          type="checkbox"
                          checked={upiConfirmed}
                          onChange={e => setUpiConfirmed(e.target.checked)}
                        />
                        <span>I confirm receipt on merchant soundbox / bank app.</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Optional: UPI UTR / Reference No. (e.g. 4231...)"
                        value={upiRef}
                        onChange={e => setUpiRef(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTender === 'CARD' && (
                <div className="tender-details-card">
                  <p>Swipe or tap card on external EDC terminal. Confirm approval slip before finalizing.</p>
                </div>
              )}

              <div className="settle-action-bar">
                <button className="primary-settle-btn" onClick={handleSettle}>
                  <span>🖨️ Settle & Issue Tax Invoice</span>
                  <span className="btn-amt">{formatINR(calc.payablePaise)}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-order-selected">
            <span className="no-order-icon">🧾</span>
            <h2>Select a table on the left to review bill & take payment</h2>
          </div>
        )}
      </section>
    </div>
  )
}

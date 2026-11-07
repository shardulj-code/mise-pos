import React from 'react'
import type { Bill, KOT, Organisation, PrinterDevice } from '../types'
import { formatINR } from '../gstEngine'

interface ThermalPrintModalProps {
  isOpen: boolean
  onClose: () => void
  bill?: Bill | null
  kot?: KOT | null
  testPrinter?: PrinterDevice | null
  org: Organisation | null
}

export const ThermalPrintModal: React.FC<ThermalPrintModalProps> = ({
  isOpen,
  onClose,
  bill,
  kot,
  testPrinter,
  org
}) => {
  if (!isOpen) return null

  const handlePrintBrowser = () => {
    window.print()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content thermal-modal-wrapper" onClick={e => e.stopPropagation()}>
        <div className="thermal-modal-header no-print">
          <h3>🖨️ Thermal Print Slip Preview (ESC/POS)</h3>
          <div className="header-actions">
            <button className="primary-button" onClick={handlePrintBrowser}>
              Print Slip
            </button>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Photorealistic Thermal Receipt Paper (80mm width standard) */}
        <div className="thermal-paper">
          {/* SCENARIO 1: TAX INVOICE BILL */}
          {bill && (
            <div className="receipt-content">
              <div className="receipt-center">
                <h2 className="receipt-title">{org?.name || 'Mise Restaurant'}</h2>
                <p className="receipt-sub">{org?.address}</p>
                <p className="receipt-sub">Phone: {org?.phone}</p>
                {org?.tax.gstin && <p className="receipt-sub">GSTIN: {org.tax.gstin}</p>}
                {org?.tax.fssaiNo && <p className="receipt-sub">FSSAI: {org.tax.fssaiNo}</p>}
                <div className="receipt-divider">================================</div>
                <div className="receipt-type">
                  {org?.tax.gstRateBp && org.tax.gstRateBp > 0 ? 'TAX INVOICE' : 'BILL OF SUPPLY'}
                </div>
                <div className="receipt-divider">--------------------------------</div>
              </div>

              <div className="receipt-meta">
                <div>Invoice: <strong>{bill.invoiceNumber}</strong></div>
                <div>Date: {new Date(bill.issuedAt).toLocaleDateString('en-IN')} {new Date(bill.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div>Table: <strong>{bill.tableName}</strong></div>
                <div>Payment: <strong>{bill.payment.method}</strong></div>
              </div>

              <div className="receipt-divider">--------------------------------</div>

              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th align="left">ITEM</th>
                    <th align="center">QTY</th>
                    <th align="right">RATE</th>
                    <th align="right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.lines.map((item, idx) => (
                    <tr key={idx}>
                      <td align="left">{item.name}</td>
                      <td align="center">{item.qty}</td>
                      <td align="right">{(item.pricePaise / 100).toFixed(2)}</td>
                      <td align="right">{((item.pricePaise * item.qty) / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-divider">--------------------------------</div>

              <div className="receipt-totals-box">
                <div className="receipt-row">
                  <span>Subtotal:</span>
                  <span>{formatINR(bill.calc.subtotalPaise)}</span>
                </div>

                {bill.calc.discountPaise > 0 && (
                  <div className="receipt-row">
                    <span>Discount:</span>
                    <span>-{formatINR(bill.calc.discountPaise)}</span>
                  </div>
                )}

                {bill.calc.serviceChargePaise > 0 && (
                  <div className="receipt-row">
                    <span>Service Charge:</span>
                    <span>+{formatINR(bill.calc.serviceChargePaise)}</span>
                  </div>
                )}

                {bill.calc.packagingPaise > 0 && (
                  <div className="receipt-row">
                    <span>Packaging:</span>
                    <span>+{formatINR(bill.calc.packagingPaise)}</span>
                  </div>
                )}

                <div className="receipt-row">
                  <span>Taxable Value:</span>
                  <span>{formatINR(bill.calc.taxablePaise)}</span>
                </div>

                {bill.calc.gstRateBp > 0 && (
                  <>
                    <div className="receipt-row">
                      <span>CGST ({(bill.calc.gstRateBp / 200).toFixed(1)}%):</span>
                      <span>+{formatINR(bill.calc.cgstPaise)}</span>
                    </div>
                    <div className="receipt-row">
                      <span>SGST ({(bill.calc.gstRateBp / 200).toFixed(1)}%):</span>
                      <span>+{formatINR(bill.calc.sgstPaise)}</span>
                    </div>
                  </>
                )}

                {bill.calc.roundOffPaise !== 0 && (
                  <div className="receipt-row">
                    <span>Round-off:</span>
                    <span>{bill.calc.roundOffPaise > 0 ? `+${formatINR(bill.calc.roundOffPaise)}` : formatINR(bill.calc.roundOffPaise)}</span>
                  </div>
                )}

                <div className="receipt-divider">================================</div>

                <div className="receipt-row receipt-grand-total">
                  <span>GRAND TOTAL:</span>
                  <span>{formatINR(bill.calc.payablePaise)}</span>
                </div>

                <div className="receipt-divider">================================</div>
              </div>

              <div className="receipt-center receipt-footer-note">
                <p>Thank you for dining with us!</p>
                <p>Please visit again.</p>
                <small>Powered by Mise Operating System</small>
              </div>
            </div>
          )}

          {/* SCENARIO 2: KITCHEN ORDER TICKET (KOT) */}
          {kot && (
            <div className="receipt-content kot-slip">
              <div className="receipt-center">
                <h2 className="kot-title">*** KITCHEN TICKET ***</h2>
                <div className="kot-station">{kot.station.toUpperCase()} PASS</div>
                <div className="receipt-divider">================================</div>
              </div>

              <div className="receipt-meta">
                <div>Table: <strong className="kot-table-huge">{kot.table}</strong></div>
                <div>KOT #: <strong>{kot.kotNumber}</strong></div>
                <div>Time: {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div>Type: {kot.type}</div>
              </div>

              <div className="receipt-divider">--------------------------------</div>

              <table className="kot-items-table">
                <thead>
                  <tr>
                    <th align="center">QTY</th>
                    <th align="left">DISH NAME & NOTES</th>
                  </tr>
                </thead>
                <tbody>
                  {kot.lines.map((l, i) => (
                    <tr key={i} className={l.action === 'CANCEL' ? 'is-kot-cancelled' : ''}>
                      <td align="center" className="kot-qty">{l.qty}</td>
                      <td align="left">
                        <strong className="kot-item-name">{l.name}</strong>
                        {l.notes && <div className="kot-note">** {l.notes} **</div>}
                        {l.action === 'CANCEL' && <span className="kot-cancel-tag">CANCELLED</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-divider">================================</div>
              <div className="receipt-center">
                <small>End of Ticket #{kot.kotNumber}</small>
              </div>
            </div>
          )}

          {/* SCENARIO 3: PRINTER TEST SLIP */}
          {testPrinter && (
            <div className="receipt-content test-slip">
              <div className="receipt-center">
                <h2 className="receipt-title">TEST PRINT SLIP</h2>
                <p className="receipt-sub">Mise Thermal IP Diagnostics</p>
                <div className="receipt-divider">================================</div>
              </div>

              <div className="receipt-meta">
                <div>Printer: <strong>{testPrinter.name}</strong></div>
                <div>IP Socket: <code>{testPrinter.ip}:{testPrinter.port}</code></div>
                <div>Paper Width: {testPrinter.paperWidth}</div>
                <div>Status: 🟢 ONLINE ({testPrinter.lastPingMs}ms ping)</div>
                <div>Test Time: {new Date().toLocaleTimeString()}</div>
              </div>

              <div className="receipt-divider">--------------------------------</div>
              <div className="receipt-center">
                <p>Character Set Check:</p>
                <code>ABCDEF 123456 ₹ !@#$%</code>
                <p>Devanagari Test:</p>
                <p>मसाला चाय • दाल तड़का • पनीर</p>
                <div className="receipt-divider">================================</div>
                <p>✅ PRINTER HARDWARE READY</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


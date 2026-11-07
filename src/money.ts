import type { OrderLine, Outlet } from './model'

export function inr(paise: number) {
  const sign = paise < 0 ? '-' : ''
  const abs = Math.abs(paise)
  return `${sign}₹${Math.floor(abs / 100).toLocaleString('en-IN')}.${String(abs % 100).padStart(2, '0')}`
}

export function rupeesToPaise(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100)
}

function mulDiv(amount: number, numerator: number, denominator: number) {
  return Math.round((amount * numerator) / denominator)
}

export function priceOrder(outlet: Outlet, lines: OrderLine[], discount: number, withPackaging: boolean) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0)
  const off = Math.min(subtotal, Math.max(0, Math.round(discount)))
  const net = subtotal - off
  const service = mulDiv(net, outlet.serviceChargeBp, 10000)
  const packaging = withPackaging ? outlet.packagingPaise : 0
  const base = net + service + packaging
  const taxable = outlet.pricesIncludeGst ? mulDiv(base, 10000, 10000 + outlet.gstRateBp) : base
  const tax = outlet.pricesIncludeGst ? base - taxable : mulDiv(base, outlet.gstRateBp, 10000)
  const cgst = Math.floor(tax / 2)
  const sgst = tax - cgst
  const total = outlet.pricesIncludeGst ? base : taxable + tax
  return { subtotal, discount: off, service, packaging, taxable, cgst, sgst, total, rateBp: outlet.gstRateBp, pricesIncludeGst: outlet.pricesIncludeGst }
}

export function invoiceNo(outlet: Outlet, at = new Date()) {
  const start = at.getMonth() >= 3 ? at.getFullYear() : at.getFullYear() - 1
  const fy = `${String(start).slice(2)}-${String(start + 1).slice(2)}`
  return `${outlet.invoicePrefix}/${fy}/${String(outlet.nextInvoice).padStart(4, '0')}`
}

export function paidOf(payments: { amount: number }[]) {
  return payments.reduce((sum, payment) => sum + payment.amount, 0)
}

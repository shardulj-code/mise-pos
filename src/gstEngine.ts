import type { BillCalculation, OrderLine, TaxSettings } from './types'

export function formatINR(paise: number): string {
  const isNegative = paise < 0
  const abs = Math.abs(Math.round(paise))
  const rupees = Math.floor(abs / 100)
  const remainingPaise = abs % 100

  // Indian number formatting for lakhs and crores
  const rupeeString = rupees.toLocaleString('en-IN')
  const paiseString = remainingPaise.toString().padStart(2, '0')

  return `${isNegative ? '-' : ''}₹${rupeeString}.${paiseString}`
}

export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees
  if (isNaN(num) || !isFinite(num)) return 0
  return Math.round(num * 100)
}

export function paiseToRupees(paise: number): number {
  return paise / 100
}

/**
 * mulDivRoundHalfUp: Symmetric round half-up integer math
 * floor((2*a*b + d) / (2*d))
 */
export function mulDivRoundHalfUp(a: number, b: number, d: number): number {
  if (d === 0) return 0
  const sign = (a < 0 ? -1 : 1) * (b < 0 ? -1 : 1)
  const absA = Math.abs(a)
  const absB = Math.abs(b)
  const val = Math.floor((2 * absA * absB + d) / (2 * d))
  return sign * val
}

/**
 * Calculates complete GST bill values using integer paise arithmetic.
 * Main admin can change GST rate or toggle inclusive/exclusive pricing at any time.
 */
export function calculateBill(
  lines: OrderLine[],
  tax: TaxSettings,
  discountInputPaise: number = 0,
  isTakeaway: boolean = false
): BillCalculation {
  const subtotalPaise = lines.reduce((acc, line) => acc + line.pricePaise * line.qty, 0)
  const discountPaise = Math.min(subtotalPaise, Math.max(0, Math.round(discountInputPaise)))
  const netPaise = subtotalPaise - discountPaise

  // Service charge applies on dine-in net if configured
  const serviceChargePaise = !isTakeaway && tax.serviceChargeBp > 0
    ? mulDivRoundHalfUp(netPaise, tax.serviceChargeBp, 10000)
    : 0

  // Packaging charge on takeaway if configured
  const packagingPaise = isTakeaway ? tax.packagingPaise : 0

  const baseForTaxPaise = netPaise + serviceChargePaise + packagingPaise

  let taxablePaise = 0
  let totalTaxPaise = 0
  let cgstPaise = 0
  let sgstPaise = 0

  if (tax.gstRateBp <= 0) {
    // 0% GST (e.g. Composition scheme or unregistered)
    taxablePaise = baseForTaxPaise
    totalTaxPaise = 0
    cgstPaise = 0
    sgstPaise = 0
  } else if (tax.pricesIncludeGst) {
    // Inclusive: Taxable = Base * 10000 / (10000 + RateBp)
    taxablePaise = mulDivRoundHalfUp(baseForTaxPaise, 10000, 10000 + tax.gstRateBp)
    totalTaxPaise = baseForTaxPaise - taxablePaise
    cgstPaise = Math.floor(totalTaxPaise / 2)
    sgstPaise = totalTaxPaise - cgstPaise
  } else {
    // Exclusive: Taxable = Base, Tax = Base * RateBp / 10000
    taxablePaise = baseForTaxPaise
    cgstPaise = mulDivRoundHalfUp(taxablePaise, tax.gstRateBp, 20000)
    sgstPaise = cgstPaise
    totalTaxPaise = cgstPaise + sgstPaise
  }

  const grandTotalPaise = tax.pricesIncludeGst
    ? baseForTaxPaise
    : taxablePaise + totalTaxPaise

  let payablePaise = grandTotalPaise
  let roundOffPaise = 0

  if (tax.roundToNearestRupee) {
    // Round to nearest 100 paise (₹1.00)
    payablePaise = mulDivRoundHalfUp(grandTotalPaise, 1, 100) * 100
    roundOffPaise = payablePaise - grandTotalPaise
  }

  return {
    subtotalPaise,
    discountPaise,
    netPaise,
    serviceChargePaise,
    packagingPaise,
    taxablePaise,
    cgstPaise,
    sgstPaise,
    totalTaxPaise,
    grandTotalPaise,
    roundOffPaise,
    payablePaise,
    pricesIncludeGst: tax.pricesIncludeGst,
    gstRateBp: tax.gstRateBp
  }
}

export function generateInvoiceNumber(prefix: string, sequenceNumber: number): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed
  // Indian FY starts April 1 (month 3)
  const fyStart = month >= 3 ? year : year - 1
  const fyEnd = fyStart + 1
  const fyStr = `${String(fyStart).slice(2)}-${String(fyEnd).slice(2)}`
  const seqStr = String(sequenceNumber).padStart(5, '0')
  return `${prefix}/${fyStr}/${seqStr}`
}


export type DeviceRole = 'WAITER' | 'KITCHEN' | 'COUNTER' | 'MANAGER' | 'ADMIN'

export interface ModuleCodes {
  kitchen: string
  waiter: string
  counter: string
  manager: string
}

export interface ConnectedDevice {
  id: string
  name: string
  role: DeviceRole
  codeUsed: string
  ipAddress?: string
  lastActive: number
  status: 'online' | 'idle' | 'revoked'
}

export interface TaxSettings {
  gstRateBp: number // basis points: 500 = 5.0%, 1800 = 18.0%, 0 = 0%
  pricesIncludeGst: boolean
  serviceChargeBp: number // e.g. 0 or 500 (5%)
  packagingPaise: number // e.g. 1000 = ₹10
  roundToNearestRupee: boolean
  invoicePrefix: string
  gstin?: string
  fssaiNo?: string
}

export interface Organisation {
  id: string
  name: string
  address: string
  phone: string
  state: string
  stateCode: string
  createdAt: number
  ownerPin: string
  codes: ModuleCodes
  devices: ConnectedDevice[]
  tax: TaxSettings
}

export interface MenuItem {
  id: string
  name: string
  nameHindi?: string
  category: string
  pricePaise: number
  station: 'Kitchen' | 'Bar' | 'Tandoor' | 'Dessert'
  shortCode: string
  isVeg: boolean
  available: boolean
  stockItemId?: string
  recipePortion?: number // raw stock units consumed per dish
}

export interface TableItem {
  id: string
  number: string
  section: string
  capacity: number
  status: 'FREE' | 'ORDERING' | 'COOKING' | 'READY' | 'BILLED'
  activeOrderId?: string
}

export interface OrderLine {
  id: string
  menuItemId: string
  name: string
  pricePaise: number
  qty: number
  notes?: string
  station: string
  sentToKitchen: boolean
}

export interface Order {
  id: string
  orderNo: number
  tableId: string
  tableName: string
  type: 'DINE_IN' | 'TAKEAWAY' | 'COUNTER'
  status: 'OPEN' | 'SENT' | 'COOKING' | 'READY' | 'BILLED' | 'PAID' | 'CANCELLED'
  lines: OrderLine[]
  createdAt: number
  updatedAt: number
  waiterName?: string
  guestCount: number
}

export interface KOTLine {
  id: string
  name: string
  qty: number
  notes?: string
  action: 'ADD' | 'UPDATE' | 'CANCEL'
}

export interface KOT {
  id: string
  orderId: string
  kotNumber: number
  table: string
  station: string
  type: string
  status: 'NEW' | 'COOKING' | 'READY' | 'SERVED'
  lines: KOTLine[]
  createdAt: number
  printed: boolean
  printedAt?: number
}

export interface BillCalculation {
  subtotalPaise: number
  discountPaise: number
  netPaise: number
  serviceChargePaise: number
  packagingPaise: number
  taxablePaise: number
  cgstPaise: number
  sgstPaise: number
  totalTaxPaise: number
  grandTotalPaise: number
  roundOffPaise: number
  payablePaise: number
  pricesIncludeGst: boolean
  gstRateBp: number
}

export interface PaymentRecord {
  method: 'CASH' | 'UPI' | 'CARD' | 'SPLIT'
  amountPaise: number
  receivedPaise?: number
  changePaise?: number
  upiRef?: string
  recordedAt: number
  recordedBy: string
}

export interface Bill {
  id: string
  invoiceNumber: string
  orderId: string
  tableName: string
  lines: OrderLine[]
  calc: BillCalculation
  payment: PaymentRecord
  issuedAt: number
  status: 'PAID' | 'VOIDED'
  voidReason?: string
}

export interface PantryItem {
  id: string
  name: string
  category: 'Vegetables' | 'Dairy' | 'Grocery' | 'Spices' | 'Beverages' | 'Packaging'
  unit: 'kg' | 'l' | 'g' | 'packet' | 'pieces'
  onHand: number
  minThreshold: number
  costPerUnitPaise: number
  lastUpdated: number
}

export interface PantryMovement {
  id: string
  itemId: string
  itemName: string
  type: 'PURCHASE' | 'CONSUMPTION' | 'WASTAGE' | 'AUDIT_ADJUSTMENT'
  quantityDelta: number
  reason?: string
  costPaise: number
  at: number
}

export interface PrinterDevice {
  id: string
  name: string
  ip: string
  port: number
  role: 'BILL' | 'KITCHEN' | 'BAR'
  paperWidth: '58mm' | '80mm'
  status: 'ONLINE' | 'OFFLINE' | 'PAPER_OUT' | 'UNTESTED'
  lastPingMs: number
  lastChecked: number
}

export interface DayCloseReport {
  id: string
  closedAt: number
  closedBy: string
  dateString: string
  totalSalesPaise: number
  totalTaxPaise: number
  cgstTotalPaise: number
  sgstTotalPaise: number
  cashExpectedPaise: number
  cashCountedPaise: number
  cashVariancePaise: number
  upiTotalPaise: number
  cardTotalPaise: number
  totalBills: number
  totalDiscountsPaise: number
  notes?: string
}

export interface AuditLog {
  id: string
  at: number
  actor: string
  role: string
  action: string
  details: string
}

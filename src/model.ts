export type PayMethod = 'cash' | 'card' | 'upi' | 'room'

export type MenuItem = {
  id: string
  name: string
  category: string
  price: number
  station: string
  stockId?: string
  portion: number
  available: boolean
}

export type StockItem = { id: string; name: string; unit: string; onHand: number; lowAt: number }
export type Table = { id: string; name: string }
export type OrderLine = { id: string; menuId: string; name: string; price: number; qty: number }

export type Order = {
  id: string
  tableId: string
  tableName: string
  kind: 'dine-in' | 'takeaway' | 'online' | 'qr'
  source: string
  lines: OrderLine[]
  status: 'open' | 'sent' | 'cooking' | 'ready' | 'billed'
  kot: number
  sentAt: number | null
  discount: number
  customerId?: string
  roomId?: string
}

export type Payment = { method: PayMethod; amount: number; ref: string }

export type Bill = {
  id: string
  invoice: string
  orderId: string
  tableName: string
  lines: OrderLine[]
  subtotal: number
  discount: number
  service: number
  packaging: number
  taxable: number
  cgst: number
  sgst: number
  total: number
  rateBp: number
  pricesIncludeGst: boolean
  payments: Payment[]
  status: 'paid' | 'part' | 'void'
  at: number
  roomId?: string
}

export type Customer = { id: string; name: string; phone: string; points: number; visits: number }
export type Reservation = { id: string; name: string; phone: string; party: number; at: string; status: 'booked' | 'seated' | 'cancelled'; tableId?: string }
export type Room = { id: string; number: string; guest: string; balance: number; occupied: boolean }
export type OnlineDraft = { source: 'Swiggy' | 'Zomato' | 'Website'; guest: string; lines: OrderLine[]; status: 'waiting' | 'in-kitchen' | 'rejected'; id: string }
export type Campaign = { id: string; message: string; people: number; at: number }
export type Audit = { id: string; at: number; text: string }
export type UpdatePack = { id: string; name: string; rateBp: number; charge: string }

export type Outlet = {
  id: string
  name: string
  address: string
  phone: string
  gstin: string
  invoicePrefix: string
  nextInvoice: number
  gstRateBp: number
  pricesIncludeGst: boolean
  serviceChargeBp: number
  packagingPaise: number
  ownerPin: string
  tables: Table[]
  menu: MenuItem[]
  stock: StockItem[]
  orders: Order[]
  bills: Bill[]
  customers: Customer[]
  reservations: Reservation[]
  rooms: Room[]
  online: OnlineDraft[]
  campaigns: Campaign[]
  packs: UpdatePack[]
  audit: Audit[]
  kotSeq: number
  dayOpen: boolean
}

export type Doc = { rev: number; activeId: string; outlets: Outlet[] }

export type Screen = 'counter' | 'kitchen' | 'bills' | 'inventory' | 'guests' | 'book' | 'rooms' | 'online' | 'close' | 'admin' | 'guide'

export function uid() {
  return crypto.randomUUID()
}

export function active(doc: Doc) {
  return doc.outlets.find((outlet) => outlet.id === doc.activeId) ?? doc.outlets[0]
}

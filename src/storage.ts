import type {
  Organisation,
  MenuItem,
  TableItem,
  Order,
  KOT,
  Bill,
  PantryItem,
  PantryMovement,
  PrinterDevice,
  DayCloseReport,
  AuditLog,
  DeviceRole
} from './types'

const STORAGE_KEY = 'mise_pos_database_v3'
const BROADCAST_CHANNEL_NAME = 'mise_realtime_lan_bus'

export interface AppStore {
  org: Organisation | null
  activeRole: DeviceRole
  currentDeviceName: string
  menu: MenuItem[]
  tables: TableItem[]
  orders: Order[]
  kots: KOT[]
  bills: Bill[]
  pantry: PantryItem[]
  pantryMovements: PantryMovement[]
  printers: PrinterDevice[]
  dayCloses: DayCloseReport[]
  auditLogs: AuditLog[]
  nextOrderNo: number
  nextKotNo: number
  nextInvoiceNo: number
}

export function generateRandomCode(prefix: string): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = prefix + '-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  result += '-'
  for (let i = 0; i < 2; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getInitialSeedStore(): AppStore {
  const org: Organisation = {
    id: 'org_kokum_house',
    name: 'Kokum House Restaurant & Cafe',
    address: '14 River Lane, Near Church, Panaji, Goa - 403001',
    phone: '+91 98221 54321',
    state: 'Goa',
    stateCode: '30',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    ownerPin: '1234',
    codes: {
      kitchen: 'KITCH-7821-X9',
      waiter: 'WAITR-4192-M3',
      counter: 'COUNT-9034-L7',
      manager: 'MANG-6512-P4'
    },
    devices: [
      { id: 'dev_hub_counter', name: 'Main Counter Laptop (Hub)', role: 'COUNTER', codeUsed: 'COUNT-9034-L7', ipAddress: '192.168.1.10', lastActive: Date.now(), status: 'online' },
      { id: 'dev_kitchen_tab', name: 'Kitchen Tablet (Pass)', role: 'KITCHEN', codeUsed: 'KITCH-7821-X9', ipAddress: '192.168.1.15', lastActive: Date.now() - 10000, status: 'online' },
      { id: 'dev_waiter_phone_1', name: 'Waiter 1 (Ramesh Phone)', role: 'WAITER', codeUsed: 'WAITR-4192-M3', ipAddress: '192.168.1.22', lastActive: Date.now() - 35000, status: 'online' },
      { id: 'dev_manager_tab', name: 'Manager Office Tablet', role: 'MANAGER', codeUsed: 'MANG-6512-P4', ipAddress: '192.168.1.5', lastActive: Date.now() - 120000, status: 'online' }
    ],
    tax: {
      gstRateBp: 500, // 5% standalone restaurant
      pricesIncludeGst: false,
      serviceChargeBp: 0,
      packagingPaise: 1500, // ₹15 takeaway packaging
      roundToNearestRupee: true,
      invoicePrefix: 'KH',
      gstin: '30AAACK1234F1Z8',
      fssaiNo: '10020023000456'
    }
  }

  const menu: MenuItem[] = [
    { id: 'm_chai', name: 'Masala Chai (Khadak)', nameHindi: 'मसाला चाय', category: 'Beverages', pricePaise: 4000, station: 'Bar', shortCode: 'MC', isVeg: true, available: true, stockItemId: 'p_milk', recipePortion: 0.15 },
    { id: 'm_filter_coffee', name: 'South Indian Filter Coffee', nameHindi: 'फ़िल्टर कॉफ़ी', category: 'Beverages', pricePaise: 5500, station: 'Bar', shortCode: 'FC', isVeg: true, available: true, stockItemId: 'p_milk', recipePortion: 0.2 },
    { id: 'm_sol_kadhi', name: 'Fresh Kokum Sol Kadhi', nameHindi: 'सोल कढ़ी', category: 'Beverages', pricePaise: 6500, station: 'Bar', shortCode: 'SK', isVeg: true, available: true },
    { id: 'm_vada_pav', name: 'Mumbai Vada Pav (2 Pcs)', nameHindi: 'वड़ा पाव', category: 'Quick Bites', pricePaise: 6000, station: 'Kitchen', shortCode: 'VP', isVeg: true, available: true, stockItemId: 'p_oil', recipePortion: 0.05 },
    { id: 'm_paneer_tikka', name: 'Tandoori Paneer Tikka', nameHindi: 'पनीर टिक्का', category: 'Starters', pricePaise: 26000, station: 'Tandoor', shortCode: 'PT', isVeg: true, available: true, stockItemId: 'p_paneer', recipePortion: 0.25 },
    { id: 'm_chicken_tikka', name: 'Murgh Malai Tikka', nameHindi: 'मलाई टिक्का', category: 'Starters', pricePaise: 31000, station: 'Tandoor', shortCode: 'MT', isVeg: false, available: true },
    { id: 'm_dal_tadka', name: 'Yellow Dal Tadka (Double Ghee)', nameHindi: 'दाल तड़का', category: 'Mains', pricePaise: 19000, station: 'Kitchen', shortCode: 'DT', isVeg: true, available: true },
    { id: 'm_paneer_butter', name: 'Paneer Butter Masala', nameHindi: 'पनीर बटर मसाला', category: 'Mains', pricePaise: 27000, station: 'Kitchen', shortCode: 'PBM', isVeg: true, available: true, stockItemId: 'p_paneer', recipePortion: 0.2 },
    { id: 'm_veg_biryani', name: 'Hyderabadi Dum Biryani', nameHindi: 'दम बिरयानी', category: 'Mains', pricePaise: 25000, station: 'Kitchen', shortCode: 'VB', isVeg: true, available: true, stockItemId: 'p_rice', recipePortion: 0.25 },
    { id: 'm_butter_naan', name: 'Butter Naan', nameHindi: 'बटर नान', category: 'Breads', pricePaise: 5500, station: 'Tandoor', shortCode: 'BN', isVeg: true, available: true },
    { id: 'm_tandoori_roti', name: 'Tandoori Roti', nameHindi: 'तंदूरी रोटी', category: 'Breads', pricePaise: 3000, station: 'Tandoor', shortCode: 'TR', isVeg: true, available: true },
    { id: 'm_gulab_jamun', name: 'Hot Gulab Jamun (2 Pcs)', nameHindi: 'गुलाब जामुन', category: 'Desserts', pricePaise: 8000, station: 'Dessert', shortCode: 'GJ', isVeg: true, available: true }
  ]

  const tables: TableItem[] = [
    { id: 't_1', number: 'Table 1', section: 'AC Hall', capacity: 2, status: 'FREE' },
    { id: 't_2', number: 'Table 2', section: 'AC Hall', capacity: 4, status: 'COOKING', activeOrderId: 'ord_active_t2' },
    { id: 't_3', number: 'Table 3', section: 'AC Hall', capacity: 4, status: 'FREE' },
    { id: 't_4', number: 'Table 4', section: 'AC Hall', capacity: 6, status: 'ORDERING', activeOrderId: 'ord_active_t4' },
    { id: 't_5', number: 'Table 5', section: 'Verandah Garden', capacity: 4, status: 'FREE' },
    { id: 't_6', number: 'Table 6', section: 'Verandah Garden', capacity: 4, status: 'FREE' },
    { id: 't_7', number: 'Table 7', section: 'Verandah Garden', capacity: 6, status: 'READY', activeOrderId: 'ord_active_t7' },
    { id: 't_8', number: 'Table 8', section: 'Rooftop', capacity: 8, status: 'FREE' },
    { id: 't_takeaway', number: 'Takeaway Counter', section: 'Express', capacity: 0, status: 'FREE' }
  ]

  const orders: Order[] = [
    {
      id: 'ord_active_t2',
      orderNo: 101,
      tableId: 't_2',
      tableName: 'Table 2',
      type: 'DINE_IN',
      status: 'COOKING',
      lines: [
        { id: 'ol_1', menuItemId: 'm_veg_biryani', name: 'Hyderabadi Dum Biryani', pricePaise: 25000, qty: 1, station: 'Kitchen', sentToKitchen: true },
        { id: 'ol_2', menuItemId: 'm_dal_tadka', name: 'Yellow Dal Tadka (Double Ghee)', pricePaise: 19000, qty: 1, station: 'Kitchen', sentToKitchen: true },
        { id: 'ol_3', menuItemId: 'm_butter_naan', name: 'Butter Naan', pricePaise: 5500, qty: 2, station: 'Tandoor', sentToKitchen: true }
      ],
      createdAt: Date.now() - 14 * 60 * 1000,
      updatedAt: Date.now() - 14 * 60 * 1000,
      waiterName: 'Ramesh',
      guestCount: 2
    },
    {
      id: 'ord_active_t4',
      orderNo: 102,
      tableId: 't_4',
      tableName: 'Table 4',
      type: 'DINE_IN',
      status: 'OPEN',
      lines: [
        { id: 'ol_4', menuItemId: 'm_paneer_tikka', name: 'Tandoori Paneer Tikka', pricePaise: 26000, qty: 1, notes: 'Crispy mint chutney', station: 'Tandoor', sentToKitchen: false },
        { id: 'ol_5', menuItemId: 'm_chai', name: 'Masala Chai (Khadak)', pricePaise: 4000, qty: 3, station: 'Bar', sentToKitchen: false }
      ],
      createdAt: Date.now() - 4 * 60 * 1000,
      updatedAt: Date.now() - 4 * 60 * 1000,
      waiterName: 'Ramesh',
      guestCount: 3
    },
    {
      id: 'ord_active_t7',
      orderNo: 100,
      tableId: 't_7',
      tableName: 'Table 7',
      type: 'DINE_IN',
      status: 'READY',
      lines: [
        { id: 'ol_6', menuItemId: 'm_chai', name: 'Masala Chai (Khadak)', pricePaise: 4000, qty: 2, station: 'Bar', sentToKitchen: true },
        { id: 'ol_7', menuItemId: 'm_vada_pav', name: 'Mumbai Vada Pav (2 Pcs)', pricePaise: 6000, qty: 2, station: 'Kitchen', sentToKitchen: true },
        { id: 'ol_8', menuItemId: 'm_filter_coffee', name: 'South Indian Filter Coffee', pricePaise: 5500, qty: 1, station: 'Bar', sentToKitchen: true }
      ],
      createdAt: Date.now() - 25 * 60 * 1000,
      updatedAt: Date.now() - 5 * 60 * 1000,
      waiterName: 'Suresh',
      guestCount: 3
    }
  ]

  const kots: KOT[] = [
    {
      id: 'kot_1001',
      orderId: 'ord_active_t2',
      kotNumber: 1,
      table: 'Table 2',
      station: 'Kitchen',
      type: 'Dine-in',
      status: 'COOKING',
      lines: [
        { id: 'kl_1', name: 'Hyderabadi Dum Biryani', qty: 1, action: 'ADD' },
        { id: 'kl_2', name: 'Yellow Dal Tadka (Double Ghee)', qty: 1, action: 'ADD' }
      ],
      createdAt: Date.now() - 14 * 60 * 1000,
      printed: true,
      printedAt: Date.now() - 14 * 60 * 1000
    },
    {
      id: 'kot_1002',
      orderId: 'ord_active_t2',
      kotNumber: 2,
      table: 'Table 2',
      station: 'Tandoor',
      type: 'Dine-in',
      status: 'COOKING',
      lines: [
        { id: 'kl_3', name: 'Butter Naan', qty: 2, action: 'ADD' }
      ],
      createdAt: Date.now() - 14 * 60 * 1000,
      printed: true,
      printedAt: Date.now() - 14 * 60 * 1000
    },
    {
      id: 'kot_1000',
      orderId: 'ord_active_t7',
      kotNumber: 3,
      table: 'Table 7',
      station: 'Kitchen',
      type: 'Dine-in',
      status: 'READY',
      lines: [
        { id: 'kl_4', name: 'Mumbai Vada Pav (2 Pcs)', qty: 2, action: 'ADD' }
      ],
      createdAt: Date.now() - 25 * 60 * 1000,
      printed: true,
      printedAt: Date.now() - 25 * 60 * 1000
    }
  ]

  const pantry: PantryItem[] = [
    { id: 'p_paneer', name: 'Fresh Dairy Paneer (Malai)', category: 'Dairy', unit: 'kg', onHand: 4.5, minThreshold: 2.0, costPerUnitPaise: 38000, lastUpdated: Date.now() },
    { id: 'p_milk', name: 'Full Cream Buffalo Milk', category: 'Dairy', unit: 'l', onHand: 18.0, minThreshold: 5.0, costPerUnitPaise: 6800, lastUpdated: Date.now() },
    { id: 'p_rice', name: 'Dehradun Basmati Rice', category: 'Grocery', unit: 'kg', onHand: 42.0, minThreshold: 15.0, costPerUnitPaise: 11000, lastUpdated: Date.now() },
    { id: 'p_oil', name: 'Refined Sunflower Oil', category: 'Grocery', unit: 'l', onHand: 24.0, minThreshold: 10.0, costPerUnitPaise: 13500, lastUpdated: Date.now() },
    { id: 'p_onions', name: 'Nashik Red Onions', category: 'Vegetables', unit: 'kg', onHand: 22.0, minThreshold: 10.0, costPerUnitPaise: 3500, lastUpdated: Date.now() },
    { id: 'p_tomatoes', name: 'Fresh Hybrid Tomatoes', category: 'Vegetables', unit: 'kg', onHand: 8.0, minThreshold: 5.0, costPerUnitPaise: 4000, lastUpdated: Date.now() },
    { id: 'p_tea_leaves', name: 'Assam CTC Tea Leaves', category: 'Beverages', unit: 'kg', onHand: 3.2, minThreshold: 1.0, costPerUnitPaise: 42000, lastUpdated: Date.now() },
    { id: 'p_packaging_boxes', name: 'Meal Boxes 3-Compartment', category: 'Packaging', unit: 'pieces', onHand: 150, minThreshold: 50, costPerUnitPaise: 900, lastUpdated: Date.now() }
  ]

  const printers: PrinterDevice[] = [
    { id: 'prn_counter_bill', name: 'Counter Bill Printer (80mm)', ip: '192.168.1.101', port: 9100, role: 'BILL', paperWidth: '80mm', status: 'ONLINE', lastPingMs: 14, lastChecked: Date.now() },
    { id: 'prn_kitchen_kot', name: 'Kitchen KOT Hot Printer (80mm)', ip: '192.168.1.102', port: 9100, role: 'KITCHEN', paperWidth: '80mm', status: 'ONLINE', lastPingMs: 22, lastChecked: Date.now() },
    { id: 'prn_bar_kot', name: 'Bar Dispense Slip Printer (58mm)', ip: '192.168.1.103', port: 9100, role: 'BAR', paperWidth: '58mm', status: 'ONLINE', lastPingMs: 18, lastChecked: Date.now() }
  ]

  return {
    org,
    activeRole: 'COUNTER',
    currentDeviceName: 'Main Terminal',
    menu,
    tables,
    orders,
    kots,
    bills: [],
    pantry,
    pantryMovements: [],
    printers,
    dayCloses: [],
    auditLogs: [
      { id: 'al_1', at: Date.now() - 3600000, actor: 'Owner', role: 'ADMIN', action: 'ORG_INITIALIZED', details: 'Kokum House initialized with 4 module codes' }
    ],
    nextOrderNo: 103,
    nextKotNo: 4,
    nextInvoiceNo: 1001
  }
}

class StorageManager {
  private channel: BroadcastChannel | null = null
  private listeners: Array<() => void> = []

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
      this.channel.onmessage = () => {
        this.notify()
      }
    }
  }

  load(): AppStore {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch (e) {
      console.error('Failed to load store from localStorage', e)
    }
    const seed = getInitialSeedStore()
    this.save(seed, false)
    return seed
  }

  save(store: AppStore, broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
      if (broadcast && this.channel) {
        this.channel.postMessage({ type: 'STORE_UPDATED', timestamp: Date.now() })
      }
    } catch (e) {
      console.error('Failed to save store to localStorage', e)
    }
    this.notify()
  }

  subscribe(callback: () => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb())
  }
}

export const storage = new StorageManager()


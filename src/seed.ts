import type { Doc, Outlet } from './model'

function outlet(): Outlet {
  return {
    id: 'kokum',
    name: 'Kokum House',
    address: '14 River Lane, Panaji',
    phone: '0832 000 0000',
    gstin: '',
    invoicePrefix: 'KH',
    nextInvoice: 101,
    gstRateBp: 500,
    pricesIncludeGst: false,
    serviceChargeBp: 0,
    packagingPaise: 1000,
    ownerPin: '2580',
    tables: [
      { id: 't1', name: 'Verandah 1' },
      { id: 't2', name: 'Verandah 2' },
      { id: 't3', name: 'Window' },
      { id: 't4', name: 'Long table' },
    ],
    menu: [
      { id: 'chai', name: 'Masala chai', category: 'Drinks', price: 4000, station: 'Bar', stockId: 'tea', portion: 1, available: true },
      { id: 'coffee', name: 'Filter coffee', category: 'Drinks', price: 5000, station: 'Bar', available: true, portion: 1 },
      { id: 'sol', name: 'Sol kadhi', category: 'Drinks', price: 6000, station: 'Bar', available: true, portion: 1 },
      { id: 'vada', name: 'Vada pav', category: 'Snacks', price: 5500, station: 'Kitchen', stockId: 'pav', portion: 1, available: true },
      { id: 'tikka', name: 'Paneer tikka', category: 'Starters', price: 24500, station: 'Tandoor', stockId: 'paneer', portion: 0.2, available: true },
      { id: 'dal', name: 'Dal tadka', category: 'Mains', price: 18000, station: 'Kitchen', available: true, portion: 1 },
      { id: 'biryani', name: 'Veg biryani', category: 'Mains', price: 24000, station: 'Kitchen', stockId: 'rice', portion: 0.15, available: true },
      { id: 'jamun', name: 'Gulab jamun', category: 'Dessert', price: 9000, station: 'Dessert', available: true, portion: 1 },
    ],
    stock: [
      { id: 'tea', name: 'Tea pours', unit: 'cup', onHand: 40, lowAt: 8 },
      { id: 'pav', name: 'Pav', unit: 'piece', onHand: 24, lowAt: 8 },
      { id: 'paneer', name: 'Paneer', unit: 'kg', onHand: 2, lowAt: 0.4 },
      { id: 'rice', name: 'Rice', unit: 'kg', onHand: 5, lowAt: 1 },
    ],
    orders: [],
    bills: [],
    customers: [{ id: 'asha', name: 'Asha Kamat', phone: '9819000111', points: 40, visits: 3 }],
    reservations: [],
    rooms: [
      { id: 'r101', number: '101', guest: '', balance: 0, occupied: false },
      { id: 'r102', number: '102', guest: 'Meera Shah', balance: 0, occupied: true },
    ],
    online: [],
    campaigns: [],
    packs: [
      { id: 'gst-5', name: 'Restaurant service 5%', rateBp: 500, charge: 'Included with the outlet' },
      { id: 'gst-18', name: 'Specified premises 18%', rateBp: 1800, charge: 'Priced when you release it' },
    ],
    audit: [],
    kotSeq: 100,
    dayOpen: true,
  }
}

export function seedDoc(): Doc {
  const first = outlet()
  return { rev: 0, activeId: first.id, outlets: [first] }
}

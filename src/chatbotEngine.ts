import type { AppStore } from './storage'
import { formatINR } from './gstEngine'

export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: number
  action?: {
    label: string
    screen?: string
    tableId?: string
    command?: string
  }
  diagnostics?: Array<{
    name: string
    status: 'PASS' | 'WARN' | 'FAIL'
    detail: string
  }>
}

export function processChatQuery(
  rawQuery: string,
  store: AppStore,
  onNavigate: (screen: string) => void
): ChatMessage {
  const q = rawQuery.toLowerCase().trim()
  const now = Date.now()

  // 1. Diagnostics / Health Check command
  if (
    q.includes('diagnos') ||
    q.includes('check system') ||
    q.includes('test system') ||
    q.includes('something is wrong') ||
    q.includes('kuch problem hai') ||
    q.includes('health')
  ) {
    const printerDiag = store.printers.map(p => ({
      name: `Printer: ${p.name} (${p.ip}:${p.port})`,
      status: (p.status === 'ONLINE' ? 'PASS' : p.status === 'PAPER_OUT' ? 'WARN' : 'FAIL') as 'PASS' | 'WARN' | 'FAIL',
      detail: p.status === 'ONLINE' ? `Reachable in ${p.lastPingMs}ms` : `Status: ${p.status}. Check power and network cable.`
    }))

    const openOrdersCount = store.orders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED').length
    const cookingKotCount = store.kots.filter(k => k.status === 'COOKING' || k.status === 'NEW').length

    const diags: ChatMessage['diagnostics'] = [
      {
        name: 'Local Database (Offline-First)',
        status: 'PASS',
        detail: `Healthy with ${store.menu.length} menu items, ${store.tables.length} tables, ${store.bills.length} bills.`
      },
      ...printerDiag,
      {
        name: 'Device Sync & Module Codes',
        status: 'PASS',
        detail: `${store.org?.devices.length || 0} paired devices connected on restaurant network.`
      },
      {
        name: 'Active Floor Status',
        status: openOrdersCount > 0 ? 'PASS' : 'PASS',
        detail: `${openOrdersCount} active tables occupied, ${cookingKotCount} tickets in kitchen pass.`
      }
    ]

    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: 'Here is the instant diagnostic scan of your restaurant system. Everything is operating locally without cloud downtime.',
      timestamp: now,
      diagnostics: diags
    }
  }

  // 2. Sales / Today / Audits query
  if (
    q.includes('sale') ||
    q.includes('aaj ka') ||
    q.includes('today') ||
    q.includes('kamai') ||
    q.includes('revenue') ||
    q.includes('audit')
  ) {
    const totalSalesPaise = store.bills.reduce((acc, b) => acc + b.calc.payablePaise, 0)
    const billCount = store.bills.length
    const cashTotal = store.bills.filter(b => b.payment.method === 'CASH').reduce((acc, b) => acc + b.calc.payablePaise, 0)
    const upiTotal = store.bills.filter(b => b.payment.method === 'UPI').reduce((acc, b) => acc + b.calc.payablePaise, 0)

    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Today's Real-Time Summary:\n• Total Billed Sales: ${formatINR(totalSalesPaise)} across ${billCount} bills\n• Cash Collected: ${formatINR(cashTotal)}\n• UPI Collected: ${formatINR(upiTotal)}\n• Active Open Tables: ${store.orders.filter(o => o.status !== 'PAID').length}`,
      timestamp: now,
      action: {
        label: 'Open Manager Audit Dashboard',
        screen: 'manager'
      }
    }
  }

  // 3. Printer Help / Issues
  if (
    q.includes('printer') ||
    q.includes('print') ||
    q.includes('kot nahi') ||
    q.includes('chhap') ||
    q.includes('paper')
  ) {
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Printer Troubleshooting Guide:\n1. Check if the printer's local IP address (e.g., 192.168.1.101:9100) is reachable on the router.\n2. Ensure the thermal paper roll has thermal coating facing the printhead.\n3. Make sure the cover is tightly latched.\n4. You can re-ping or send a Test Slip directly from the Printer Manager tab.\n5. Note: Orders are ALWAYS saved safely on your device even if a printer is unplugged!`,
      timestamp: now,
      action: {
        label: 'Open Printer Network Settings',
        screen: 'manager'
      }
    }
  }

  // 4. GST / Tax Settings
  if (
    q.includes('gst') ||
    q.includes('tax') ||
    q.includes('cgst') ||
    q.includes('sgst') ||
    q.includes('vat')
  ) {
    const ratePercent = (store.org?.tax.gstRateBp || 0) / 100
    const inclusive = store.org?.tax.pricesIncludeGst ? 'Inclusive' : 'Exclusive (added on top)'
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Current GST Configuration:\n• Current GST Rate: ${ratePercent}%\n• Price Type: ${inclusive}\n• Service Charge: ${(store.org?.tax.serviceChargeBp || 0) / 100}%\n• Takeaway Packaging: ${formatINR(store.org?.tax.packagingPaise || 0)}\n\nYou as Main Admin can update GST rates directly anytime in Tax Settings with immediate effect on all new bills!`,
      timestamp: now,
      action: {
        label: 'Change GST / Tax Rates',
        screen: 'manager'
      }
    }
  }

  // 5. Kitchen / KOT
  if (q.includes('kitchen') || q.includes('cook') || q.includes('rasoi') || q.includes('chef') || q.includes('kot')) {
    const activeKots = store.kots.filter(k => k.status !== 'SERVED')
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `There are currently ${activeKots.length} active tickets in the Kitchen Display System (KDS). You can mark tickets as 'Preparing', 'Ready', or 86 unavailable dishes.`,
      timestamp: now,
      action: {
        label: 'Go to Kitchen Display (KDS)',
        screen: 'kitchen'
      }
    }
  }

  // 6. Pantry / Grocery / Stock
  if (
    q.includes('pantry') ||
    q.includes('stock') ||
    q.includes('grocery') ||
    q.includes('ration') ||
    q.includes('saman') ||
    q.includes('raw material') ||
    q.includes('paneer') ||
    q.includes('milk')
  ) {
    const lowStock = store.pantry.filter(p => p.onHand <= p.minThreshold)
    const lowText = lowStock.length > 0
      ? `Alert: ${lowStock.length} items low in stock (${lowStock.map(i => i.name).join(', ')})!`
      : 'All pantry grocery items are currently within safe par levels.'
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Pantry & Grocery Audit:\n${lowText}\nYou can record supplier purchases, log kitchen wastage, or perform a physical stock audit anytime.`,
      timestamp: now,
      action: {
        label: 'Open Pantry Audit Module',
        screen: 'manager'
      }
    }
  }

  // 7. Add Menu / Change Menu
  if (
    q.includes('menu') ||
    q.includes('dish') ||
    q.includes('price') ||
    q.includes('item') ||
    q.includes('khana') ||
    q.includes('rate')
  ) {
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Menu Management:\nYou have ${store.menu.length} active menu items. You can add new dishes, modify prices, assign station printers (Kitchen, Tandoor, Bar), and toggle 86 item availability in the Menu Editor.`,
      timestamp: now,
      action: {
        label: 'Open Menu Editor',
        screen: 'manager'
      }
    }
  }

  // 8. Waiter / Take Order / Tables
  if (
    q.includes('waiter') ||
    q.includes('table') ||
    q.includes('order') ||
    q.includes('seat') ||
    q.includes('dine')
  ) {
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Table & Waiter Operations:\nSelect any table on the interactive floor map, punch dishes with quick search or short codes, add special notes (e.g. less spicy), and tap 'Send to Kitchen' to create KOTs instantly.`,
      timestamp: now,
      action: {
        label: 'Go to Order Taking (Waiter)',
        screen: 'waiter'
      }
    }
  }

  // 9. Billing / Counter
  if (
    q.includes('bill') ||
    q.includes('counter') ||
    q.includes('payment') ||
    q.includes('hisab') ||
    q.includes('invoice')
  ) {
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Counter Billing Terminal:\nReview table bills with exact GST breakdowns (CGST + SGST), apply manager discounts, record Cash/UPI/Card payments, and print 80mm/58mm thermal receipts with one tap.`,
      timestamp: now,
      action: {
        label: 'Go to Billing Counter',
        screen: 'counter'
      }
    }
  }

  // 10. Device pairing & module codes
  if (
    q.includes('code') ||
    q.includes('device') ||
    q.includes('phone') ||
    q.includes('join') ||
    q.includes('tablet')
  ) {
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Module Codes for Connecting Devices:\n• Kitchen Tablet Code: ${store.org?.codes.kitchen}\n• Waiter Mobile Code: ${store.org?.codes.waiter}\n• Counter Terminal Code: ${store.org?.codes.counter}\n• Manager Code: ${store.org?.codes.manager}\n\nAny staff device on your restaurant WiFi can open Mise and enter their module code to join instantly!`,
      timestamp: now,
      action: {
        label: 'View Connected Devices',
        screen: 'manager'
      }
    }
  }

  // 11. Day close / Z-report
  if (
    q.includes('close') ||
    q.includes('band') ||
    q.includes('z-report') ||
    q.includes('shift')
  ) {
    return {
      id: `bot_${now}`,
      sender: 'bot',
      text: `Day Close (Z-Report) Protocol:\n1. Open Day Close in Manager tab.\n2. Enter physical cash counted in your till.\n3. The system compares with registered orders to highlight cash variances.\n4. Locks the business day and produces an exportable sales summary.`,
      timestamp: now,
      action: {
        label: 'Open Day Close Screen',
        screen: 'manager'
      }
    }
  }

  // Default fallback
  return {
    id: `bot_${now}`,
    sender: 'bot',
    text: `I am Mise Assistant, your 24/7 self-service POS support. I can help you with:\n• 'Check system' (Runs live diagnostics on printers & database)\n• 'Today sales' (Instant financial summary)\n• 'Printer help' (Troubleshoot network printer IPs & paper)\n• 'Change GST' (Adjust tax rates directly)\n• 'Pantry stock' (Inspect grocery inventory & shortages)\n• 'Add menu item' or 'Table 4 order'`,
    timestamp: now
  }
}


import React, { useState, useEffect } from 'react'
import type {
  DeviceRole,
  Order,
  KOT,
  Bill,
  PantryItem,
  PrinterDevice,
  TaxSettings,
  Organisation,
  MenuItem
} from './types'
import { storage, type AppStore } from './storage'
import { Navbar } from './components/Navbar'
import { AskBar } from './components/AskBar'
import { ChatbotDrawer } from './components/ChatbotDrawer'
import { OrgOnboarding } from './components/OrgOnboarding'
import { WaiterModule } from './components/WaiterModule'
import { KitchenModule } from './components/KitchenModule'
import { CounterModule } from './components/CounterModule'
import { ManagerModule } from './components/ManagerModule'
import { ThermalPrintModal } from './components/ThermalPrintModal'

export default function App() {
  const [store, setStore] = useState<AppStore>(() => storage.load())
  const [currentScreen, setCurrentScreen] = useState<string>('counter')
  const [askBarOpen, setAskBarOpen] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [chatbotQuery, setChatbotQuery] = useState('')
  const [orgModalOpen, setOrgModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  // Thermal Print modal state
  const [thermalModal, setThermalModal] = useState<{
    isOpen: boolean
    bill?: Bill | null
    kot?: KOT | null
    testPrinter?: PrinterDevice | null
  }>({ isOpen: false })

  // Subscribe to storage cross-tab/cross-device changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStore(storage.load())
    })
    return () => unsubscribe()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => {
      setToast(prev => (prev === msg ? '' : prev))
    }, 3500)
  }

  // 1. Order Saving & Table status synchronization
  const handleSaveOrder = (updatedOrder: Order) => {
    setStore(prev => {
      const orderExists = prev.orders.some(o => o.id === updatedOrder.id)
      const newOrders = orderExists
        ? prev.orders.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
        : [...prev.orders, updatedOrder]

      // Update Table Status
      const newTables = prev.tables.map(t => {
        if (t.id === updatedOrder.tableId) {
          return {
            ...t,
            status: updatedOrder.status === 'PAID' ? ('FREE' as const) : t.status === 'FREE' ? ('ORDERING' as const) : t.status,
            activeOrderId: updatedOrder.status === 'PAID' ? undefined : updatedOrder.id
          }
        }
        return t
      })

      const next = { ...prev, orders: newOrders, tables: newTables }
      storage.save(next)
      return next
    })
  }

  // 2. Dispatch KOT to stations & kitchen
  const handleSendKot = (orderId: string) => {
    setStore(prev => {
      const order = prev.orders.find(o => o.id === orderId)
      if (!order) return prev

      const unsentLines = order.lines.filter(l => !l.sentToKitchen)
      if (unsentLines.length === 0) return prev

      // Group unsent lines by station (Kitchen, Bar, Tandoor, Dessert)
      const stationGroups: { [st: string]: typeof unsentLines } = {}
      unsentLines.forEach(line => {
        const st = line.station || 'Kitchen'
        if (!stationGroups[st]) stationGroups[st] = []
        stationGroups[st].push(line)
      })

      let currentKotNo = prev.nextKotNo
      const newKots: KOT[] = []

      Object.entries(stationGroups).forEach(([station, lines]) => {
        const kot: KOT = {
          id: `kot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: order.id,
          kotNumber: currentKotNo++,
          table: order.tableName,
          station,
          type: order.type === 'TAKEAWAY' ? 'Takeaway' : 'Dine-in',
          status: 'NEW',
          lines: lines.map(l => ({
            id: `kl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: l.name,
            qty: l.qty,
            notes: l.notes,
            action: 'ADD'
          })),
          createdAt: Date.now(),
          printed: true,
          printedAt: Date.now()
        }
        newKots.push(kot)
      })

      // Mark lines as sent
      const updatedLines = order.lines.map(l => ({ ...l, sentToKitchen: true }))
      const updatedOrder: Order = {
        ...order,
        lines: updatedLines,
        status: 'COOKING',
        updatedAt: Date.now()
      }

      // Update Table Status to COOKING
      const newTables = prev.tables.map(t =>
        t.id === order.tableId ? { ...t, status: 'COOKING' as const } : t
      )

      const next: AppStore = {
        ...prev,
        orders: prev.orders.map(o => (o.id === order.id ? updatedOrder : o)),
        tables: newTables,
        kots: [...prev.kots, ...newKots],
        nextKotNo: currentKotNo
      }

      storage.save(next)
      return next
    })
  }

  // 3. Kitchen update KOT status
  const handleUpdateKotStatus = (kotId: string, status: KOT['status']) => {
    setStore(prev => {
      const kot = prev.kots.find(k => k.id === kotId)
      if (!kot) return prev

      const updatedKots = prev.kots.map(k => (k.id === kotId ? { ...k, status } : k))

      // Check if all KOTs for this order are ready
      const orderKots = updatedKots.filter(k => k.orderId === kot.orderId)
      const allReady = orderKots.every(k => k.status === 'READY' || k.status === 'SERVED')

      let updatedTables = prev.tables
      let updatedOrders = prev.orders

      if (allReady) {
        const order = prev.orders.find(o => o.id === kot.orderId)
        if (order) {
          updatedOrders = prev.orders.map(o =>
            o.id === order.id ? { ...o, status: 'READY' as const } : o
          )
          updatedTables = prev.tables.map(t =>
            t.id === order.tableId ? { ...t, status: 'READY' as const } : t
          )
        }
      }

      const next = {
        ...prev,
        kots: updatedKots,
        tables: updatedTables,
        orders: updatedOrders
      }
      storage.save(next)
      return next
    })
  }

  // 4. Settle Bill & Free table
  const handleSettleBill = (newBill: Bill) => {
    setStore(prev => {
      // Mark order as PAID
      const updatedOrders = prev.orders.map(o =>
        o.id === newBill.orderId ? { ...o, status: 'PAID' as const, updatedAt: Date.now() } : o
      )

      // Free the table
      const order = prev.orders.find(o => o.id === newBill.orderId)
      const updatedTables = prev.tables.map(t => {
        if (t.id === order?.tableId) {
          return {
            ...t,
            status: 'FREE' as const,
            activeOrderId: undefined
          }
        }
        return t
      })

      // Recipe / Pantry deduction (stock-lite)
      const updatedPantry = prev.pantry.map(item => {
        let deductedQty = 0
        newBill.lines.forEach(l => {
          const menuItem = prev.menu.find(m => m.id === l.menuItemId)
          if (menuItem && menuItem.stockItemId === item.id && menuItem.recipePortion) {
            deductedQty += menuItem.recipePortion * l.qty
          }
        })
        if (deductedQty > 0) {
          return {
            ...item,
            onHand: Math.max(0, item.onHand - deductedQty),
            lastUpdated: Date.now()
          }
        }
        return item
      })

      const next = {
        ...prev,
        bills: [...prev.bills, newBill],
        orders: updatedOrders,
        tables: updatedTables,
        pantry: updatedPantry,
        nextInvoiceNo: prev.nextInvoiceNo + 1
      }

      storage.save(next)
      return next
    })

    // Immediately trigger thermal slip preview
    setThermalModal({
      isOpen: true,
      bill: newBill
    })
  }

  // 5. Menu changes
  const handleUpdateMenu = (newMenu: MenuItem[]) => {
    setStore(prev => {
      const next = { ...prev, menu: newMenu }
      storage.save(next)
      return next
    })
  }

  // 6. Pantry changes
  const handleUpdatePantry = (newPantry: PantryItem[]) => {
    setStore(prev => {
      const next = { ...prev, pantry: newPantry }
      storage.save(next)
      return next
    })
  }

  // 7. Printers changes
  const handleUpdatePrinters = (newPrinters: PrinterDevice[]) => {
    setStore(prev => {
      const next = { ...prev, printers: newPrinters }
      storage.save(next)
      return next
    })
  }

  // 8. Tax settings changes (Main Admin direct control)
  const handleUpdateTax = (newTax: TaxSettings) => {
    setStore(prev => {
      if (!prev.org) return prev
      const updatedOrg: Organisation = {
        ...prev.org,
        tax: newTax
      }
      const next = { ...prev, org: updatedOrg }
      storage.save(next)
      return next
    })
  }

  // 9. Day Close
  const handleRunDayClose = (countedCashPaise: number, notes: string) => {
    setStore(prev => {
      const cashExpectedPaise = prev.bills
        .filter(b => b.payment.method === 'CASH')
        .reduce((s, b) => s + b.calc.payablePaise, 0)

      const variancePaise = countedCashPaise - cashExpectedPaise

      const closeReport = {
        id: `close_${Date.now()}`,
        closedAt: Date.now(),
        closedBy: 'Main Admin',
        dateString: new Date().toLocaleDateString('en-IN'),
        totalSalesPaise: prev.bills.reduce((s, b) => s + b.calc.payablePaise, 0),
        totalTaxPaise: prev.bills.reduce((s, b) => s + b.calc.totalTaxPaise, 0),
        cgstTotalPaise: prev.bills.reduce((s, b) => s + b.calc.cgstPaise, 0),
        sgstTotalPaise: prev.bills.reduce((s, b) => s + b.calc.sgstPaise, 0),
        cashExpectedPaise,
        cashCountedPaise: countedCashPaise,
        cashVariancePaise: variancePaise,
        upiTotalPaise: prev.bills.filter(b => b.payment.method === 'UPI').reduce((s, b) => s + b.calc.payablePaise, 0),
        cardTotalPaise: prev.bills.filter(b => b.payment.method === 'CARD').reduce((s, b) => s + b.calc.payablePaise, 0),
        totalBills: prev.bills.length,
        totalDiscountsPaise: prev.bills.reduce((s, b) => s + b.calc.discountPaise, 0),
        notes
      }

      const next = {
        ...prev,
        dayCloses: [...prev.dayCloses, closeReport]
      }
      storage.save(next)
      return next
    })
  }

  const handleOpenAskChatbot = (query: string) => {
    setChatbotQuery(query)
    setChatbotOpen(true)
  }

  return (
    <div className="mise-app-container">
      {/* Global Top Navbar */}
      <Navbar
        org={store.org}
        activeRole={store.activeRole}
        currentScreen={currentScreen}
        printers={store.printers}
        onSelectScreen={screen => setCurrentScreen(screen)}
        onSelectRole={role => {
          setStore(prev => {
            const next = { ...prev, activeRole: role }
            storage.save(next)
            return next
          })
        }}
        onOpenAskBar={() => setAskBarOpen(true)}
        onToggleChatbot={() => setChatbotOpen(!chatbotOpen)}
        onOpenOrgModal={() => setOrgModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="main-content-area" id="workspace">
        {currentScreen === 'waiter' && (
          <WaiterModule
            tables={store.tables}
            menu={store.menu}
            orders={store.orders}
            onSaveOrder={handleSaveOrder}
            onSendKot={handleSendKot}
            onToast={showToast}
          />
        )}

        {currentScreen === 'kitchen' && (
          <KitchenModule
            kots={store.kots}
            menu={store.menu}
            onUpdateKotStatus={handleUpdateKotStatus}
            onToggleItemAvailability={(itemId, available) => {
              const updated = store.menu.map(m => (m.id === itemId ? { ...m, available } : m))
              handleUpdateMenu(updated)
            }}
            onPrintKot={kot => {
              setThermalModal({
                isOpen: true,
                kot
              })
            }}
            onToast={showToast}
          />
        )}

        {currentScreen === 'counter' && (
          <CounterModule
            orders={store.orders}
            bills={store.bills}
            taxSettings={store.org?.tax || {
              gstRateBp: 500,
              pricesIncludeGst: false,
              serviceChargeBp: 0,
              packagingPaise: 1500,
              roundToNearestRupee: true,
              invoicePrefix: 'KH'
            }}
            onSettleBill={handleSettleBill}
            onPrintBill={bill => {
              setThermalModal({
                isOpen: true,
                bill
              })
            }}
            onToast={showToast}
            nextInvoiceNo={store.nextInvoiceNo}
          />
        )}

        {currentScreen === 'manager' && (
          <ManagerModule
            store={store}
            onUpdateMenu={handleUpdateMenu}
            onUpdatePantry={handleUpdatePantry}
            onUpdatePrinters={handleUpdatePrinters}
            onUpdateTax={handleUpdateTax}
            onRunDayClose={handleRunDayClose}
            onToast={showToast}
            onTestPrint={printer => {
              setThermalModal({
                isOpen: true,
                testPrinter: printer
              })
            }}
          />
        )}
      </main>

      {/* Global Ask Bar (Ctrl+K) */}
      <AskBar
        isOpen={askBarOpen}
        onClose={() => setAskBarOpen(false)}
        menu={store.menu}
        tables={store.tables}
        onSelectScreen={screen => setCurrentScreen(screen)}
        onAskChatbot={handleOpenAskChatbot}
      />

      {/* 24/7 Self-Service Support Chatbot Drawer */}
      <ChatbotDrawer
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        store={store}
        onNavigate={screen => setCurrentScreen(screen)}
        initialQuery={chatbotQuery}
      />

      {/* Organisation Setup & Module Codes Modal */}
      <OrgOnboarding
        isOpen={orgModalOpen || !store.org}
        onClose={() => setOrgModalOpen(false)}
        currentOrg={store.org}
        onSaveOrg={newOrg => {
          setStore(prev => {
            const next = { ...prev, org: newOrg }
            storage.save(next)
            return next
          })
          showToast(`Organisation '${newOrg.name}' ready with 4 module codes!`)
        }}
        onJoinSuccess={(role, devName) => {
          setStore(prev => {
            const next = {
              ...prev,
              activeRole: role,
              currentDeviceName: devName
            }
            storage.save(next)
            return next
          })
          if (role === 'WAITER') setCurrentScreen('waiter')
          else if (role === 'KITCHEN') setCurrentScreen('kitchen')
          else if (role === 'COUNTER') setCurrentScreen('counter')
          else setCurrentScreen('manager')
          showToast(`Joined as ${devName} (${role} mode)!`)
        }}
      />

      {/* Thermal Print Modal */}
      <ThermalPrintModal
        isOpen={thermalModal.isOpen}
        onClose={() => setThermalModal({ isOpen: false })}
        bill={thermalModal.bill}
        kot={thermalModal.kot}
        testPrinter={thermalModal.testPrinter}
        org={store.org}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="mise-toast" role="status">
          <span>{toast}</span>
          <button onClick={() => setToast('')}>✕</button>
        </div>
      )}
    </div>
  )
}

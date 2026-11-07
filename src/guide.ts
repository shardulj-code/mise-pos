import type { Screen } from './model'

export function guideAnswer(question: string): { text: string; screen?: Screen } {
  const q = question.toLowerCase()
  if (!q.trim()) return { text: 'Ask about an order, the kitchen, a bill, GST, a printer, stock, a room, or a reservation.' }
  if (q.includes('printer') || q.includes('print') || q.includes('kot')) return { text: 'Bills and kitchen slips print from this computer. Open the bill and choose Print. If the paper is blank, check the printer is on and selected in the system print window. A failed print does not cancel the bill.', screen: 'bills' }
  if (q.includes('kitchen') || q.includes('ticket')) return { text: 'Open Kitchen. New tickets are on the left. Start moves a ticket to Cooking. Ready tells the counter it can go out.', screen: 'kitchen' }
  if (q.includes('gst') || q.includes('tax')) return { text: 'Main Admin sets the GST rate, whether prices already include it, service charge, and packaging. An issued bill keeps the rate it was printed with. Apply an update only when you want new bills to use it.', screen: 'admin' }
  if (q.includes('discount')) return { text: 'On the open order, enter a discount in rupees before you take payment. The bill shows it on its own line.', screen: 'counter' }
  if (q.includes('upi') || q.includes('payment') || q.includes('pay')) return { text: 'Take cash, card, or UPI on the bill. UPI is recorded when you confirm you received it, with the reference you type. The screen never treats a QR as proof.', screen: 'bills' }
  if (q.includes('stock') || q.includes('inventory') || q.includes('recipe')) return { text: 'Inventory counts down when a bill is paid, for dishes that have a stock link. If something is low, it is listed there. Selling still works when stock runs out, and the count goes negative so you can see the gap.', screen: 'inventory' }
  if (q.includes('point') || q.includes('loyal')) return { text: 'Attach a guest phone on the order before payment. They earn one point per rupee. One point takes one rupee off the bill.', screen: 'guests' }
  if (q.includes('reserv') || q.includes('book') || q.includes('wait')) return { text: 'Add the name, party size, and time under Reservations. Seat assigns a free table and opens it on the counter.', screen: 'book' }
  if (q.includes('room') || q.includes('hotel')) return { text: 'Rooms hold a guest name and a balance. On the bill, post the amount to a room instead of taking cash.', screen: 'rooms' }
  if (q.includes('swiggy') || q.includes('zomato') || q.includes('website') || q.includes('online')) return { text: 'Online orders are logged here and sent to the kitchen. Swiggy and Zomato will connect after partner approval. Until then, enter the order and the kitchen still receives it.', screen: 'online' }
  if (q.includes('whatsapp') || q.includes('sms') || q.includes('message')) return { text: 'Write the message under Online orders, in the campaign box. It is saved on this computer. Sending it needs a message balance, so this build does not pretend to send it.', screen: 'online' }
  if (q.includes('close') || q.includes('day') || q.includes('report') || q.includes('tally')) return { text: 'Day close totals the bills and tenders, then locks service. Download the Tally file from that screen. Open service when the next sitting starts.', screen: 'close' }
  if (q.includes('phone') || q.includes('tablet') || q.includes('join') || q.includes('wifi')) return { text: 'On the phone, open Main Admin and set the counter address to the address shown on the counter computer. The phone then follows the same orders.', screen: 'admin' }
  if (q.includes('pin')) return { text: 'The desk PIN protects GST changes and voids. The first PIN is 2580. Change it in Main Admin.', screen: 'admin' }
  if (q.includes('order') || q.includes('table') || q.includes('waiter')) return { text: 'Choose a table, tap dishes, then Send to kitchen. The table stays on that order until the bill is paid.', screen: 'counter' }
  return { text: 'I can open Counter, Kitchen, Bills, Inventory, Loyalty, Reservations, Rooms, Online orders, Day, or Main Admin. Name the task.' }
}

# 📖 MISE — User Guide & Step-by-Step Walkthrough

This guide walks you through setting up and running your restaurant on Mise from day one.

---

## Step 1: Create or Join an Organisation

### If you are the Restaurant Owner / First Device:
1. Launch Mise on your laptop or main counter tablet.
2. Click **"Create New Organisation"**.
3. Fill in:
   - **Restaurant Name:** (e.g. *Royal Biryani & Cafe*)
   - **Address:** (e.g. *Shop 4, MG Road, Mumbai*)
   - **GSTIN:** (e.g. *27AABCU9603R1ZM*)
   - **Default GST Rate:** *5%* (or your applicable slab)
4. Click **"Create Organisation & Generate Access Codes"**.
5. Save the **4 Unique Module Codes** shown on screen:
   - 🍳 **Kitchen Code:** `KITCH-XXXX`
   - 📝 **Waiter Code:** `WAITR-XXXX`
   - 💳 **Counter Code:** `COUNT-XXXX`
   - 📊 **Manager Code:** `MANG-XXXX`

### If you are adding staff devices (Waiters, Kitchen tablets):
1. Install and open the APK on the staff device.
2. Select **"Join Existing Organisation"**.
3. Enter your **Org ID** and the specific **Module Code** (e.g. enter `WAITR-XXXX` on a waiter's phone).
4. Tap **"Join & Lock Device"**. The device is now configured and locked to that role!

---

## Step 2: Taking an Order (Waiter Module)

1. **Select Table:** Tap any green (Free) table (e.g., Table 3).
2. **Browse Menu:** Filter by category (*Starters, Main Course, Breads, Beverages*) or use the search bar.
3. **Add Items:** Tap **"+"** on any dish to add to the cart.
4. **Special Instructions:** Type custom notes if needed (e.g. *"Spicy", "No onion"*).
5. **Send Order:** Tap **"Send KOT to Kitchen"**.
   - The table turns amber (Occupied).
   - The KOT is immediately transmitted to the kitchen.

---

## Step 3: Kitchen Display System (Kitchen Module)

1. The new KOT appears immediately in the **New Orders** column with a live timer.
2. Tap **"Start Cooking"** to move it to the **Cooking** column.
3. Once the dishes are plated, tap **"Mark Ready"** so the waiter knows the order is ready for pickup.
4. **Item 86 (Out of Stock):**
   - If an ingredient or dish runs out, the kitchen chef simply flips the **"86 Toggle"** in the top-right.
   - The dish is instantly greyed out across all waiter devices to prevent taking orders for unavailable food.

---

## Step 4: Billing & Payment (Counter Module)

1. When the guest requests the bill, open the **Counter Module**.
2. Tap the guest's table to see all accumulated KOTs.
3. Review the bill breakdown:
   - Items Subtotal
   - Optional Discount
   - **CGST (2.5%) + SGST (2.5%)** calculated to the exact paise.
4. Choose Payment Method:
   - 💵 **Cash:** Type the cash received; Mise automatically displays the exact change to return to the customer.
   - 📱 **UPI QR:** Displays a fast UPI QR code for Google Pay, PhonePe, Paytm, and BHIM.
   - 💳 **Card:** Record debit/credit card swipe.
5. Tap **"Issue Invoice & Print"**:
   - Generates the official tax invoice number (`INV-XXXX`).
   - Opens the photorealistic thermal receipt preview (80mm/58mm) and prints to your bill printer.
   - Clears the table for the next guest.

---

## Step 5: Pantry & Grocery Audit (Manager Module)

1. Go to **Manager Module** -> **Pantry** tab.
2. View real-time inventory of restaurant raw materials:
   - Basmati Rice, Amul Butter, Fresh Paneer, Chicken, Spices, Dairy.
3. To log new wholesale grocery purchases:
   - Tap **"Record Purchase"**, enter quantity (kg/liters) and invoice amount.
4. Daily Audit:
   - Compare physical stock against system expected consumption to spot shrinkage or kitchen waste immediately.

---

## Step 6: Thermal Printer Setup (Port 9100)

1. Go to **Manager Module** -> **Printers** tab.
2. Tap **"Add Network Printer"**.
3. Choose Role: **Kitchen KOT Printer** or **Counter Bill Printer**.
4. Enter the thermal printer's local IP address (e.g. `192.168.1.200`) and Port `9100`.
5. Tap **"Test Ping"** to verify connection, then tap **"Print Test Slip"**.

---

## Step 7: 24/7 Self-Service Chatbot ("Ask Mise")

- Click the floating **"Ask Mise (24/7)"** button on any screen or press `Ctrl+K`.
- If an issue arises (e.g., thermal printer offline, tax rate changed by government, need day-end settlement):
  - Type your question in plain English or Hinglish (e.g. *"printer offline hai"*, *"gst 12% kaise karein"*).
  - Mise's diagnostic scanner immediately runs a diagnostic check on your system and provides a step-by-step fix with one-click navigation buttons.


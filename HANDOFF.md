# Mise handoff

Written 7 November 2026. Nothing in this file has been built yet. The repo is still a clickable prototype.

## What Mise is

Mise is a one-time-payment restaurant and hotel system for a single Indian brand that wants to be the cheaper, simpler alternative to CaptainPad and Petpooja. The owner (Shlok) builds it without a software subscription, then charges each outlet once. Later updates, including GST rate packs, have a price Shlok sets. The restaurant Main Admin chooses when an update goes live. Issued bills keep the rates they were printed with.

There is no phone or chat support. An in-app English guide answers questions, opens the right screen, and walks through printer and order problems.

Language is English only. Hindi and Marathi are out. Do not add them.

## How it must behave

Every screen talks to a server Shlok controls. Each outlet keeps a local copy so service continues when the internet drops. While online, waiter phones, the kitchen, the counter, and other outlets update through the server. While offline, the counter computer keeps orders, kitchen tickets, and bills moving on the restaurant Wi-Fi, then syncs when the connection returns. An issued bill is never rewritten.

Real time means the kitchen and the counter update the moment a waiter, a QR guest, or an online order sends. The guide is not on that path.

GST is settings, not a legal essay. Remove every chartered-accountant sign-off, practice-mode watermark, and government-rules clause from the v2 documents. The Main Admin edits the rate, CGST and SGST split, inclusive or exclusive prices, service charge, packaging, and the invoice series. Shlok can ship an official GST update. The Main Admin sees the price and applies it. Old bills stay as they were.

Money is integer paise. A failed print or an unsent order is shown as failed. Never mark a payment or a print as done without evidence.

## The release is the whole product

Do not ship a small counter-only slice and call it the release. One release includes all of this:

- Waiter ordering on a phone, live kitchen, printed kitchen tickets and bills, day close
- GST the Main Admin edits, plus priced GST updates they apply
- Inventory and recipes, with stock moving when a dish is sold
- Loyalty on the same computer: phone number, visits, points redeemed on the bill
- QR table ordering
- Reservations and a waitlist
- The restaurant website and online ordering
- Swiggy and Zomato as a module that needs their partner approval and an internet connection
- WhatsApp or SMS campaigns. The tool is in the app. Each message is a paid balance, not free
- Automatic UPI through the restaurant’s own payment account. The gateway fee is theirs
- Several outlets in one login
- Hotel rooms and posting a restaurant bill to a room
- A Tally export file
- The English guide

Left out on purpose: a customer-feedback product, Hindi, Marathi, and a call centre.

## What cannot be free

The app can be built with free tools. These still cost money or need approval:

- The server
- Each WhatsApp or SMS message
- The UPI gateway fee, paid by the restaurant
- Swiggy and Zomato partner access. Dine-in billing must keep working if that module is down

QR for guests outside the restaurant, the website, Swiggy, WhatsApp, UPI, and multi-outlet login need the server. Dine-in billing, the kitchen, printing, inventory, loyalty, reservations, hotel rooms, and the Tally file must keep working from the local copy during an outage.

## Deliverables Shlok asked for

1. An APK for phones and tablets.
2. Desktop software for the counter computer and laptops.

Both install from the same product. Android is already a Capacitor project (`android/`, app id `in.mise.pos`). Desktop is not started. The v2 blueprint names Electron. The machine this was written on has Node 26 and no Java and no Android SDK, so an APK cannot be produced until a JDK and Android SDK are installed.

## What is already in the repo

Prototype only. Sample menu, fake kitchen tickets, no database, no sync, no printing.

- `src/App.tsx` — Counter, Kitchen, Main Admin, Mise Guide. Local React state.
- `src/styles.css`, `tokens.css`, `base.css` — existing visual system. Warm paper, charcoal, one saffron accent. Keep it. Do not restyle from scratch.
- `package.json` — React 19, Vite 8, Capacitor 8. Scripts: `npm run dev`, `npm run build`, `npm run mobile:sync`, `npm run mobile:android`.
- `documents/Mise_details/` — v2 spec (thesis, technical blueprint, GST, modules, agent handbook). Written 7 November 2026. Use it for workflows and screen behaviour. Ignore its CA gates, Hindi and Marathi, and its “core first, modules later” release plan. Shlok overrode those.
- `documents/Mise_POS_Complete_Documentation_Pack/` — earlier v1 pack. The v2 folder wins, except where this handoff overrides v2.
- `README.md` — still describes the prototype.

## Competitors, checked 7 November 2026

CaptainPad (captainpad.com, Extreme Apps, Pune) sells wireless captain ordering, KOT and bar prints, counter billing, table status, owner-controlled cancellation, MIS reports, inventory, CRM, kitchen display, waitlist, feedback, multi-outlet, and hotel PMS. It runs on existing Windows and Linux machines and Android phones. No public price. An old report put a full install around ₹2.5–6 lakh. They sell installation, training, and a phone help desk.

Petpooja sells cloud billing, KOT, split and merge, inventory, 80+ reports, Swiggy and Zomato, captain app, kitchen display, QR, CRM, loyalty, WhatsApp, and a website. Pricing is monthly or annual. Published 2026 figures are roughly ₹12,000 to ₹40,000 before tax. Captain app and kitchen display sit on the higher plans. The page leads with call and chat support.

GoFrugal still sells a one-time on-premise licence (starter around ₹18,000) plus a yearly renewal. Restroworks is a chain product with no public price. TMBill, UrbanPiper, and Rista are yearly or licence-plus-AMC.

Mise’s difference is one-time payment, owner-held data with a local copy, Main Admin control of GST and of when a paid update applies, and a guide instead of a call centre.

## Decisions already made

Do not ask these again.

| Topic | Decision |
| --- | --- |
| First release | The full list above, not a counter-only MVP |
| Language | English only |
| GST | Main Admin can edit rates. Shlok can ship a priced GST pack. Main Admin applies it |
| Price | One-time per outlet. Later updates have a price Shlok sets |
| Guide | Built in. Opens screens and runs checks. No internet and no paid AI |
| Print | Kitchen ticket and bill print from the counter computer |
| Where data lives | Every screen uses the server. Local copy keeps service alive offline |
| Feedback module | Out |
| CA and government-rule copy | Out |

## How to continue

1. Read this file, then `src/App.tsx` and `documents/Mise_details/Mise v2 — 01 Product Thesis and PRD.md`.
2. Keep the existing visual system.
3. Add a local database on the counter computer and a sync path to the server. Orders, tickets, and bills must work with the server unreachable.
4. Make the waiter, kitchen, bill, print, and day-close loop real before filling the other modules, but do not call the app finished until the full list is in.
5. Produce `app-release.apk` and a desktop installer. On this Linux machine, install a JDK and the Android SDK first, then `npm run build && npx cap sync android`.
6. Do not add Hindi or Marathi. Do not put a chartered-accountant gate back in.

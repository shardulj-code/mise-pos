import React, { useState } from 'react'
import type { Organisation, DeviceRole } from '../types'
import { generateRandomCode } from '../storage'

interface OrgOnboardingProps {
  isOpen: boolean
  onClose: () => void
  currentOrg: Organisation | null
  onSaveOrg: (org: Organisation) => void
  onJoinSuccess: (role: DeviceRole, deviceName: string) => void
}

export const OrgOnboarding: React.FC<OrgOnboardingProps> = ({
  isOpen,
  onClose,
  currentOrg,
  onSaveOrg,
  onJoinSuccess
}) => {
  const [tab, setTab] = useState<'create' | 'join' | 'view_codes'>(currentOrg ? 'view_codes' : 'create')
  
  // Create form state
  const [name, setName] = useState(currentOrg?.name || '')
  const [address, setAddress] = useState(currentOrg?.address || '')
  const [phone, setPhone] = useState(currentOrg?.phone || '')
  const [state, setState] = useState(currentOrg?.state || 'Maharashtra')
  const [stateCode, setStateCode] = useState(currentOrg?.stateCode || '27')
  const [gstin, setGstin] = useState(currentOrg?.tax.gstin || '')
  const [fssai, setFssai] = useState(currentOrg?.tax.fssaiNo || '')
  const [taxRateBp, setTaxRateBp] = useState<number>(currentOrg?.tax.gstRateBp ?? 500)
  const [ownerPin, setOwnerPin] = useState(currentOrg?.ownerPin || '1234')
  const [createdOrg, setCreatedOrg] = useState<Organisation | null>(currentOrg)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Join form state
  const [joinCode, setJoinCode] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [joinError, setJoinError] = useState('')

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newOrg: Organisation = {
      id: `org_${Date.now()}`,
      name: name.trim(),
      address: address.trim() || 'Restaurant Premises',
      phone: phone.trim() || '+91 98000 00000',
      state,
      stateCode,
      createdAt: Date.now(),
      ownerPin: ownerPin.trim() || '1234',
      codes: {
        kitchen: generateRandomCode('KITCH'),
        waiter: generateRandomCode('WAITR'),
        counter: generateRandomCode('COUNT'),
        manager: generateRandomCode('MANG')
      },
      devices: [
        {
          id: `dev_${Date.now()}`,
          name: 'Main Hub Terminal',
          role: 'ADMIN',
          codeUsed: 'HOST',
          ipAddress: '192.168.1.10',
          lastActive: Date.now(),
          status: 'online'
        }
      ],
      tax: {
        gstRateBp: taxRateBp,
        pricesIncludeGst: false,
        serviceChargeBp: 0,
        packagingPaise: 1500,
        roundToNearestRupee: true,
        invoicePrefix: name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'M'),
        gstin: gstin.trim(),
        fssaiNo: fssai.trim()
      }
    }

    setCreatedOrg(newOrg)
    onSaveOrg(newOrg)
    setTab('view_codes')
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setJoinError('')

    const code = joinCode.trim().toUpperCase()
    if (!currentOrg && !createdOrg) {
      setJoinError('No active organisation found on this host. Create one first!')
      return
    }

    const org = currentOrg || createdOrg!
    let assignedRole: DeviceRole | null = null

    if (code === org.codes.kitchen) assignedRole = 'KITCHEN'
    else if (code === org.codes.waiter) assignedRole = 'WAITER'
    else if (code === org.codes.counter) assignedRole = 'COUNTER'
    else if (code === org.codes.manager) assignedRole = 'MANAGER'

    if (!assignedRole) {
      setJoinError('Invalid module code. Please enter the exact code provided by your restaurant manager.')
      return
    }

    const devLabel = deviceName.trim() || `${assignedRole} Device`

    // Register device in org
    const updatedDevices = [
      ...org.devices,
      {
        id: `dev_${Date.now()}`,
        name: devLabel,
        role: assignedRole,
        codeUsed: code,
        lastActive: Date.now(),
        status: 'online' as const
      }
    ]

    const updatedOrg = { ...org, devices: updatedDevices }
    onSaveOrg(updatedOrg)
    onJoinSuccess(assignedRole, devLabel)
    onClose()
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(label)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const activeOrg = currentOrg || createdOrg

  return (
    <div className="modal-backdrop">
      <div className="modal-content org-modal">
        <div className="modal-header">
          <h2>🏢 Restaurant Organisation Setup</h2>
          {currentOrg && <button className="modal-close-btn" onClick={onClose}>✕</button>}
        </div>

        <div className="modal-tabs">
          {activeOrg && (
            <button
              className={`tab-btn ${tab === 'view_codes' ? 'is-active' : ''}`}
              onClick={() => setTab('view_codes')}
            >
              🔑 Module Join Codes
            </button>
          )}
          <button
            className={`tab-btn ${tab === 'create' ? 'is-active' : ''}`}
            onClick={() => setTab('create')}
          >
            ✨ Create Organisation
          </button>
          <button
            className={`tab-btn ${tab === 'join' ? 'is-active' : ''}`}
            onClick={() => setTab('join')}
          >
            📲 Join Device with Code
          </button>
        </div>

        <div className="modal-body">
          {/* TAB 1: VIEW CODES */}
          {tab === 'view_codes' && activeOrg && (
            <div className="codes-view-pane">
              <div className="info-callout">
                <strong>Organisation: {activeOrg.name}</strong>
                <p>
                  Share these module codes with your staff. Any smartphone, tablet or computer on the same restaurant WiFi can enter their respective code to unlock that specific screen!
                </p>
              </div>

              <div className="codes-grid">
                {/* 1. Kitchen Code */}
                <div className="code-card role-kitchen">
                  <div className="card-top">
                    <span className="card-badge">🍳 KITCHEN DISPLAY & KOT</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(activeOrg.codes.kitchen, 'kitchen')}
                    >
                      {copiedCode === 'kitchen' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="code-value">{activeOrg.codes.kitchen}</div>
                  <p className="code-desc">For Kitchen tablets & chef screens. Displays incoming orders and marks prep progress.</p>
                </div>

                {/* 2. Waiter Code */}
                <div className="code-card role-waiter">
                  <div className="card-top">
                    <span className="card-badge">📱 ORDER TAKING (WAITERS)</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(activeOrg.codes.waiter, 'waiter')}
                    >
                      {copiedCode === 'waiter' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="code-value">{activeOrg.codes.waiter}</div>
                  <p className="code-desc">For Waiter phones. Fast table selection, menu punching, and Send-to-Kitchen actions.</p>
                </div>

                {/* 3. Counter Code */}
                <div className="code-card role-counter">
                  <div className="card-top">
                    <span className="card-badge">🧾 BILLING COUNTER TERMINAL</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(activeOrg.codes.counter, 'counter')}
                    >
                      {copiedCode === 'counter' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="code-value">{activeOrg.codes.counter}</div>
                  <p className="code-desc">For Cashiers. Generates GST invoices, prints receipts, and records Cash/UPI/Card payments.</p>
                </div>

                {/* 4. Manager Code */}
                <div className="code-card role-manager">
                  <div className="card-top">
                    <span className="card-badge">📊 MANAGER & AUDIT ROOM</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(activeOrg.codes.manager, 'manager')}
                    >
                      {copiedCode === 'manager' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="code-value">{activeOrg.codes.manager}</div>
                  <p className="code-desc">For Owners & Managers. Sales audits, Pantry grocery stock, Menu editor & GST settings.</p>
                </div>
              </div>

              <div className="modal-actions-row">
                <button className="primary-button" onClick={onClose}>
                  Done & Continue Service
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ORGANISATION */}
          {tab === 'create' && (
            <form onSubmit={handleCreate} className="org-create-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Restaurant / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kokum House, Sagar Gaire, Royal Dhaba"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98221 00000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Street, Area, City, Pincode"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <select
                    value={state}
                    onChange={e => {
                      setState(e.target.value)
                      if (e.target.value === 'Goa') setStateCode('30')
                      else if (e.target.value === 'Maharashtra') setStateCode('27')
                      else if (e.target.value === 'Karnataka') setStateCode('29')
                      else if (e.target.value === 'Delhi') setStateCode('07')
                      else setStateCode('99')
                    }}
                  >
                    <option value="Maharashtra">Maharashtra (27)</option>
                    <option value="Goa">Goa (30)</option>
                    <option value="Karnataka">Karnataka (29)</option>
                    <option value="Delhi">Delhi (07)</option>
                    <option value="Gujarat">Gujarat (24)</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>GST Rate (Main Admin Control)</label>
                  <select
                    value={taxRateBp}
                    onChange={e => setTaxRateBp(Number(e.target.value))}
                  >
                    <option value={500}>5% GST (2.5% CGST + 2.5% SGST) - Standalone</option>
                    <option value={1800}>18% GST (9% CGST + 9% SGST) - Hotel Premises</option>
                    <option value={0}>0% GST - Composition / Non-Registered</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={gstin}
                    onChange={e => setGstin(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="form-group">
                  <label>Owner Master PIN *</label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    placeholder="e.g. 1234"
                    value={ownerPin}
                    onChange={e => setOwnerPin(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="primary-button">
                  🚀 Create Organisation & Generate 4 Module Codes
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: JOIN WITH CODE */}
          {tab === 'join' && (
            <form onSubmit={handleJoin} className="org-join-form">
              <p className="join-lead">
                Enter the secret Module Code provided by your restaurant owner to configure this phone, tablet or laptop.
              </p>

              {joinError && <div className="error-alert">{joinError}</div>}

              <div className="form-group">
                <label>Module Join Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WAITR-4192-M3 or KITCH-7821-X9"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label>Name This Device</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Mobile, Kitchen Counter Tablet"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="primary-button">
                  🔓 Join Organisation & Activate Module
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


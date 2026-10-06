import { useEffect, useState } from 'react'
import { db, getOrCreateCompany, getOrCreateSettings } from '@/database/db'
import type { Company, Settings } from '@/types'

export default function Mas() {
  const [company, setCompany] = useState<Company | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [logoPreview, setLogoPreview] = useState('')

  async function load() {
    setCompany(await getOrCreateCompany())
    setSettings(await getOrCreateSettings())
  }
  useEffect(()=>{load()},[])

  async function saveCompany(c: Partial<Company>) {
    if (!company) return
    await db.companies.update(1, { ...c, updatedAt: new Date().toISOString() })
    setCompany({ ...company, ...c })
  }
  async function saveSettings(s: Partial<Settings>) {
    if (!settings) return
    await db.settings.update(1, s)
    setSettings({ ...settings, ...s })
    if (s.darkMode === 'dark') document.body.classList.add('dark')
    if (s.darkMode === 'light') document.body.classList.remove('dark')
    if (s.darkMode === 'system') {
      const d = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.body.classList.toggle('dark', d)
    }
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const data = ev.target?.result as string
      setLogoPreview(data)
      saveCompany({ logo: data })
    }
    reader.readAsDataURL(file)
  }

  async function exportBackup() {
    const companies = await db.companies.toArray()
    const clients = await db.clients.toArray()
    const quotes = await db.quotes.toArray()
    const quoteItems = await db.quoteItems.toArray()
    const invoices = await db.invoices.toArray()
    const invoiceItems = await db.invoiceItems.toArray()
    const payments = await db.payments.toArray()
    const settings = await db.settings.toArray()
    const data = { companies, clients, quotes, quoteItems, invoices, invoiceItems, payments, settings, version: 1 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contapro-backup-${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  async function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (!confirm('Esto importará datos. ¿Continuar?')) return
      await db.transaction('rw', db.companies, db.clients, db.quotes, db.quoteItems, db.invoices, db.invoiceItems, db.payments, db.settings, async () => {
        await db.companies.clear(); await db.clients.clear(); await db.quotes.clear(); await db.quoteItems.clear(); await db.invoices.clear(); await db.invoiceItems.clear(); await db.payments.clear(); await db.settings.clear()
        if (data.companies) await db.companies.bulkAdd(data.companies)
        if (data.clients) await db.clients.bulkAdd(data.clients)
        if (data.quotes) await db.quotes.bulkAdd(data.quotes)
        if (data.quoteItems) await db.quoteItems.bulkAdd(data.quoteItems)
        if (data.invoices) await db.invoices.bulkAdd(data.invoices)
        if (data.invoiceItems) await db.invoiceItems.bulkAdd(data.invoiceItems)
        if (data.payments) await db.payments.bulkAdd(data.payments)
        if (data.settings) await db.settings.bulkAdd(data.settings)
      })
      alert('Importación exitosa')
      window.location.reload()
    } catch (err:any) {
      alert('Error importando: ' + err.message)
    }
  }

  return (
    <div className="screen active">
      <h1>Más</h1>
      <p className="sub">Configuración y utilidades</p>

      <div className="section">Empresa</div>
      <div className="form">
        <div className="field"><label>Nombre</label><input value={company?.nombre||''} onChange={e=>saveCompany({nombre:e.target.value})}/></div>
        <div className="field"><label>RUT</label><input value={company?.rut||''} onChange={e=>saveCompany({rut:e.target.value})}/></div>
        <div className="field"><label>Dirección</label><input value={company?.direccion||''} onChange={e=>saveCompany({direccion:e.target.value})}/></div>
        <div className="field"><label>Comuna</label><input value={company?.comuna||''} onChange={e=>saveCompany({comuna:e.target.value})}/></div>
        <div className="field"><label>Ciudad</label><input value={company?.ciudad||''} onChange={e=>saveCompany({ciudad:e.target.value})}/></div>
        <div className="field"><label>Teléfono</label><input value={company?.telefono||''} onChange={e=>saveCompany({telefono:e.target.value})}/></div>
        <div className="field"><label>Email</label><input value={company?.email||''} onChange={e=>saveCompany({email:e.target.value})}/></div>
        <div className="field"><label>Sitio web</label><input value={company?.sitioWeb||''} onChange={e=>saveCompany({sitioWeb:e.target.value})}/></div>
        <div className="field"><label>Logo</label><input type="file" accept="image/*" onChange={handleLogo}/></div>
        {company?.logo && <img src={company.logo} style={{maxHeight:60}}/>}
        <div className="field"><label>Texto legal</label><textarea value={company?.textoLegal||''} onChange={e=>saveCompany({textoLegal:e.target.value})}/></div>
        <div className="field"><label>Condiciones de pago</label><textarea value={company?.condicionesPago||''} onChange={e=>saveCompany({condicionesPago:e.target.value})}/></div>
      </div>

      <div className="section">Configuración</div>
      <div className="form">
        <div className="field"><label>IVA %</label><input type="number" step="0.01" value={settings?.ivaPorcentaje||19} onChange={e=>saveSettings({ivaPorcentaje:parseFloat(e.target.value)||19})}/></div>
        <div className="field"><label>Modo oscuro</label>
          <select value={settings?.darkMode||'system'} onChange={e=>saveSettings({darkMode:e.target.value as any})}>
            <option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Oscuro</option>
          </select>
        </div>
      </div>

      <div className="section">Copia de seguridad</div>
      <div className="card">
        <button className="btn" onClick={exportBackup}>Exportar backup (JSON)</button>
        <div style={{marginTop:10}}>
          <label className="btn secondary">Importar backup (JSON)
            <input type="file" accept="application/json" style={{display:'none'}} onChange={importBackup}/>
          </label>
        </div>
        <p style={{fontSize:12,color:'var(--muted)',marginTop:8}}>La importación valida y reemplaza todos los datos. Se recomienda exportar antes.</p>
      </div>

      <div className="section">Información</div>
      <div className="card">
        <p style={{margin:0,fontSize:13}}>ContaPro v1.0.0</p>
        <p style={{margin:0,fontSize:12,color:'var(--muted)'}}>Funciona offline. Listo para instalar como PWA.</p>
      </div>
    </div>
  )
}

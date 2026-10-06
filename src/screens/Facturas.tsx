import { useEffect, useState } from 'react'
import { listInvoices, getInvoice, updateInvoice, addPayment } from '@/services/invoiceService'
import { listClients } from '@/services/clientService'
import type { Client, Invoice } from '@/types'
import { formatCLP } from '@/utils/calc'
import { getOrCreateCompany } from '@/database/db'
import { generateDocumentHTML } from '@/pdf/pdf'

export default function Facturas() {
  const [items, setItems] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filter, setFilter] = useState<'todas'|'pendiente'|'pagada'|'vencida'>('todas')
  const [search, setSearch] = useState('')
  const [pago, setPago] = useState<{open:boolean,id?:number}>({open:false})
  const [pform, setPform] = useState({ fecha:new Date().toISOString().slice(0,10), monto:0, metodo:'efectivo', observacion:'' })

  async function load() {
    const [i,c] = await Promise.all([listInvoices(), listClients(false)])
    setItems(i); setClients(c)
  }
  useEffect(()=>{load()},[])

  const filtered = items.filter(x => {
    if (filter!=='todas' && x.estado!==filter) return false
    const s=search.toLowerCase()
    return x.numero.toLowerCase().includes(s) || (x.cliente?.nombre||'').toLowerCase().includes(s)
  })

  async function cambiarEstado(id:number, estado:any) { await updateInvoice(id,{estado} as any); load() }
  async function registrarPago(id:number) { setPago({open:true,id}); setPform({...pform, monto:0}) }
  async function guardarPago() {
    if (!pago.id) return
    await addPayment(pago.id, pform as any)
    await updateInvoice(pago.id,{estado:'pagada'} as any)
    setPago({open:false}); load()
  }
  async function verPDF(id:number) {
    const inv:any = await getInvoice(id)
    if (!inv) return
    const comp = await getOrCreateCompany()
    const cli = clients.find(c=>c.id===inv.clienteId)
    const html = generateDocumentHTML('factura', comp, cli, inv)
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); setTimeout(()=>w.print(),200) }
  }

  return (
    <div className="screen active">
      <h1>Facturas</h1>
      <p className="sub">Gestión de facturas</p>
      <input className="search" placeholder="Buscar por número o cliente" value={search} onChange={e=>setSearch(e.target.value)}/>
      <select className="search" value={filter} onChange={e=>setFilter(e.target.value as any)}>
        <option value="todas">Todas</option><option value="pendiente">Pendientes</option><option value="pagada">Pagadas</option><option value="vencida">Vencidas</option>
      </select>
      <div className="list" style={{marginTop:10}}>
        {filtered.map(f=>(
          <div key={f.id} className="item">
            <div className="row"><h3>{f.numero}</h3><span className={`badge b-${f.estado}`}>{f.estado}</span></div>
            <p>{f.cliente?.nombre||'Sin cliente'}</p>
            <p>{f.fecha} • Total: {formatCLP(f.total)}</p>
            <div className="actions" style={{marginTop:8}}>
              <button className="btn small secondary" onClick={()=>verPDF(f.id)}>Ver/Imprimir PDF</button>
              <select value={f.estado} onChange={e=>cambiarEstado(f.id,e.target.value)}>
                <option value="pendiente">Pendiente</option><option value="pagada">Pagada</option><option value="vencida">Vencida</option>
              </select>
              {f.estado!=='pagada' && <button className="btn small" onClick={()=>registrarPago(f.id)}>Registrar pago</button>}
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="empty">Sin facturas</div>}
      </div>

      {pago.open && (
        <div className="modal open" onClick={()=>setPago({open:false})}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <h2>Registrar pago</h2>
            <div className="form">
              <div className="field"><label>Fecha</label><input type="date" value={pform.fecha} onChange={e=>setPform({...pform,fecha:e.target.value})}/></div>
              <div className="field"><label>Monto</label><input type="number" step="0.01" value={pform.monto} onChange={e=>setPform({...pform,monto:parseFloat(e.target.value)||0})}/></div>
              <div className="field"><label>Método</label>
                <select value={pform.metodo} onChange={e=>setPform({...pform,metodo:e.target.value})}>
                  <option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="tarjeta">Tarjeta</option><option value="debito">Débito</option><option value="credito">Crédito</option><option value="otro">Otro</option>
                </select>
              </div>
              <div className="field"><label>Observación</label><textarea value={pform.observacion} onChange={e=>setPform({...pform,observacion:e.target.value})}/></div>
            </div>
            <div className="actions" style={{marginTop:10}}>
              <button className="btn" onClick={guardarPago}>Guardar</button>
              <button className="btn ghost" onClick={()=>setPago({open:false})}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

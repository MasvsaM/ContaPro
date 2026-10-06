import { useEffect, useState } from 'react'
import { listQuotes, getQuote, createQuote, updateQuote, deleteQuote } from '@/services/quoteService'
import { quoteToInvoice } from '@/services/invoiceService'
import { listClients } from '@/services/clientService'
import type { Client, Quote, QuoteItem } from '@/types'
import { calcDocumento, formatCLP } from '@/utils/calc'
import { getOrCreateCompany, getOrCreateSettings } from '@/database/db'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { generateDocumentHTML } from '@/pdf/pdf'
import { whatsappLink, mailtoLink } from '@/sharing/share'

export default function Presupuestos() {
  const [items, setItems] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<Quote|null>(null)
  const [form, setForm] = useState<any>({ clienteId:null, fecha:new Date().toISOString().slice(0,10), vencimiento:'', observaciones:'', condicionesPago:'', formaPago:'', descuento:0, iva:19, estado:'pendiente' })
  const [lineas, setLineas] = useState<QuoteItem[]>([])
  const [filter, setFilter] = useState<'todos'|'pendiente'|'aceptado'|'cancelado'|'pendiente_pago'>('todos')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    const [q,c] = await Promise.all([listQuotes(), listClients(false)])
    setItems(q); setClients(c)
  }
  useEffect(()=>{load()},[])

  function addLinea() { setLineas([...lineas, { descripcion:'', cantidad:1, precioUnitario:0, descuento:0, subtotal:0 }]) }
  function updLinea(i:number, k:keyof QuoteItem, v:any) { const l=[...lineas]; (l[i] as any)[k]=v; l[i].subtotal = Math.max(0, (l[i].cantidad*l[i].precioUnitario) - (l[i].cantidad*l[i].precioUnitario)*(l[i].descuento/100)); setLineas(l) }
  function delLinea(i:number){ setLineas(lineas.filter((_,idx)=>idx!==i)) }

  function openNew() {
    setEditing(null)
    setForm({ clienteId:null, fecha:new Date().toISOString().slice(0,10), vencimiento:'', observaciones:'', condicionesPago:'', formaPago:'', descuento:0, iva:19, estado:'pendiente' })
    setLineas([]); setShow(true)
  }
  async function openEdit(id:number) {
    const q:any = await getQuote(id)
    if (!q) return
    setEditing(q)
    setForm({ clienteId:q.clienteId, fecha:q.fecha, vencimiento:q.vencimiento, observaciones:q.observaciones, condicionesPago:q.condicionesPago, formaPago:q.formaPago, descuento:q.descuento, iva:q.iva, estado:q.estado })
    setLineas(q.items.map((it:any)=>({ descripcion:it.descripcion, cantidad:it.cantidad, precioUnitario:it.precioUnitario, descuento:it.descuento, subtotal:it.subtotal })))
    setShow(true)
  }

  const calc = calcDocumento(lineas, form.descuento||0, form.iva||19)

  async function save() {
    if (!form.clienteId) return alert('Seleccione cliente')
    if (lineas.length===0) return alert('Agregue al menos una línea')
    const payload:any = { ...form, subtotal: calc.netoFinal, descuento: calc.descuentoGlobal, iva: calc.iva, total: calc.total }
    if (editing) await updateQuote(editing.id, payload, lineas)
    else await createQuote(payload, lineas)
    setShow(false); load(); toastMsg('Guardado')
  }

  async function cambiarEstado(id:number, estado:any) { await updateQuote(id, { estado } as any, (await getQuote(id))?.items.map((i:any)=>({...i}))||[]); load(); toastMsg('Estado actualizado') }
  async function convertir(id:number) { if (!confirm('Convertir presupuesto a factura?')) return; await quoteToInvoice(id); load(); toastMsg('Convertido a factura') }
  async function eliminar(id:number) { if (!confirm('Eliminar presupuesto?')) return; await deleteQuote(id); load(); toastMsg('Eliminado') }

  async function exportarPDF(id:number) {
    const q:any = await getQuote(id)
    if (!q) return
    const comp = await getOrCreateCompany()
    const cli = clients.find(c=>c.id===q.clienteId)
    const html = generateDocumentHTML('presupuesto', comp, cli, q)
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); setTimeout(()=>w.print(),200) }
  }

  function toastMsg(t:string){ setToast(t); setTimeout(()=>setToast(''),1500) }

  const filtered = items.filter(x => {
    if (filter!=='todos' && x.estado!==filter) return false
    const s=search.toLowerCase()
    return x.numero.toLowerCase().includes(s) || (x.cliente?.nombre||'').toLowerCase().includes(s) || (x.cliente?.empresa||'').toLowerCase().includes(s)
  })

  return (
    <div className="screen active">
      <h1>Presupuestos</h1>
      <p className="sub">Gestión de presupuestos</p>
      <input className="search" placeholder="Buscar por número o cliente" value={search} onChange={e=>setSearch(e.target.value)}/>
      <select className="search" value={filter} onChange={e=>setFilter(e.target.value as any)}>
        <option value="todos">Todos</option><option value="pendiente">Pendientes</option><option value="aceptado">Aceptados</option><option value="cancelado">Cancelados</option><option value="pendiente_pago">Pendientes de pago</option>
      </select>
      <button className="btn" onClick={openNew}>+ Nuevo presupuesto</button>
      <div className="list" style={{marginTop:10}}>
        {filtered.map(q=>(
          <div key={q.id} className="item">
            <div className="row"><h3>{q.numero}</h3><span className={`badge b-${q.estado}`}>{q.estado}</span></div>
            <p>{q.cliente?.nombre || 'Sin cliente'}</p>
            <p>{q.fecha} • Total: {formatCLP(q.total)}</p>
            <div className="actions" style={{marginTop:8}}>
              <button className="btn small" onClick={()=>openEdit(q.id)}>Editar</button>
              <button className="btn small secondary" onClick={()=>exportarPDF(q.id)}>Ver/Imprimir PDF</button>
              {q.estado==='aceptado' && <button className="btn small" onClick={()=>convertir(q.id)}>Convertir a factura</button>}
              <select value={q.estado} onChange={e=>cambiarEstado(q.id,e.target.value)}>
                <option value="pendiente">Pendiente</option><option value="aceptado">Aceptado</option><option value="cancelado">Cancelado</option><option value="pendiente_pago">Pendiente de pago</option>
              </select>
              <button className="btn small danger" onClick={()=>eliminar(q.id)}>Eliminar</button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="empty">Sin presupuestos</div>}
      </div>

      {show && (
        <div className="modal open" onClick={()=>setShow(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()} style={{maxWidth:900}}>
            <h2>{editing?'Editar presupuesto':'Nuevo presupuesto'}</h2>
            <div className="form">
              <div className="field"><label>Cliente*</label>
                <select value={form.clienteId||''} onChange={e=>setForm({...form,clienteId: e.target.value?parseInt(e.target.value):null})}>
                  <option value="">Seleccione...</option>
                  {clients.map(c=>(<option key={c.id} value={c.id}>{c.nombre}</option>))}
                </select>
              </div>
              <div className="grid">
                <div className="field"><label>Fecha</label><input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></div>
                <div className="field"><label>Vencimiento</label><input type="date" value={form.vencimiento} onChange={e=>setForm({...form,vencimiento:e.target.value})}/></div>
                <div className="field"><label>Forma de pago</label><input value={form.formaPago||''} onChange={e=>setForm({...form,formaPago:e.target.value})}/></div>
                <div className="field"><label>Estado</label>
                  <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>
                    <option value="pendiente">Pendiente</option><option value="aceptado">Aceptado</option><option value="cancelado">Cancelado</option><option value="pendiente_pago">Pendiente de pago</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Condiciones de pago</label><input value={form.condicionesPago||''} onChange={e=>setForm({...form,condicionesPago:e.target.value})}/></div>
              <div className="field"><label>Observaciones</label><textarea value={form.observaciones||''} onChange={e=>setForm({...form,observaciones:e.target.value})}/></div>

              <div className="section">Líneas</div>
              <button className="btn small" onClick={addLinea}>+ Agregar línea</button>
              <div className="list" style={{marginTop:8}}>
                {lineas.map((it,idx)=>(
                  <div key={idx} className="card">
                    <div className="field"><label>Descripción</label><input value={it.descripcion} onChange={e=>updLinea(idx,'descripcion',e.target.value)}/></div>
                    <div className="grid">
                      <div className="field"><label>Cantidad</label><input type="number" step="0.01" value={it.cantidad} onChange={e=>updLinea(idx,'cantidad',parseFloat(e.target.value)||0)}/></div>
                      <div className="field"><label>Precio unitario</label><input type="number" step="0.01" value={it.precioUnitario} onChange={e=>updLinea(idx,'precioUnitario',parseFloat(e.target.value)||0)}/></div>
                      <div className="field"><label>Desc. %</label><input type="number" step="0.01" value={it.descuento} onChange={e=>updLinea(idx,'descuento',parseFloat(e.target.value)||0)}/></div>
                      <div className="field"><label>Subtotal</label><input value={formatCLP(it.subtotal)} disabled/></div>
                    </div>
                    <button className="btn small danger" onClick={()=>delLinea(idx)}>Eliminar</button>
                  </div>
                ))}
              </div>

              <div className="section">Totales</div>
              <div className="card">
                <div>Subtotal bruto: {formatCLP(calc.subtotalBruto)}</div>
                <div>Desc. ítems: {formatCLP(calc.descItems)}</div>
                <div>Neto ítems: {formatCLP(calc.netoItems)}</div>
                <div className="field"><label>Desc. global %</label><input type="number" step="0.01" value={form.descuento||0} onChange={e=>setForm({...form,descuento:parseFloat(e.target.value)||0})}/></div>
                <div>Desc. global: {formatCLP(calc.descuentoGlobal)}</div>
                <div>Neto final: {formatCLP(calc.netoFinal)}</div>
                <div className="field"><label>IVA %</label><input type="number" step="0.01" value={form.iva||19} onChange={e=>setForm({...form,iva:parseFloat(e.target.value)||0})}/></div>
                <div>IVA: {formatCLP(calc.iva)}</div>
                <div><strong>Total: {formatCLP(calc.total)}</strong></div>
              </div>
            </div>
            <div className="actions" style={{marginTop:10}}>
              <button className="btn" onClick={save}>Guardar</button>
              <button className="btn ghost" onClick={()=>setShow(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  )
}

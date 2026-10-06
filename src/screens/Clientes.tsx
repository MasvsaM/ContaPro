import { useEffect, useState } from 'react'
import { listClients, createClient, updateClient, archiveClient, getClient } from '@/services/clientService'
import type { Client } from '@/types'
import { validarRut, formatoRut } from '@/utils/calc'
import { db } from '@/database/db'

export default function Clientes() {
  const [items, setItems] = useState<Client[]>([])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<Client|null>(null)
  const [f, setF] = useState<Partial<Client>>({ nombre:'', empresa:'', rut:'', direccion:'', comuna:'', ciudad:'', telefono:'', whatsapp:'', email:'', contacto:'', notas:'', archivado:false })
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<any>(null)

  async function load() {
    const res = await listClients(false)
    setItems(res)
  }
  useEffect(()=>{load()},[])

  function openNew() { setEditing(null); setF({ nombre:'', empresa:'', rut:'', direccion:'', comuna:'', ciudad:'', telefono:'', whatsapp:'', email:'', contacto:'', notas:'', archivado:false }); setShow(true) }
  function openEdit(c:Client) { setEditing(c); setF(c); setShow(true) }

  async function save() {
    if (!f.nombre) return alert('Nombre obligatorio')
    const rut = f.rut? formatoRut(f.rut):''
    if (rut && !validarRut(rut)) { alert('RUT inválido'); return }
    if (editing) await updateClient(editing.id, { ...f, rut })
    else await createClient({ ...f, rut, archivado:false } as any)
    setShow(false); load()
  }

  async function verDetalle(id:number) {
    const c = await getClient(id)
    const quotes = await db.quotes.where('clienteId').equals(id).toArray()
    const invs = await db.invoices.where('clienteId').equals(id).toArray()
    const totalV = invs.filter(i=>i.estado==='pagada').reduce((s,i)=>s+i.total,0)
    const totalP = invs.filter(i=>i.estado!=='pagada').reduce((s,i)=>s+i.total,0)
    const totalPag = totalV
    setDetail({ cliente:c, quotes, invs, totalV, totalP, totalPag })
  }

  const filtered = items.filter(i => {
    const s = search.toLowerCase()
    return i.nombre.toLowerCase().includes(s) || (i.empresa||'').toLowerCase().includes(s) || (i.rut||'').toLowerCase().includes(s)
  })

  return (
    <div className="screen active">
      <h1>Clientes</h1>
      <p className="sub">Gestión de clientes</p>
      <input className="search" placeholder="Buscar por nombre, empresa o RUT" value={search} onChange={e=>setSearch(e.target.value)} />
      <button className="btn" onClick={openNew}>+ Nuevo cliente</button>
      <div className="list" style={{marginTop:10}}>
        {filtered.map(c => (
          <div key={c.id} className="item">
            <h3>{c.nombre}</h3>
            <p>{c.empresa} {c.rut? '• '+c.rut:''}</p>
            <p>{c.telefono} {c.email? '• '+c.email:''}</p>
            <div className="actions" style={{marginTop:8}}>
              <button className="btn small" onClick={()=>verDetalle(c.id)}>Detalle</button>
              <button className="btn small secondary" onClick={()=>openEdit(c)}>Editar</button>
              <button className="btn small danger" onClick={async()=>{ if(confirm('Archivar cliente?')) { await archiveClient(c.id); load() }}}>Archivar</button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="empty">Sin clientes</div>}
      </div>

      {show && (
        <div className="modal open" onClick={()=>setShow(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <h2>{editing?'Editar cliente':'Nuevo cliente'}</h2>
            <div className="form">
              <div className="field"><label>Nombre*</label><input value={f.nombre||''} onChange={e=>setF({...f,nombre:e.target.value})}/></div>
              <div className="field"><label>Empresa</label><input value={f.empresa||''} onChange={e=>setF({...f,empresa:e.target.value})}/></div>
              <div className="field"><label>RUT</label><input value={f.rut||''} onChange={e=>setF({...f,rut:formatoRut(e.target.value)})}/></div>
              <div className="field"><label>Dirección</label><input value={f.direccion||''} onChange={e=>setF({...f,direccion:e.target.value})}/></div>
              <div className="field"><label>Comuna</label><input value={f.comuna||''} onChange={e=>setF({...f,comuna:e.target.value})}/></div>
              <div className="field"><label>Ciudad</label><input value={f.ciudad||''} onChange={e=>setF({...f,ciudad:e.target.value})}/></div>
              <div className="field"><label>Teléfono</label><input value={f.telefono||''} onChange={e=>setF({...f,telefono:e.target.value})}/></div>
              <div className="field"><label>WhatsApp</label><input value={f.whatsapp||''} onChange={e=>setF({...f,whatsapp:e.target.value})}/></div>
              <div className="field"><label>Email</label><input value={f.email||''} onChange={e=>setF({...f,email:e.target.value})}/></div>
              <div className="field"><label>Contacto</label><input value={f.contacto||''} onChange={e=>setF({...f,contacto:e.target.value})}/></div>
              <div className="field"><label>Notas</label><textarea value={f.notas||''} onChange={e=>setF({...f,notas:e.target.value})}/></div>
            </div>
            <div className="actions" style={{marginTop:10}}>
              <button className="btn" onClick={save}>Guardar</button>
              <button className="btn ghost" onClick={()=>setShow(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal open" onClick={()=>setDetail(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <h2>Detalle cliente</h2>
            <div className="card">
              <div>{detail.cliente?.nombre}</div>
              <div>{detail.cliente?.empresa}</div>
              <div>{detail.cliente?.rut}</div>
              <div>Total vendido: {detail.totalV.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</div>
              <div>Total pendiente: {detail.totalP.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</div>
            </div>
            <div className="section">Presupuestos</div>
            {detail.quotes.map((q:any)=>(<div key={q.id} className="item"><div>{q.numero} - {q.estado}</div><div>{q.total.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</div></div>))}
            <div className="section">Facturas</div>
            {detail.invs.map((i:any)=>(<div key={i.id} className="item"><div>{i.numero} - {i.estado}</div><div>{i.total.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</div></div>))}
            <button className="btn ghost full" style={{marginTop:10}} onClick={()=>setDetail(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

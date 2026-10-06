import { useEffect, useState } from 'react'
import { getVentas } from '@/reports/reports'
import { formatCLP } from '@/utils/calc'

export default function Reportes() {
  const [rango, setRango] = useState<'hoy'|'semana'|'mes'|'mesant'|'todo'>('mes')
  const [res, setRes] = useState<any>({ ventas:0, facturas:0, pagadas:0, pendientes:0, porCobrar:0, lista:[] })

  async function load() {
    const r = await getVentas(rango)
    setRes(r)
  }
  useEffect(()=>{load()},[rango])

  return (
    <div className="screen active">
      <h1>Reportes</h1>
      <p className="sub">Análisis de ventas</p>
      <select className="search" value={rango} onChange={e=>setRango(e.target.value as any)}>
        <option value="hoy">Hoy</option><option value="semana">Esta semana</option><option value="mes">Este mes</option><option value="mesant">Mes anterior</option><option value="todo">Todo</option>
      </select>
      <div className="grid">
        <div className="card metric"><small>Ventas</small><b>{formatCLP(res.ventas)}</b></div>
        <div className="card metric"><small>Facturas</small><b>{res.facturas}</b></div>
        <div className="card metric"><small>Pagadas</small><b>{res.pagadas}</b></div>
        <div className="card metric"><small>Pendientes</small><b>{res.pendientes}</b></div>
        <div className="card metric"><small>Por cobrar</small><b>{formatCLP(res.porCobrar)}</b></div>
      </div>
      <div className="section">Facturas</div>
      <div className="tablewrap">
        <table>
          <thead><tr><th>N°</th><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead>
          <tbody>
            {res.lista.map((i:any)=>(
              <tr key={i.id}><td>{i.numero}</td><td>{i.fecha}</td><td>{i.estado}</td><td>{formatCLP(i.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

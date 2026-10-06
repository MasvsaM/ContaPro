import { useEffect, useState } from 'react'
import { db } from '@/database/db'
import { formatCLP } from '@/utils/calc'
import { getVentas } from '@/reports/reports'

export default function Dashboard() {
  const [stats, setStats] = useState({ ventasMes:0, porCobrar:0, pendientesP:0, aceptados:0, factPag:0, factPend:0, ventasDia:0, ventasSem:0 })
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    (async () => {
      const vMes = await getVentas('mes')
      const vDia = await getVentas('hoy')
      const vSem = await getVentas('semana')
      const quotes = await db.quotes.toArray()
      const invs = await db.invoices.toArray()
      setStats({
        ventasMes: vMes.ventas,
        porCobrar: vMes.porCobrar,
        pendientesP: quotes.filter(q=>q.estado==='pendiente').length,
        aceptados: quotes.filter(q=>q.estado==='aceptado').length,
        factPag: invs.filter(i=>i.estado==='pagada').length,
        factPend: invs.filter(i=>i.estado==='pendiente'||i.estado==='vencida').length,
        ventasDia: vDia.ventas,
        ventasSem: vSem.ventas
      })
    })()
  }, [refresh])

  return (
    <div className="screen active">
      <h1>Inicio</h1>
      <p className="sub">Resumen de tu negocio</p>
      <button className="btn small" onClick={()=>setRefresh(r=>r+1)}>Actualizar</button>
      <div className="grid" style={{marginTop:10}}>
        <div className="card metric blue"><small>Ventas del día</small><b>{formatCLP(stats.ventasDia)}</b></div>
        <div className="card metric green"><small>Ventas de la semana</small><b>{formatCLP(stats.ventasSem)}</b></div>
        <div className="card metric green"><small>Ventas del mes</small><b>{formatCLP(stats.ventasMes)}</b></div>
        <div className="card metric orange"><small>Total por cobrar</small><b>{formatCLP(stats.porCobrar)}</b></div>
        <div className="card metric"><small>Presupuestos pendientes</small><b>{stats.pendientesP}</b></div>
        <div className="card metric"><small>Presupuestos aceptados</small><b>{stats.aceptados}</b></div>
        <div className="card metric red"><small>Facturas pendientes de pago</small><b>{stats.factPend}</b></div>
        <div className="card metric green"><small>Facturas pagadas</small><b>{stats.factPag}</b></div>
      </div>
    </div>
  )
}

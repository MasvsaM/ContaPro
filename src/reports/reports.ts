import { db } from '@/database/db'

export async function getVentas(rango: 'hoy' | 'semana' | 'mes' | 'mesant' | 'todo', inicio?: string, fin?: string) {
  const invs = await db.invoices.toArray()
  const now = new Date()
  let desde = new Date('2000-01-01')
  let hasta = new Date('2100-01-01')
  if (rango === 'hoy') {
    desde = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  }
  if (rango === 'semana') {
    const d = now
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    desde = new Date(d.setDate(diff))
    desde.setHours(0,0,0,0)
    hasta = new Date()
  }
  if (rango === 'mes') {
    desde = new Date(now.getFullYear(), now.getMonth(), 1)
    hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  }
  if (rango === 'mesant') {
    desde = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    hasta = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  }
  if (rango === 'todo') { desde = new Date('2000-01-01'); hasta = new Date('2100-01-01') }
  if (inicio) desde = new Date(inicio)
  if (fin) { hasta = new Date(fin); hasta.setHours(23,59,59,999) }

  const f = invs.filter(i => {
    const d = new Date(i.fecha)
    return d >= desde && d <= hasta
  })
  const ventas = f.reduce((s,i)=>s+i.total,0)
  const facturas = f.length
  const pagadas = f.filter(i=>i.estado==='pagada').length
  const pendientes = f.filter(i=>i.estado==='pendiente'||i.estado==='vencida').length
  const porCobrar = f.filter(i=>i.estado!=='pagada').reduce((s,i)=>s+i.total,0)
  return { ventas, facturas, pagadas, pendientes, porCobrar, lista: f }
}

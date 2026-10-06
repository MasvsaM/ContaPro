import { db } from '@/database/db'
import type { Invoice, InvoiceItem, Payment } from '@/types'

function generarNumero(invs: Invoice[]) {
  const nums = invs.map(i => {
    const m = i.numero.match(/(\d+)$/)
    return m ? parseInt(m[1]) : 0
  })
  const max = nums.length ? Math.max(...nums) : 0
  return `F-${(max + 1).toString().padStart(4, '0')}`
}

export async function listInvoices() {
  const inv = await db.invoices.toArray()
  const clients = await db.clients.toArray()
  const cmap = new Map(clients.map(c => [c.id, c]))
  return inv.map(x => ({ ...x, cliente: x.clienteId ? cmap.get(x.clienteId) : undefined }))
}

export async function getInvoice(id: number) {
  const inv = await db.invoices.get(id)
  if (!inv) return null
  const items = await db.invoiceItems.where('invoiceId').equals(id).toArray()
  const pagos = await db.payments.where('invoiceId').equals(id).toArray()
  const cli = inv.clienteId ? await db.clients.get(inv.clienteId) : undefined
  return { ...inv, items, pagos, cliente: cli }
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'numero' | 'items' | 'pagos' | 'createdAt' | 'updatedAt'>, items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]) {
  const now = new Date().toISOString()
  const all = await db.invoices.toArray()
  const numero = generarNumero(all)
  const id = await db.invoices.add({ ...data, numero, items: [], pagos: [], createdAt: now, updatedAt: now } as any)
  await Promise.all(items.map(it => db.invoiceItems.add({ ...it, invoiceId: id })))
  return id as number
}

export async function updateInvoice(id: number, data: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'invoiceId'>[]) {
  await db.invoices.update(id, { ...data, updatedAt: new Date().toISOString() })
  if (items) {
    await db.invoiceItems.where('invoiceId').equals(id).delete()
    await Promise.all(items.map(it => db.invoiceItems.add({ ...it, invoiceId: id })))
  }
}

export async function addPayment(invoiceId: number, p: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>) {
  const now = new Date().toISOString()
  await db.payments.add({ ...p, invoiceId, createdAt: now } as any)
}

export async function quoteToInvoice(quoteId: number) {
  const q = await db.quotes.get(quoteId)
  if (!q) throw new Error('Presupuesto no encontrado')
  const items = await db.quoteItems.where('quoteId').equals(quoteId).toArray()
  const invId = await createInvoice(
    {
      clienteId: q.clienteId,
      quoteId,
      fecha: new Date().toISOString().slice(0, 10),
      vencimiento: q.vencimiento,
      observaciones: q.observaciones,
      formaPago: q.formaPago,
      subtotal: q.subtotal,
      descuento: q.descuento,
      iva: q.iva,
      total: q.total,
      estado: 'pendiente'
    } as any,
    items.map(i => ({ descripcion: i.descripcion, cantidad: i.cantidad, precioUnitario: i.precioUnitario, descuento: i.descuento, subtotal: i.subtotal }))
  )
  return invId
}

import { db } from '@/database/db'
import type { Quote, QuoteItem } from '@/types'

function generarNumero(quotes: Quote[]) {
  const nums = quotes.map(q => {
    const m = q.numero.match(/(\d+)$/)
    return m ? parseInt(m[1]) : 0
  })
  const max = nums.length ? Math.max(...nums) : 0
  return `P-${(max + 1).toString().padStart(4, '0')}`
}

export async function listQuotes() {
  const q = await db.quotes.toArray()
  const clients = await db.clients.toArray()
  const cmap = new Map(clients.map(c => [c.id, c]))
  return q.map(x => ({ ...x, cliente: x.clienteId ? cmap.get(x.clienteId) : undefined }))
}

export async function getQuote(id: number) {
  const q = await db.quotes.get(id)
  if (!q) return null
  const items = await db.quoteItems.where('quoteId').equals(id).toArray()
  const cli = q.clienteId ? await db.clients.get(q.clienteId) : undefined
  return { ...q, items, cliente: cli }
}

export async function createQuote(data: Omit<Quote, 'id' | 'numero' | 'items' | 'createdAt' | 'updatedAt'>, items: Omit<QuoteItem, 'id' | 'quoteId'>[]) {
  const now = new Date().toISOString()
  const all = await db.quotes.toArray()
  const numero = generarNumero(all)
  const id = await db.quotes.add({ ...data, numero, items: [], createdAt: now, updatedAt: now } as any)
  await Promise.all(items.map(it => db.quoteItems.add({ ...it, quoteId: id })))
  return id as number
}

export async function updateQuote(id: number, data: Partial<Quote>, items: Omit<QuoteItem, 'id' | 'quoteId'>[]) {
  await db.quotes.update(id, { ...data, updatedAt: new Date().toISOString() })
  await db.quoteItems.where('quoteId').equals(id).delete()
  await Promise.all(items.map(it => db.quoteItems.add({ ...it, quoteId: id })))
}

export async function deleteQuote(id: number) {
  await db.quoteItems.where('quoteId').equals(id).delete()
  await db.quotes.delete(id)
}

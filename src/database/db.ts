import Dexie, { type Table } from 'dexie'
import type { Client, Quote, Invoice, Company, Settings, Payment } from '@/types'

export class ContaProDB extends Dexie {
  companies!: Table<Company, number>
  clients!: Table<Client, number>
  quotes!: Table<Quote, number>
  quoteItems!: Table<any, number>
  invoices!: Table<Invoice, number>
  invoiceItems!: Table<any, number>
  payments!: Table<Payment, number>
  settings!: Table<Settings, number>

  constructor() {
    super('ContaProDB')
    this.version(1).stores({
      companies: '++id',
      clients: '++id, nombre, empresa, rut, telefono, email, archivado',
      quotes: '++id, numero, clienteId, fecha, vencimiento, estado',
      quoteItems: '++id, quoteId',
      invoices: '++id, numero, clienteId, quoteId, fecha, vencimiento, estado',
      invoiceItems: '++id, invoiceId',
      payments: '++id, invoiceId, fecha',
      settings: '++id'
    })
  }
}

export const db = new ContaProDB()

export async function getOrCreateSettings(): Promise<Settings> {
  let s = await db.settings.get(1)
  if (s) return s
  s = {
    id: 1,
    ivaPorcentaje: 19,
    darkMode: 'system'
  }
  await db.settings.add(s)
  return s
}

export async function getOrCreateCompany(): Promise<Company> {
  let c = await db.companies.get(1)
  if (c) return c
  const now = new Date().toISOString()
  c = {
    id: 1,
    nombre: 'ContaPro',
    rut: '',
    direccion: '',
    comuna: '',
    ciudad: '',
    telefono: '',
    email: '',
    sitioWeb: '',
    logo: '',
    textoLegal: '',
    condicionesPago: '',
    createdAt: now,
    updatedAt: now
  }
  await db.companies.add(c)
  return c
}

import { db } from '@/database/db'
import type { Client } from '@/types'

export async function listClients(archivado = false) {
  return db.clients.filter(c => c.archivado === archivado).sortBy('nombre')
}

export async function getClient(id: number) {
  return db.clients.get(id)
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  const id = await db.clients.add({ ...data, createdAt: now, updatedAt: now } as any)
  return id as number
}

export async function updateClient(id: number, data: Partial<Client>) {
  await db.clients.update(id, { ...data, updatedAt: new Date().toISOString() })
}

export async function deleteClient(id: number) {
  await db.clients.delete(id)
}

export async function archiveClient(id: number) {
  await updateClient(id, { archivado: true })
}

export type EstadoPresupuesto = 'pendiente' | 'aceptado' | 'cancelado' | 'pendiente_pago'
export type EstadoFactura = 'pendiente' | 'pagada' | 'vencida'
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'debito' | 'credito' | 'otro'

export interface Company {
  id: number
  nombre: string
  rut: string
  direccion: string
  comuna: string
  ciudad: string
  telefono: string
  email: string
  sitioWeb: string
  logo: string
  textoLegal: string
  condicionesPago: string
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: number
  nombre: string
  empresa: string
  rut: string
  direccion: string
  comuna: string
  ciudad: string
  telefono: string
  whatsapp: string
  email: string
  contacto: string
  notas: string
  archivado: boolean
  createdAt: string
  updatedAt: string
}

export interface QuoteItem {
  id?: number
  quoteId?: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
}

export interface Quote {
  id: number
  numero: string
  clienteId: number | null
  fecha: string
  vencimiento: string
  observaciones: string
  condicionesPago: string
  formaPago: string
  subtotal: number
  descuento: number
  iva: number
  total: number
  estado: EstadoPresupuesto
  cliente?: Client
  items: QuoteItem[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id?: number
  invoiceId?: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
}

export interface Invoice {
  id: number
  numero: string
  clienteId: number | null
  quoteId: number | null
  fecha: string
  vencimiento: string
  observaciones: string
  formaPago: string
  subtotal: number
  descuento: number
  iva: number
  total: number
  estado: EstadoFactura
  cliente?: Client
  items: InvoiceItem[]
  pagos: Payment[]
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: number
  invoiceId: number
  fecha: string
  monto: number
  metodo: MetodoPago
  observacion: string
  createdAt: string
}

export interface Settings {
  id: number
  ivaPorcentaje: number
  darkMode: 'light' | 'dark' | 'system'
}

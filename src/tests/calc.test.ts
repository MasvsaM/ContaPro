import { describe, it, expect } from 'vitest'
import { calcDocumento, calcLinea, round2 } from '../utils/calc'

describe('calc', () => {
  it('calcLinea básico', () => {
    const r = calcLinea(2, 1000, 0)
    expect(r.subtotal).toBe(2000)
  })
  it('calcLinea con descuento %', () => {
    const r = calcLinea(2, 1000, 10)
    expect(r.subtotal).toBe(1800)
  })
  it('calcDocumento totales', () => {
    const r = calcDocumento([
      { cantidad: 1, precioUnitario: 1000, descuento: 0 },
      { cantidad: 2, precioUnitario: 500, descuento: 0 }
    ], 0, 19)
    expect(r.netoFinal).toBe(2000)
    expect(r.iva).toBe(380)
    expect(r.total).toBe(2380)
  })
  it('redondeo', () => {
    expect(round2(1.005)).toBe(1.01)
  })
})

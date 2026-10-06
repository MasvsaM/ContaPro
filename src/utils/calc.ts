export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function calcLinea(cantidad: number, precioUnitario: number, descuento: number) {
  const bruto = cantidad * precioUnitario
  const d = bruto * (descuento / 100)
  const subtotal = bruto - d
  return { bruto, d, subtotal: round2(subtotal) }
}

export function calcDocumento(items: Array<{ cantidad: number; precioUnitario: number; descuento: number }>, descuentoGlobal: number, ivaPct: number) {
  let subtotalBruto = 0
  let descItems = 0
  let netoItems = 0
  for (const it of items) {
    const bruto = it.cantidad * it.precioUnitario
    const d = bruto * (it.descuento / 100)
    subtotalBruto += bruto
    descItems += d
    netoItems += (bruto - d)
  }
  netoItems = round2(netoItems)
  const dGlobal = netoItems * (descuentoGlobal / 100)
  const netoFinal = round2(netoItems - dGlobal)
  const iva = round2(netoFinal * (ivaPct / 100))
  const total = round2(netoFinal + iva)
  return {
    subtotalBruto: round2(subtotalBruto),
    descItems: round2(descItems),
    descuentoGlobal: round2(dGlobal),
    netoItems,
    netoFinal,
    iva,
    total
  }
}

export function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
}

export function formatoRut(rut: string) {
  let s = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (s.length <= 1) return s
  let dv = s.slice(-1)
  let num = s.slice(0, -1)
  num = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${num}-${dv}`
}

export function validarRut(rut: string): boolean {
  const r = rut.replace(/[.\-]/g, '').toUpperCase()
  if (!/^[0-9]+[0-9K]$/.test(r)) return false
  const cuerpo = r.slice(0, -1)
  const dv = r.slice(-1)
  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const resto = suma % 11
  let dvCalc = '0'
  if (resto === 1) dvCalc = 'K'
  else if (resto !== 0) dvCalc = String(11 - resto)
  else dvCalc = '0'
  return dvCalc === dv
}

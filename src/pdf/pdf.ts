import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Company, Client, Quote, Invoice } from '@/types'

function money(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
}

export async function exportPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId)
  if (!el) throw new Error('Elemento no encontrado')
  const canvas = await html2canvas(el, { scale: 2, useCORS: true })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const w = pdf.internal.pageSize.getWidth()
  const h = (canvas.height * w) / canvas.width
  pdf.addImage(img, 'PNG', 0, 0, w, h)
  pdf.save(filename)
}

export function generateDocumentHTML(docType: 'presupuesto' | 'factura', company: Company, client: Client | undefined, doc: Quote | Invoice) {
  const items = (doc as any).items || []
  const rows = items.map((it: any) => `
    <tr>
      <td>${it.descripcion}</td>
      <td class="right">${it.cantidad}</td>
      <td class="right">${money(it.precioUnitario)}</td>
      <td class="right">${it.descuento}%</td>
      <td class="right">${money(it.subtotal)}</td>
    </tr>
  `).join('')

  return `
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#111}
.header{display:flex;justify-content:space-between;border-bottom:2px solid #eee;padding-bottom:12px}
.logo{max-height:60px}
h1{margin:0;font-size:20px}
table{width:100%;border-collapse:collapse;margin-top:16px}
th,td{padding:8px;border:1px solid #eee;font-size:12px}
.right{text-align:right}
.totals{margin-top:16px;float:right;width:260px}
.totals td{border:none;padding:4px}
.legal{margin-top:40px;font-size:10px;color:#555}
</style>
</head>
<body id="doc">
  <div class="header">
    <div>
      <h1>${company.nombre || 'ContaPro'}</h1>
      ${company.rut ? `<div>RUT: ${company.rut}</div>` : ''}
      ${company.direccion ? `<div>${company.direccion} ${company.comuna || ''} ${company.ciudad || ''}</div>` : ''}
      ${company.telefono ? `<div>Tel: ${company.telefono}</div>` : ''}
      ${company.email ? `<div>Email: ${company.email}</div>` : ''}
      ${company.sitioWeb ? `<div>${company.sitioWeb}</div>` : ''}
    </div>
    ${company.logo ? `<img src="${company.logo}" class="logo" />` : ''}
  </div>
  <div style="margin-top:16px;display:flex;justify-content:space-between">
    <div>
      <strong>Cliente</strong>
      <div>${client?.nombre || ''}</div>
      ${client?.empresa ? `<div>${client.empresa}</div>` : ''}
      ${client?.rut ? `<div>RUT: ${client.rut}</div>` : ''}
      ${client?.direccion ? `<div>${client.direccion}</div>` : ''}
      ${client?.telefono ? `<div>Tel: ${client.telefono}</div>` : ''}
      ${client?.email ? `<div>Email: ${client.email}</div>` : ''}
    </div>
    <div style="text-align:right">
      <h2 style="margin:0">${docType === 'presupuesto' ? 'PRESUPUESTO' : 'FACTURA'}</h2>
      <div>N°: ${(doc as any).numero}</div>
      <div>Fecha: ${(doc as any).fecha}</div>
      <div>Vencimiento: ${(doc as any).vencimiento}</div>
      ${docType === 'presupuesto' ? `<div>Estado: ${(doc as any).estado}</div>` : `<div>Estado: ${(doc as any).estado}</div>`}
    </div>
  </div>
  <table>
    <thead><tr><th>Descripción</th><th class="right">Cant.</th><th class="right">P. Unit.</th><th class="right">Desc. %</th><th class="right">Subtotal</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Subtotal</td><td class="right">${money((doc as any).subtotal)}</td></tr>
    <tr><td>Descuento</td><td class="right">${money((doc as any).descuento)}</td></tr>
    <tr><td>Neto</td><td class="right">${money((doc as any).subtotal - (doc as any).descuento >= 0 ? (doc as any).subtotal : (doc as any).subtotal)}</td></tr>
    <tr><td>IVA</td><td class="right">${money((doc as any).iva)}</td></tr>
    <tr><td><strong>Total</strong></td><td class="right"><strong>${money((doc as any).total)}</strong></td></tr>
  </table>
  ${company.textoLegal ? `<div class="legal">${company.textoLegal}</div>` : ''}
  ${company.condicionesPago ? `<div class="legal">Condiciones de pago: ${company.condicionesPago}</div>` : ''}
  <div class="legal">Importante: Este documento comercial generado por ContaPro no reemplaza una factura electrónica tributaria emitida mediante el sistema oficial del SII.</div>
</body>
</html>`
}

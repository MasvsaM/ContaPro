export async function sharePDFBlob(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'application/pdf' })
  if (navigator.share && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: filename })
    return true
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return false
}

export function whatsappLink(text: string) {
  const t = encodeURIComponent(text)
  return `https://wa.me/?text=${t}`
}

export function mailtoLink(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

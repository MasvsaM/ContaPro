import { describe, it, expect } from 'vitest'
import { validarRut, formatoRut } from '../utils/calc'

describe('rut', () => {
  it('formatea', () => {
    expect(formatoRut('12345678k')).toBe('12.345.678-K')
  })
  it('valida básico', () => {
    expect(validarRut('12.345.678-5')).toBe(true)
    expect(validarRut('11111111-1')).toBe(true)
    expect(validarRut('11111111-2')).toBe(false)
  })
})

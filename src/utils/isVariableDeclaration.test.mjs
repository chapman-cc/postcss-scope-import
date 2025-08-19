import { describe, it, expect } from 'vitest'
import { Declaration } from 'postcss'
import isVariableDeclaration from './isVariableDeclaration.cjs'

describe('isVariableDeclaration', () => {
  it('should return true if param is Declaration of variable assignment', () => {
    const redBgColor = new Declaration({
      prop: '--background-color',
      value: 'red'
    })
    expect(isVariableDeclaration(redBgColor)).toBe(true)
  })

  it("should return false if prop does not start with '--'", () => {
    const normalProp = new Declaration({
      prop: 'background-color',
      value: 'red'
    })
    expect(isVariableDeclaration(normalProp)).toBe(false)
  })

  it('should return false if input is not a Declaration instance', () => {
    const notADeclaration = {
      prop: '--color',
      value: 'blue'
    }
    expect(isVariableDeclaration(notADeclaration)).toBe(false)
  })

  it('should return false if Declaration has empty string as prop', () => {
    const emptyPropDeclaration = new Declaration({
      prop: '',
      value: 'blue'
    })
    expect(isVariableDeclaration(emptyPropDeclaration)).toBe(false)
  })

  it('should return true for variable declaration with complex value', () => {
    const complexValueDeclaration = new Declaration({
      prop: '--main-gradient',
      value: 'linear-gradient(to right, red, blue)'
    })
    expect(isVariableDeclaration(complexValueDeclaration)).toBe(true)
  })
})

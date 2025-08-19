import { AtRule, Comment, Declaration, Root, Rule } from 'postcss'
import { describe, expect, it } from 'vitest'
import isScoped from './isScoped.cjs'

describe('isScoped', () => {
  it('should return true if node is scope', () => {
    const scopeAtRule = getScopeRule('(frame)')
    expect(isScoped(scopeAtRule, '(frame)')).toBeTruthy()
  })

  it('should return true if node.*.parent is scoped', () => {
    const declaration = new Declaration()
    const rule = new Rule()
    rule.append(declaration)
    const scopeAtRule = getScopeRule('(frame)')
    scopeAtRule.append(rule)

    expect(isScoped(rule, '(frame)')).toBe(true)
    expect(isScoped(declaration, '(frame)')).toBe(true)
  })

  it('should return false if parents are not scoped', () => {
    const declaration = new Declaration()
    const rule = new Rule()
    rule.append(declaration)
    const atRule = new AtRule({ name: 'layer' })
    atRule.append(rule)
    const root = new Root()
    root.append(atRule)

    expect(isScoped(rule, '(frame)')).toBe(false)
    expect(isScoped(declaration, '(frame)')).toBe(false)
  })
})

/**
 * Crete a scoped AtRule
 * @param {string} params
 * @returns {AtRule}
 */
function getScopeRule(params) {
  return new AtRule({ name: 'scope', params })
}

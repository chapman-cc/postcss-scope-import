import { Comment, Declaration, Rule } from 'postcss'
import { describe, expect, it, vi } from 'vitest'
import isVariableDeclarationRuleBlock from './isVariableDeclarationRuleBlock.cjs'

// Ensure the mock behaves correctly
vi.mock('./isVariableDeclaration.cjs', () => ({
  default: decl => decl.prop?.startsWith('--')
}))

describe('isVariableDeclarationRuleBlock', () => {
  it('should return true for a Rule with only variable declarations', () => {
    const rule = new Rule()
    rule.nodes = [
      new Declaration({ prop: '--color', value: 'red' }),
      new Declaration({ prop: '--bg', value: 'blue' })
    ]
    expect(isVariableDeclarationRuleBlock(rule)).toBe(true)
  })

  it('should return false for a Rule with mixed declarations', () => {
    const rule = new Rule()
    rule.nodes = [
      new Declaration({ prop: '--color', value: 'red' }),
      new Declaration({ prop: 'background', value: 'blue' })
    ]
    expect(isVariableDeclarationRuleBlock(rule)).toBe(false)
  })

  it('should return false for a Rule with no nodes', () => {
    const rule = new Rule()
    rule.nodes = []
    expect(isVariableDeclarationRuleBlock(rule)).toBe(false)
  })

  it('should return false if input is not a Rule', () => {
    const notARule = new Declaration({ prop: '--color', value: 'red' })
    expect(isVariableDeclarationRuleBlock(notARule)).toBe(false)
  })

  it('should return true if Rule contains comments', () => {
    const rule = new Rule()
    rule.nodes = [
      new Declaration({ prop: '--color', value: 'red' }),
      new Comment({ text: 'Postcss rocks!!!' })
    ]
    expect(isVariableDeclarationRuleBlock(rule)).toBe(true)
  })
})

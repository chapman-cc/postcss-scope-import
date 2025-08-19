import { AtRule, Comment, Rule } from 'postcss'
import { describe, expect, it } from 'vitest'
import isRule from './isRule.cjs'

describe('isAtRule', () => {
  it('should return true for an AtRule node', () => {
    // Create a standard CSS rule
    const ruleNode = new Rule({ selector: 'a' })
    expect(isRule(ruleNode)).toBe(true)
  })

  it('should return false for a standard Rule node', () => {
    // Create a sample @media at-rule node
    const atRuleNode = new AtRule({
      name: 'media',
      params: 'screen and (min-width: 900px)'
    })
    expect(isRule(atRuleNode)).toBe(false)
  })
})

import { AtRule, Comment, Rule } from 'postcss'
import { describe, expect, it } from 'vitest'
import isAtRule from './isAtRule.cjs'

describe('isAtRule', () => {
  it('should return true for an AtRule node', () => {
    // Create a sample @media at-rule node
    const atRuleNode = new AtRule({
      name: 'media',
      params: 'screen and (min-width: 900px)'
    })
    expect(isAtRule(atRuleNode)).toBe(true)
  })

  it('should return false for a standard Rule node', () => {
    // Create a standard CSS rule
    const ruleNode = new Rule({ selector: 'a' })
    expect(isAtRule(ruleNode)).toBe(false)
  })

  it('should return false for a Comment node', () => {
    // Create a comment node
    const commentNode = new Comment({ text: 'This is a comment' })
    expect(isAtRule(commentNode)).toBe(false)
  })
})

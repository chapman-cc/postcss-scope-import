import { AtRule, Comment, Declaration, Rule } from 'postcss'
import { describe, expect, it } from 'vitest'
import isComment from './isComment.cjs'

describe('isComment', () => {
  it('should return true if node is Comment', () => {
    const comment = new Comment()
    expect(isComment(comment)).toBeTruthy()
  })

  it('should return false if node is not comment', () => {
    const declaration = new Declaration()
    const rule = new Rule()
    const atRule = new AtRule()
    expect(isComment(declaration)).toBeFalsy()
    expect(isComment(rule)).toBeFalsy()
    expect(isComment(atRule)).toBeFalsy()
  })
})

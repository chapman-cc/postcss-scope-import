import { AtRule, Comment, Declaration, Root, Rule } from 'postcss'
import { describe, expect, it } from 'vitest'
import Scoper from './scopeNodes.cjs'

const targetScopeAtRule = Object.freeze({ name: 'scope', params: '(frame)' })

describe('scopeNodes', () => {
  describe('Declaration and Comment', () => {
    it('should not add parent if node is declaration', () => {
      const declaration = new Declaration()
      const scoper = new Scoper('(frame)')
      scoper.scopeNode(declaration)
      expect(declaration.parent).toBe(undefined)
    })
    it('should not add parent if node is comment', () => {
      const comment = new Comment()
      const scoper = new Scoper('(frame)')
      scoper.scopeNode(comment)
      expect(comment.parent).toBe(undefined)
    })
  })

  describe('Rule', () => {
    it('should scope rule if param is rule', () => {
      const commentsA = new Comment({ text: 'a' })
      const commentsB = new Comment({ text: 'b' })
      const commentsC = new Comment({ text: 'c' })
      const root = new Root()
      const rule = new Rule()

      rule.append(...createDeclarations(8))
      root.append(commentsA, commentsB, commentsC, rule)
      const scoper = new Scoper('(frame)')

      scoper.scopeNode(rule)

      expect(rule.parent).toBeInstanceOf(AtRule)
      expect(rule.parent).toMatchObject(targetScopeAtRule)
      expect(rule.parent?.parent).toBeInstanceOf(Root)
      expect(rule.prev()).toBeInstanceOf(Comment)
    })
    it('shoult not add additional scope if node is already scoped', () => {
      const root = new Root()
      const rule = new Rule()
      const atRule = new AtRule({ name: 'scope', params: '(frame)' })
      rule.append(...createDeclarations(12))
      atRule.append(rule)
      root.append(atRule)

      const scoper = new Scoper('(frame)')
      scoper.scopeNode(rule)

      /**
       * @type {Pick<AtRule, "name" | "params">}
       */

      expect(rule.parent).toBeInstanceOf(AtRule)
      expect(rule.parent).toMatchObject(targetScopeAtRule)
      expect(rule.parent).toBe(root.first)
    })

    it('should not scope if rule is variable declaration block', () => {
      const root = new Root()
      const rule = new Rule()
      const cssVariables = [
        new Declaration({ prop: '--background-color-a', value: 'red' }),
        new Declaration({ prop: '--background-color-b', value: 'green' }),
        new Declaration({ prop: '--background-color-c', value: 'blue' })
      ]
      rule.append(...cssVariables)
      root.append(rule)

      const scoper = new Scoper('(frame)')

      scoper.scopeNode(rule)

      expect(rule.parent).not.toBeInstanceOf(AtRule)
      expect(rule.parent).not.toMatchObject(targetScopeAtRule)
    })
    it('should not create extra scope under the same nesting', () => {
      const rule1 = new Rule()
      rule1.append(createDeclarations(10))
      const rule2 = new Rule()
      rule2.append(createDeclarations(6))
      const supportsAtRule = new AtRule({ name: 'supports' })
      supportsAtRule.append(rule1, rule2)
      const root = new Root()
      root.append(supportsAtRule)

      const scoper = new Scoper('(frame)', ['supports'])
      scoper.scopeNode(rule1)
      scoper.scopeNode(rule2)

      expect(rule1.parent).toMatchObject(targetScopeAtRule)
      expect(rule2.parent).toMatchObject(targetScopeAtRule)
      expect(rule1.parent).toBe(rule2.parent)
    })
  })
  describe('AtRule', () => {
    it('should scope AtRule', () => {
      const commentsA = new Comment({ text: 'a' })
      const commentsB = new Comment({ text: 'b' })
      const commentsC = new Comment({ text: 'c' })
      const root = new Root()
      const rule = new Rule()
      const atRule = new AtRule({
        name: 'media',
        params: 'only screen and (max-width: 600px)'
      })
      rule.append(new Declaration(), new Declaration())
      atRule.append(rule)
      root.append(commentsA, commentsB, commentsC, atRule)

      const scoper = new Scoper('(frame)')
      scoper.scopeNode(atRule)

      root.walkAtRules('scope', atRule => {
        expect(atRule).toBeInstanceOf(AtRule)
        expect(atRule).toMatchObject(targetScopeAtRule)
        expect(atRule.prev()).toBeInstanceOf(Comment)
        expect(atRule.prev()?.prev()).toBeInstanceOf(Comment)
        expect(atRule.prev()?.prev()?.prev()).toBeInstanceOf(Comment)
      })
    })

    const omittedAtRuleNames = ['layer', 'supports']
    it.each(omittedAtRuleNames)(
      'should not scope atRule if is %s',
      atRuleName => {
        const root = new Root()
        const rule = new Rule()
        const atRule = new AtRule({ name: atRuleName })
        rule.append(...createDeclarations(10))
        atRule.append(rule)
        root.append(atRule)

        const scoper = new Scoper('(frame)')
        scoper.omittedAtRule = omittedAtRuleNames
        scoper.scopeNode(atRule)

        root.walkAtRules('scope', atRule => {
          expect(atRule).toBeInstanceOf(AtRule)
          expect(atRule).not.toMatchObject(targetScopeAtRule)
        })
      }
    )
  })
  it('should exclude variable declaration blocks', () => {
    const root = new Root()
    root.append(
      new AtRule({ name: 'layer' }).append(
        new AtRule({ name: 'supports' }).append(
          new Rule({ selector: '*' }).append(
            new Declaration({ prop: '--bg-background-color-a', value: 'red' }),
            new Declaration({
              prop: '--bg-background-color-b',
              value: 'green'
            }),
            new Declaration({ prop: '--bg-background-color-c', value: 'blue' })
          )
        )
      )
    )

    const scoper = new Scoper('(frame)', ['layer', 'supports'])

    root.walkAtRules(atRule => {
      scoper.scopeNode(atRule)
    })

    expect(root.toString()).not.toMatch(/@scope/)
  })

  it('should append to previous scope if it is scope at rule', () => {
    const root = new Root()
    root.append(
      new AtRule({ name: 'media' }).append(
        new Rule({ selector: 'div.a' }).append()
      ),
      new AtRule({ name: 'media' }).append(
        new Rule({ selector: 'div.b' }).append()
      )
    )
    const scoper = new Scoper('(frame)')

    root.walkAtRules(atRule => {
      scoper.scopeNode(atRule)
    })

    /**
     * @type {Partial<AtRule>}
     */
    const targetAtRule = {
      type: 'atrule',
      name: 'scope',
      params: '(frame)'
    }
    expect(root.nodes.length).toBe(1)
    expect(root.nodes[0]).toMatchObject(targetAtRule)
  })
  describe('Root', () => {
    it('should group any rules', () => {
      const rule1 = new Rule()
      rule1.append(createDeclarations(10))
      const rule2 = new Rule()
      rule2.append(createDeclarations(20))
      const rule3 = new Rule()
      rule3.append(createDeclarations(15))
      const rule4 = new Rule()
      rule4.append(createDeclarations(40))
      const variableRuleBlock = new Rule()
      variableRuleBlock.append(
        new Declaration({ prop: '--background-color-a', value: 'red' }),
        new Declaration({ prop: '--background-color-b', value: 'green' }),
        new Declaration({ prop: '--background-color-c', value: 'blue' })
      )
      const comment = new Comment()

      const root = new Root()
      root.append(variableRuleBlock, rule1, rule2, rule3, comment, rule4)

      const scoper = new Scoper('(frame)')
      scoper.scopeNode(root)

      root.walkAtRules('scope', atRule => {
        expect(atRule).toBeInstanceOf(AtRule)
        expect(atRule).toMatchObject(targetScopeAtRule)
        expect(atRule.nodes?.length).toBe(5)
        expect(rule1.parent).toMatchObject(atRule)
        expect(rule2.parent).toMatchObject(atRule)
        expect(rule3.parent).toMatchObject(atRule)
        expect(rule4.parent).toMatchObject(atRule)
        expect(comment.parent).toMatchObject(atRule)
      })
    })
    it('should not group top level and omitted atrule', () => {
      const rule = new Rule()
      rule.append(createDeclarations(10))
      const comment = new Comment()
      const layerAtRule = new AtRule({ name: 'layer' })
      const supportsAtRule = new AtRule({ name: 'supports' })
      const charsetAtRule = new AtRule({ name: 'charset' })
      const importAtRule = new AtRule({ name: 'import' })
      const namespaceAtRule = new AtRule({ name: 'namespace' })

      const root = new Root()
      root.append(
        rule,
        comment,
        layerAtRule,
        supportsAtRule,
        charsetAtRule,
        importAtRule,
        namespaceAtRule
      )

      const scoper = new Scoper('(frame)', ['layer', 'supports'])
      scoper.scopeNode(root)

      expect(rule.parent).toMatchObject(targetScopeAtRule)
      expect(comment.parent).toMatchObject(targetScopeAtRule)
      expect(layerAtRule.parent).toBe(root)
      expect(supportsAtRule.parent).toBe(root)
      expect(charsetAtRule.parent).toBe(root)
      expect(importAtRule.parent).toBe(root)
      expect(namespaceAtRule.parent).toBe(root)
    })
  })
})

it('should create different declarations', () => {
  const [first, ...rest] = createDeclarations(10)

  rest.forEach(declaration => {
    expect(first === declaration).toBe(false)
  })
})

/**
 * createDeclarations by amount
 * @param {number} length
 * @returns {Declaration[]}
 */
function createDeclarations(length = 1) {
  return Array.from({ length }, () => new Declaration())
}

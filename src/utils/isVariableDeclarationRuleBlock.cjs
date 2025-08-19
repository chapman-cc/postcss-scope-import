const { Node } = require('postcss')
const isVariableDeclaration = require('./isVariableDeclaration.cjs')
const isComment = require('./isComment.cjs')
const isRule = require('./isRule.cjs')

/**
 * Check if node is block of variable declaration
 * @param {Node|undefined} node
 * @returns {boolean}
 */
function isVariableDeclarationRuleBlock(node) {
  /**
   * @param {Node} node
   * @returns {boolean}
   */
  const isNotComment = node => !isComment(node)

  return (
    isRule(node) &&
    node.nodes.length > 0 &&
    node.nodes.filter(isNotComment).every(isVariableDeclaration)
  )
}

module.exports = isVariableDeclarationRuleBlock

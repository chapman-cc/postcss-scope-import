const { Node, AtRule } = require('postcss')
const isAtRule = require('./isAtRule.cjs')

/**
 * Check if node is included in scope and traverse back to parent root
 * @param {Node|undefined} node
 * @param {string} scope
 * @returns {boolean}
 */
function isScoped(node, scope) {
  if (isAtRule(node) && node.name === 'scope' && node.params === scope) {
    return true
  }

  if (node && node.parent) {
    return isScoped(node.parent, scope)
  }

  return false
}

module.exports = isScoped

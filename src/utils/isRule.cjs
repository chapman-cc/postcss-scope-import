const { Rule, Node } = require('postcss')

/**
 * Check node is rule
 * @param {Node | undefined} node
 * @returns {node is Rule}
 */
function isRule(node) {
  return typeof node === 'object' && node !== null && node.type === 'rule'
}

module.exports = isRule

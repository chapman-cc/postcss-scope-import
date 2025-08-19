const { Node, AtRule } = require('postcss')

/**
 * Check if a node is an at-rule.
 * @param {Node|undefined} node The node to check.
 * @returns {node is AtRule} True if the node is an AtRule, false otherwise.
 */
function isAtRule(node) {
  return typeof node === 'object' && node !== null && node.type === 'atrule'
}

module.exports = isAtRule

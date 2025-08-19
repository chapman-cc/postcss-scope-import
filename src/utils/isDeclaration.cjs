const { Declaration, Node } = require('postcss')

/**
 * Check if a node is a declaration.
 * @param {Node|undefined} node The node to check.
 * @returns {node is Declaration} True if the node is a Declaration, false otherwise.
 */
function isDeclaration(node) {
  return typeof node === 'object' && node !== null && node.type === 'decl'
}

module.exports = isDeclaration

const { Node, Root } = require('postcss')

/**
 * Check node is rule
 * @param {Node|undefined} node
 * @returns {node is Root}
 */
function isRoot(node) {
  return typeof node === 'object' && node !== null && node.type === 'root'
}

module.exports = isRoot

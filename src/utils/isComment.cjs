const { Comment, Node } = require('postcss')

/**
 * Check node is comment
 * @param {Node|undefined} node
 * @returns {node is Comment}
 */
function isComment(node) {
  return typeof node === 'object' && node !== null && node.type === 'comment'
}

module.exports = isComment

const { Declaration, Node } = require('postcss')
const isDeclaration = require('./isDeclaration.cjs')

/**
 * @typedef {Object} CssVariableDeclaration
 * @property {`--${string}`} props - A custom CSS property name (must start with `--`).
 */

/**
 * check if decalration is variable assignment
 * @param {Node|undefined} node
 * @returns {node is Declaration & CssVariableDeclaration}
 */
function isVariableDeclaration(node) {
  return isDeclaration(node) && node.prop?.startsWith('--')
}

module.exports = isVariableDeclaration

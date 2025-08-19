const postcss = require('postcss')
const Scoper = require('./functions/scopeNodes.cjs')

/**
 * @typedef {Object} Options
 * @property {string} scopeRoot value in parenthesis
 * @property {string} [scopeLimit] value in parenthesis
 * @property {string} importPath same import parameter in your css file
 * @property {string[]} [omittedAtRuleNames = []] at rule that should not be scoped
 */

/**
 * @type {postcss.PluginCreator<Options>}
 */
module.exports = opts => {
	const PLUGIN_NAME = 'postcss-scope-import'
	if (!opts) {
		return
	}
	if (!opts.scopeRoot) {
		throw new Error(`${PLUGIN_NAME} requires options "prefix"`)
	}
	if (!opts.importPath) {
		throw new Error(`${PLUGIN_NAME} requires options "import"`)
	}

	const filePath = require.resolve(opts.importPath)
	const scopeParams = opts.scopeLimit
		? `(${opts.scopeRoot}) to (${opts.scopeLimit})`
		: `(${opts.scopeRoot})`
	const scoper = new Scoper(scopeParams, opts.omittedAtRuleNames)

	return {
		postcssPlugin: PLUGIN_NAME,
		Once: root => {
			if (root.source?.input.file === filePath) {
				scoper.scopeNode(root)
			}
			root.walkAtRules(atRule => {
				if (atRule.source?.input.file === filePath) {
					scoper.scopeNode(atRule)
				}
			})
			root.walkRules(rule => {
				if (rule.source?.input.file === filePath) {
					scoper.scopeNode(rule)
				}
			})
		}
	}
}

module.exports.postcss = true

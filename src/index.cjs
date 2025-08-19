const Scoper = require('./functions/scopeNodes.cjs')

/**
 * @typedef {Object} Options
 * @property {string} scope value in parenthesis
 * @property {string} importPath same import parameter in your css file
 * @property {string[]} [omittedAtRuleNames = []] at rule that should not be scoped
 */

/**
 * @type {import('postcss').PluginCreator<Options>}
 */
module.exports = opts => {
	const PLUGIN_NAME = 'postcss-scope-import'
	if (!opts) {
		return
	}
	if (!opts.scope) {
		throw new Error(`${PLUGIN_NAME} requires options "prefix"`)
	}
	if (!opts.importPath) {
		throw new Error(`${PLUGIN_NAME} requires options "import"`)
	}

	const filePath = require.resolve(opts.importPath)
	const { scope, omittedAtRuleNames } = opts
	const scoper = new Scoper(scope, omittedAtRuleNames)

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

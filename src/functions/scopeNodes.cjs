const { Node, AtRule, Rule, Comment, Root } = require('postcss')
const isVariableDeclarationRuleBlock = require('../utils/isVariableDeclarationRuleBlock.cjs')
const isScoped = require('../utils/isScoped.cjs')
const TopLevelAtRuleNames = require('../constants/top-level-atrule.cjs')
const isAtRule = require('../utils/isAtRule.cjs')
const isRule = require('../utils/isRule.cjs')
const isRoot = require('../utils/isRoot.cjs')
const isDeclaration = require('../utils/isDeclaration.cjs')
const isComment = require('../utils/isComment.cjs')

/**
 * For scoping postcss nodes
 */
class Scoper {
	/**
	 * @type {string} scope
	 */
	_scope

	/**
	 * @returns {string}
	 */
	get scope() {
		return this._scope
	}
	/**
	 * @param {string} scope
	 */
	set scope(scope) {
		if (!scope) {
			throw new Error(`Cannot pass \"${scope}\" as scope`)
		}
		this._scope = scope
	}

	/**
	 * @type {Record<string, string>} omittedAtRule
	 */
	_omittedAtRule = {}

	/**
	 * @param {string[] | undefined} atRuleNames
	 */
	set omittedAtRule(atRuleNames) {
		if (!atRuleNames) {
			atRuleNames = []
		}
		if (!Array.isArray(atRuleNames)) {
			throw new Error('omittedAtRules is string[]')
		}
		this._omittedAtRule = atRuleNames.reduce(
			(obj, name) => ({ ...obj, [name]: name }),
			{}
		)
	}

	/**
	 * Create a Scoper
	 * @param {string} scope
	 * @param {string[] | undefined} omittedAtRule
	 */
	constructor(scope, omittedAtRule = undefined) {
		this._scope = scope
		this.omittedAtRule = omittedAtRule
	}

	/**
	 * scope a postcss node
	 * @param {import("postcss").AnyNode} node
	 */
	scopeNode(node) {
		/**
		 * @type {import("postcss").AnyNode['type'][]}
		 */
		const anyNodeTypes = ['atrule', 'comment', 'decl', 'root', 'rule']
		if (!anyNodeTypes.includes(node.type)) {
			throw node.error('Please set node before using scopeNode()')
		}

		if (isDeclaration(node) || isComment(node)) {
			return
		}
		if (isRoot(node)) {
			this._scopeRoot(node)
		} else if (isAtRule(node)) {
			this._scopeAtRule(node)
		} else if (isRule(node)) {
			this._scopeRule(node)
		}
	}

	/**
	 * Scope a Rule
	 * @param {Rule} rule
	 */
	_scopeRule(rule) {
		if (isScoped(rule, this._scope)) {
			return
		}
		if (isVariableDeclarationRuleBlock(rule)) {
			return
		}

		const comments = this._getPreviousComment(rule)

		const previousScopeAtRule = rule.parent?.nodes.find(
			node =>
				isAtRule(node) &&
				node.name === 'scope' &&
				node.params === this._scope
		)
		if (isAtRule(previousScopeAtRule)) {
			previousScopeAtRule.append(...comments, rule)
		} else {
			const scopeAtRule = this._createNewScopeAtRule()
			rule.parent?.insertBefore(rule, scopeAtRule)
			scopeAtRule.append(...comments, rule)
		}
	}
	/**)
	 * Scope an AtRule
	 * @param {AtRule} atRule
	 */
	_scopeAtRule(atRule) {
		if (isScoped(atRule, this._scope)) {
			return
		}

		if (this._isOmittedAtRule(atRule)) {
			return
		}
		const comments = this._getPreviousComment(atRule)
		const prev = atRule.prev()
		if (isAtRule(prev) && isScoped(prev, this._scope)) {
			prev.append(atRule)
		} else {
			const scopeAtRule = this._createNewScopeAtRule()
			atRule.parent?.insertBefore(atRule, scopeAtRule)
			scopeAtRule.append(atRule)
			scopeAtRule.before(comments)
		}
	}
	/**
	 * Scope a Rule
	 * @param {Root} root
	 */
	_scopeRoot(root) {
		const scopeAtRule = this._createNewScopeAtRule()

		/**
		 * @type {Node[]}
		 */
		const cache = []

		for (const node of root.nodes) {
			if (isAtRule(node) && this._isOmittedAtRule(node)) {
				continue
			}
			if (isVariableDeclarationRuleBlock(node)) {
				continue
			}
			cache.push(node)
		}
		scopeAtRule.append(...cache)
		root.append(scopeAtRule)
	}

	/**
	 * Create an AtRule with scope
	 * @returns {AtRule}
	 */
	_createNewScopeAtRule() {
		return new AtRule({ name: 'scope', params: this._scope })
	}

	/**
	 * Check if atrule should be omitted
	 * @param {AtRule} atRule
	 * @returns {boolean}
	 */
	_isOmittedAtRule(atRule) {
		return atRule.name in { ...TopLevelAtRuleNames, ...this._omittedAtRule }
	}
	/**
	 * Retrieve all previous comments of current block
	 * @param {Node} node
	 * @returns {Comment[]}
	 */
	_getPreviousComment(node) {
		const maybeComment = node.prev()
		if (isComment(maybeComment)) {
			const prevComments = this._getPreviousComment(maybeComment)
			prevComments.push(maybeComment)
			return prevComments
		}

		return []
	}
}

module.exports = Scoper

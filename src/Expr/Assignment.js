
/**
 * @imports
 */
import _last from '@web-native-js/commons/arr/last.js';
import _before from '@web-native-js/commons/str/before.js';
import _after from '@web-native-js/commons/str/after.js';
import _isNumber from '@web-native-js/commons/js/isNumber.js';
import _isArray from '@web-native-js/commons/js/isArray.js';
import _isUndefined from '@web-native-js/commons/js/isUndefined.js';
import Lexer from '@web-native-js/commons/str/Lexer.js';
import AssignmentInterface from './AssignmentInterface.js';
import ReferenceInterface from './ReferenceInterface.js';
import SyntaxError from '../SyntaxError.js';
import ReferenceError from '../ReferenceError.js';

/**
 * ---------------------------
 * Assignment class
 * ---------------------------
 */				

const Assignment = class extends AssignmentInterface {

	/**
	 * @inheritdoc
	 */
	constructor(initKeyword, reference, val, operator = '=', postIncrDecr = false) {
		super();
		this.initKeyword = initKeyword;
		this.reference = reference;
		this.val = val;
		this.operator = operator;
		this.postIncrDecr = postIncrDecr;
	}
	 
	/**
	 * @inheritdoc
	 */
	eval(context = null, params = {}) {
		var val, initialVal, reference = this.reference.getEval(context, params);
		if (['++', '--'].includes(this.operator)) {
			initialVal = this.reference.eval(context, params);
			if (!_isNumber(initialVal)) {
				throw new Error(this.reference + ' must be a number!');
			}
			if (this.operator === '++') {
				val = initialVal + 1;
			} else {
				val = initialVal - 1;
			}
		} else if (['+=', '-=', '*=', '/='].includes(this.operator)) {
			var operandA = reference.get();
			var operandB = this.val.eval(context, params);
			if (this.operator !== '+=' && (!_isNumber(operandA) || !_isNumber(operandB))) {
				throw new Error(this + ' - operands must each be a number!');
			}
			if (this.operator === '*=') {
				val = operandA * operandB;
			} else if (this.operator === '/=') {
				val = operandA / operandB;
			} else if (this.operator === '-=') {
				val = operandA - operandB;
			} else {
				val = operandA + operandB;
			}
		} else {
			val = this.val.eval(context, params);
		}
		try {
			reference.set(val, this.initKeyword);
			if (params && _isArray(params.references)) {
				_pushUnique(params.references, this.reference.toString());
			}
			return this.postIncrDecr ? initialVal : val;
		} catch(e) {
			if (e instanceof ReferenceError) {
				throw new ReferenceError('[' + this + ']: ' + e.message);
			} else {
				throw e;
			}
		}
	}
	 
	/**
	 * @inheritdoc
	 */
	toString(context = null) {
		if (['++', '--'].includes(this.operator)) {
			return this.postIncrDecr 
				? this.reference.toString(context) + this.operator
				: this.operator + this.reference.toString(context);
		}
		return (this.initKeyword ? this.initKeyword + ' ' : '')
			+ [this.reference.toString(context), this.operator, this.val.toString(context)].join(' ');
	}
	
	/**
	 * @inheritdoc
	 */
	static parse(expr, parseCallback, params = {}) {
		var parse = Lexer.lex(expr, this.operators.concat([testBlockEnd]));
		if (parse.matches.length) {
			var initKeyword, reference, val, operator = parse.matches[0].trim(), isIncrDecr = ['++', '--'].includes(operator), postIncrDecr;
			if (isIncrDecr) {
				postIncrDecr = (expr.trim().endsWith('++') || expr.trim().endsWith('--'));
				reference = parse.tokens[postIncrDecr ? 'shift' : 'pop']().trim();
			} else {
				reference = parse.tokens.shift().trim();
				val = parse.tokens.shift().trim();
			}
			if (['var', 'let', 'const'].includes(_before(reference, ' '))) {
				if (operator !== '=') {
					throw new SyntaxError('Invalid declaration: ' + expr);
				}
				initKeyword = _before(reference, ' ');
				reference = _after(reference, ' ').trim();
			}
			if (!((reference = parseCallback(reference, null, {lodge: false})) instanceof ReferenceInterface) 
			|| (!isIncrDecr && !(val = parseCallback(val)))) {
				throw new SyntaxError(expr);
			}
			return new this(initKeyword, reference, val, operator, postIncrDecr);
		}
	}
};	

/**
 * @prop array
 */
Assignment.operators = [
	'+=',
	'-=',
	'*=',
	'/=',
	'++',
	'--',
];

const testBlockEnd = (a, b) => {
	// Match exactly "=", not "=>", "==", "==="
	if (!a.endsWith('=') && b.startsWith('=') && !b.startsWith('=>') && !b.startsWith('==') && !b.startsWith('===')) {
		return '=';
	}
	return false;
};

/**
 * @exports
 */
export default Assignment;

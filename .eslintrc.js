module.exports =
{
	'env':
	{
		'browser': true,
		'es6': true
	},
	'extends': 'eslint:recommended',
	'parserOptions':
	{
		'sourceType': 'module'
	},
	'rules':
	{
		'indent': [1, 'tab'],
		'quotes': [1, 'single'],
		'semi': [1, 'never'],
		'no-console': 1,
		'no-var': 1
	}
}
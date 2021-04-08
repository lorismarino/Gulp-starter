module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
    es6: true
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  rules: {
    'no-new': 0
  }
}

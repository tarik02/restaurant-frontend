module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    'prettier',
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'vue/html-self-closing': ['error', {
      'html': {
        'void': 'always',
      },
    }],
    'vue/max-attributes-per-line': [2, {
      'singleline': 5,
    }],
    'vue/name-property-casing': ['error', 'kebab-case'],
    'vue/valid-v-model': 'off',
  },
  globals: {}
}

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true,
    mocha: true,
    jquery: true
  },
  "globals": {
    "expect": true
  },
  extends: [
    'plugin:vue/recommended',
    'standard'
  ],
  plugins: [
    'vue'
  ],
  rules: {
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow debugger during development
    "no-console": 0,
    "vue/max-attributes-per-line": 0,
    "vue/mustache-interpolation-spacing": 0,
    "vue/attribute-hyphenation": 0,
    "vue/singleline-html-element-content-newline": 0,
    "vue/component-name-in-template-casing": 0,
    "vue/multiline-html-element-content-newline": 0,
    "vue/require-prop-types": 0,
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-unused-vars": 0,
    "vue/no-v-html": 0,
    "eol-last": 0,
    "space-before-function-paren": 0,
    "vue/multi-word-component-names": 0,
  }
}
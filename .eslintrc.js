module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true,
    node: true,
    jquery: true
  },
  globals: {
    ArrayBuffer: true,
    Uint8Array: true,
    Float32Array: true
  },
  rules: {
  }
};

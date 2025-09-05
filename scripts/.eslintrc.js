module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "script",
  },
  rules: {
    // Allow require() in Node.js scripts
    "@typescript-eslint/no-require-imports": "off",
    "no-undef": "off",
    "no-unused-vars": "warn",
    "no-console": "off",
  },
  globals: {
    process: "readonly",
    console: "readonly",
    Buffer: "readonly",
    URL: "readonly",
    require: "readonly",
    module: "readonly",
    __dirname: "readonly",
    __filename: "readonly",
  },
};

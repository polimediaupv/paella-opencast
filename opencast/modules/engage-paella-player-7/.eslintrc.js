module.exports = {
  "extends": [
    "../../docs/checkstyle/eslintrc.js",
  ],
  "parser": "@babel/eslint-parser",  
  "parserOptions": {
      "sourceType": "module",
      "ecmaVersion": 2017,
      "ecmaFeatures": {
        "modules": true,
        "impliedStrict": true,
        "jsx": true
      },
      "requireConfigFile": false,
      "babelOptions": {
        "plugins": [
          '@babel/plugin-syntax-class-properties',
          '@babel/plugin-syntax-jsx'
        ]
      }
  },
  "globals": {
      "require": true,
      "cookieconsent": true
  },
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
    
};
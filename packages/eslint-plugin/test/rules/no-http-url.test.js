'use strict';

const rule = require('../../rules/no-http-url');
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester();

ruleTester.run('no-http-url', rule, {
  valid: [
    {
      code: "var test = 'https://mengtong.com';",
    },
  ],

  invalid: [
    {
      code: "var test = 'http://mengtong.com';",
      output: "var test = 'http://mengtong.com';",
      errors: [
        {
          message: 'Recommended "http://mengtong.com" switch to HTTPS',
        },
      ],
    },
    {
      code: "<img src='http://mengtong.com' />",
      output: "<img src='http://mengtong.com' />",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [
        {
          message: 'Recommended "http://mengtong.com" switch to HTTPS',
        },
      ],
    },
  ],
});

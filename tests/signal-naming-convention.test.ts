import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import parser from '@typescript-eslint/parser';
import rule from '../src/rules/signal-naming-convention';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

ruleTester.run('signal-naming-convention', rule, {
  valid: [
    {
      code: 'const $count = signal(0);',
    },
    {
      code: 'const count = notSignal(0);',
    },
    {
      code: 'const { count } = signalSource;',
    },
    {
      code: 'let count;',
    },
    {
      code: 'class Counter { $count = signal(0); }',
    },
    {
      code: 'class Counter { count = signal(0); }',
      options: [{ enforceForProperties: false }],
    },
    {
      code: 'class Counter { ["count"] = signal(0); }',
    },
    {
      code: 'const signalCount = signal(0);',
      options: [{ prefix: ['$', 'signal'] }],
    },
    {
      code: `
        import { signal as s } from '@angular/core';
        const $count = s(0);
      `,
    },
    {
      code: 'const $stream = rxSignal(source$);',
      options: [{ functions: ['rxSignal'] }],
    },
  ],
  invalid: [
    {
      code: 'const count = signal(0);',
      output: 'const $count = signal(0);',
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: 'const total = computed(() => count() + 1);',
      output: 'const $total = computed(() => count() + 1);',
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: 'const current = toSignal(source$);',
      output: 'const $current = toSignal(source$);',
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: 'class Counter { count = signal(0); }',
      output: 'class Counter { $count = signal(0); }',
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: `
        import { signal as s } from '@angular/core';
        const count = s(0);
      `,
      output: `
        import { signal as s } from '@angular/core';
        const $count = s(0);
      `,
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: 'const count = signal(0);',
      output: 'const sigcount = signal(0);',
      options: [{ prefix: 'sig' }],
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: 'const count = signal(0);',
      output: 'const $count = signal(0);',
      options: [{ prefix: ['$', 'signal'] }],
      errors: [{ messageId: 'invalidName' }],
    },
    {
      code: 'const value = makeSignal(0);',
      output: 'const $value = makeSignal(0);',
      options: [{ functions: ['makeSignal'] }],
      errors: [{ messageId: 'invalidName' }],
    },
  ],
});

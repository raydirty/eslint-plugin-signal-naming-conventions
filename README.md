# eslint-plugin-signal-naming-conventions

ESLint 10 plugin that enforces a configurable naming convention for Angular signals.

## Installation

```sh
npm install --save-dev eslint-plugin-signal-naming-conventions
```

## Usage

The plugin exports a built-in `recommended` flat config that enables `signal-naming-conventions/signal-naming-convention`.

Recommended (default):

```js
const { defineConfig } = require('eslint/config');
const signalNamingConventions = require('eslint-plugin-signal-naming-conventions');
const tsParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    ...signalNamingConventions.configs.recommended,
  },
]);
```

Optional manual override (advanced):

```js
const { defineConfig } = require('eslint/config');
const signalNamingConventions = require('eslint-plugin-signal-naming-conventions');
const tsParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      'signal-naming-conventions': signalNamingConventions,
    },
    rules: {
      'signal-naming-conventions/signal-naming-convention': ['error', { prefix: '$' }],
    },
  },
]);
```

## Rule: `signal-naming-convention`

Ensures variables and class properties initialized with Angular signal APIs use a configured prefix.

By default, the rule detects:

- `signal(...)`
- `computed(...)`
- `toSignal(...)`
- aliases imported from `@angular/core`, such as `import { signal as s } from '@angular/core'`

It applies to variable declarations and class properties. Destructuring, non-Identifier class keys, and declarations without initializers are ignored.

### Options

```json
{
  "prefix": "$",
  "functions": ["signal", "computed", "toSignal"],
  "enforceForProperties": true
}
```

- `prefix`: string or string array. Defaults to `"$"`.
- `functions`: signal factory function names to detect. Defaults to `["signal", "computed", "toSignal"]`.
- `enforceForProperties`: whether to check class properties. Defaults to `true`.

### Examples

Invalid:

```ts
const count = signal(0);
const total = computed(() => count() + 1);

class Counter {
  count = signal(0);
}
```

Valid:

```ts
const $count = signal(0);
const $total = computed(() => $count() + 1);

class Counter {
  $count = signal(0);
}
```

Alias imports are supported:

```ts
import { signal as s } from '@angular/core';

const $count = s(0);
```

Multiple prefixes:

```js
const config = {
  rules: {
    'signal-naming-conventions/signal-naming-convention': ['error', { prefix: ['$', 'signal'] }],
  },
};
```

Custom detected functions:

```js
const config = {
  rules: {
    'signal-naming-conventions/signal-naming-convention': [
      'error',
      { functions: ['signal', 'computed', 'toSignal', 'rxSignal'] },
    ],
  },
};
```

Disable class property enforcement:

```js
const config = {
  rules: {
    'signal-naming-conventions/signal-naming-convention': ['error', { enforceForProperties: false }],
  },
};
```

### Autofix

Autofix prepends the first configured prefix to the local declaration name only:

```ts
const count = signal(0);
```

becomes:

```ts
const $count = signal(0);
```

The fixer does not rename references or perform cross-file changes.

## Development

```sh
npm install
npm run lint
npm run build
npm test
```

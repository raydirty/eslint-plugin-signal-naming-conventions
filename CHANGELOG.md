# Changelog

## [1.0.1] - 2026-05-15

### Fixed

- Prevent false positives for call expressions like `signalStore(...)` when not explicitly configured in `functions`.

## [1.0.0] - 2026-05-13

Initial release.

### Added

- `signal-naming-convention` rule — enforces a prefix on variables and class properties initialized with Angular signal APIs (`signal`, `computed`, `toSignal`).
- Alias import support (e.g. `import { signal as s } from '@angular/core'` is still caught).
- `prefix` option: string or array of strings, defaults to `"$"`.

[1.0.1]: https://github.com/raydirty/eslint-plugin-signal-naming-conventions/releases/tag/v1.0.1
[1.0.0]: https://github.com/raydirty/eslint-plugin-signal-naming-conventions/releases/tag/v1.0.0

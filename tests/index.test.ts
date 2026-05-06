import { describe, expect, it } from 'vitest';
import plugin from '../src/index';

describe('plugin export', () => {
  it('exposes a recommended flat config', () => {
    const { recommended } = plugin.configs;

    expect(recommended).toBeDefined();

    if (!recommended) {
      throw new Error('Expected plugin.configs.recommended to be defined.');
    }

    expect(recommended).toMatchObject({
      rules: {
        'signal-naming-conventions/signal-naming-convention': 'error',
      },
    });
    expect(recommended.plugins['signal-naming-conventions']).toBe(plugin);
  });
});

import { describe, expect, it } from 'vitest';
import plugin from '../src/index';

describe('plugin export', () => {
  it('exposes a recommended flat config', () => {
    const { recommended } = plugin.configs;

    expect(recommended).toBeDefined();
    expect(Array.isArray(recommended)).toBe(true);

    if (!recommended || recommended.length === 0) {
      throw new Error('Expected plugin.configs.recommended to be a non-empty array.');
    }

    const [recommendedConfig] = recommended;

    expect(recommendedConfig).toMatchObject({
      rules: {
        'signal-naming-conventions/signal-naming-convention': 'error',
      },
    });
    expect(recommendedConfig.plugins['signal-naming-conventions']).toBe(plugin);
  });
});

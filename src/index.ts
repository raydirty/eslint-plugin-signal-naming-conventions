import signalNamingConvention from './rules/signal-naming-convention';

type Plugin = {
  meta: {
    name: string;
    version: string;
    namespace: string;
  };
  configs: {
    recommended?: {
      plugins: {
        'signal-naming-conventions': Plugin;
      };
      rules: {
        'signal-naming-conventions/signal-naming-convention': 'error';
      };
    };
  };
  rules: {
    'signal-naming-convention': typeof signalNamingConvention;
  };
  processors: Record<string, never>;
};

const plugin: Plugin = {
  meta: {
    name: 'eslint-plugin-signal-naming-conventions',
    version: '0.1.1',
    namespace: 'signal-naming-conventions',
  },
  configs: {},
  rules: {
    'signal-naming-convention': signalNamingConvention,
  },
  processors: {},
};

plugin.configs.recommended = {
  plugins: {
    'signal-naming-conventions': plugin,
  },
  rules: {
    'signal-naming-conventions/signal-naming-convention': 'error',
  },
};

export = plugin;

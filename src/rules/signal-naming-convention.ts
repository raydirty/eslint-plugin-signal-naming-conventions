import { ESLintUtils, TSESTree, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

type Options = [
  {
    prefix?: string | string[];
    functions?: string[];
    enforceForProperties?: boolean;
  },
];

type MessageIds = 'invalidName';

const DEFAULT_PREFIXES = ['$'];
const DEFAULT_FUNCTIONS = ['signal', 'computed', 'toSignal'];
const ANGULAR_CORE_MODULE = '@angular/core';

const createRule = ESLintUtils.RuleCreator.withoutDocs;

const ruleMeta: TSESLint.RuleMetaData<MessageIds, unknown, Options> & {
  docs: {
    description: string;
  };
  languages: readonly ['js/js'];
} = {
  type: 'suggestion',
  docs: {
    description:
      'Enforce a configurable prefix for variables and class properties initialized with Angular signal APIs.',
  },
  fixable: 'code',
  languages: ['js/js'],
  messages: {
    invalidName: 'Signal name "{{name}}" must start with one of the configured prefixes: {{prefixes}}.',
  },
  schema: [
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        prefix: {
          description: 'Prefix string or list of accepted prefixes for signal variable/property names.',
          oneOf: [
            {
              description: 'Single prefix value.',
              type: 'string',
              minLength: 1,
            },
            {
              description: 'Multiple allowed prefixes.',
              type: 'array',
              minItems: 1,
              items: {
                type: 'string',
                minLength: 1,
              },
              uniqueItems: true,
            },
          ],
        },
        functions: {
          description: 'Function names that create signals and should trigger naming checks.',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1,
          },
          uniqueItems: true,
        },
        enforceForProperties: {
          description: 'Whether class properties initialized with signal APIs are validated.',
          type: 'boolean',
        },
      },
    },
  ],
  defaultOptions: [
    {
      prefix: DEFAULT_PREFIXES,
      functions: DEFAULT_FUNCTIONS,
      enforceForProperties: true,
    },
  ],
};

function normalizePrefixes(prefix: string | string[] | undefined): string[] {
  if (Array.isArray(prefix)) {
    return prefix.length > 0 ? prefix : DEFAULT_PREFIXES;
  }

  return prefix ? [prefix] : DEFAULT_PREFIXES;
}

function normalizeFunctions(functions: string[] | undefined): string[] {
  return functions && functions.length > 0 ? functions : DEFAULT_FUNCTIONS;
}

function isIdentifierCallee(callee: TSESTree.CallExpression['callee']): callee is TSESTree.Identifier {
  return callee.type === AST_NODE_TYPES.Identifier;
}

function isAngularCoreImport(node: TSESTree.ImportDeclaration): boolean {
  return node.source.value === ANGULAR_CORE_MODULE;
}

function hasSignalLikeType(context: Readonly<TSESLint.RuleContext<MessageIds, Options>>, node: TSESTree.Node): boolean {
  const parserServices = context.sourceCode.parserServices;

  if (!parserServices?.program || !parserServices.esTreeNodeToTSNodeMap) {
    return false;
  }

  try {
    const typeChecker = parserServices.program.getTypeChecker();
    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
    const type = typeChecker.getTypeAtLocation(tsNode);
    const renderedType = typeChecker.typeToString(type);

    return /(^|\W)(Signal|WritableSignal|InputSignal|ModelSignal)</.test(renderedType);
  } catch {
    return false;
  }
}

export default createRule<Options, MessageIds>({
  name: 'signal-naming-convention',
  meta: ruleMeta,
  create(context, [options]) {
    const prefixes = normalizePrefixes(options.prefix);
    const firstPrefix = prefixes[0];
    const configuredFunctions = new Set(normalizeFunctions(options.functions));
    const enforceForProperties = options.enforceForProperties ?? true;
    const angularSignalLocals = new Set<string>();

    function isSignalInitializer(node: TSESTree.Expression | null | undefined): boolean {
      if (!node) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.CallExpression &&
        isIdentifierCallee(node.callee) &&
        (configuredFunctions.has(node.callee.name) || angularSignalLocals.has(node.callee.name))
      ) {
        return true;
      }

      return hasSignalLikeType(context, node);
    }

    function enforceName(nameNode: TSESTree.Identifier): void {
      if (prefixes.some((prefix) => nameNode.name.startsWith(prefix))) {
        return;
      }

      context.report({
        node: nameNode,
        messageId: 'invalidName',
        data: {
          name: nameNode.name,
          prefixes: prefixes.join(', '),
        },
        fix(fixer) {
          return fixer.insertTextBefore(nameNode, firstPrefix);
        },
      });
    }

    return {
      ImportDeclaration(node): void {
        if (!isAngularCoreImport(node)) {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== AST_NODE_TYPES.ImportSpecifier) {
            continue;
          }

          const importedName =
            specifier.imported.type === AST_NODE_TYPES.Identifier ? specifier.imported.name : specifier.imported.value;

          if (configuredFunctions.has(importedName)) {
            angularSignalLocals.add(specifier.local.name);
          }
        }
      },
      VariableDeclarator(node): void {
        if (node.id.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (isSignalInitializer(node.init)) {
          enforceName(node.id);
        }
      },
      PropertyDefinition(node): void {
        if (!enforceForProperties || node.key.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (isSignalInitializer(node.value)) {
          enforceName(node.key);
        }
      },
    };
  },
});

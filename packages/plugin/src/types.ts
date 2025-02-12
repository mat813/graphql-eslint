import { GraphQLParseOptions } from '@graphql-tools/utils';
import { AST, Linter, Rule } from 'eslint';
import * as ESTree from 'estree';
import { GraphQLSchema } from 'graphql';
import { IExtensions, IGraphQLProject } from 'graphql-config';
import { JSONSchema } from 'json-schema-to-ts';
import { SiblingOperations } from './siblings.js';
import { GraphQLESLintRuleListener } from './testkit.js';

export type Schema = GraphQLSchema | null;
export type Pointer = string | string[];

export interface ParserOptions {
  schema?: Pointer | Record<string, { headers: Record<string, string> }>;
  documents?: Pointer;
  extensions?: IExtensions;
  include?: Pointer;
  exclude?: Pointer;
  projects?: Record<string, IGraphQLProject>;
  schemaOptions?: Omit<GraphQLParseOptions, 'assumeValidSDL'> & {
    headers: Record<string, string>;
  };
  graphQLParserOptions?: Omit<GraphQLParseOptions, 'noLocation'>;
  skipGraphQLConfig?: boolean;
  filePath: string;
  /** @deprecated Use `documents` instead */
  operations?: Pointer;
}

export type ParserServices = {
  schema: Schema;
  siblingOperations: SiblingOperations;
};

export type GraphQLESLintParseResult = Linter.ESLintParseResult & {
  services: ParserServices;
};

type Location = AST.SourceLocation | ESTree.Position;

type ReportDescriptorLocation = { loc: Location } | { node: { loc: Location } };
export type ReportDescriptor = ReportDescriptorLocation &
  Rule.ReportDescriptorMessage &
  Rule.ReportDescriptorOptions;

export type GraphQLESLintRuleContext<Options = any[]> = Omit<
  Rule.RuleContext,
  'options' | 'parserServices' | 'report'
> & {
  options: Options;
  parserServices: ParserServices;
  report(descriptor: ReportDescriptor): void;
};

export type CategoryType = 'Operations' | 'Schema';

type RuleMetaDataDocs = Required<Rule.RuleMetaData>['docs'];

export type RuleDocsInfo<T> = Omit<RuleMetaDataDocs, 'category' | 'suggestion'> & {
  category: CategoryType | CategoryType[];
  requiresSchema?: true;
  requiresSiblings?: true;
  examples?: {
    title: string;
    code: string;
    usage?: T;
  }[];
  configOptions?:
    | T
    | {
        schema?: T;
        operations?: T;
      };
  graphQLJSRuleName?: string;
  isDisabledForAllConfig?: true;
};

export type GraphQLESLintRule<Options = [], WithTypeInfo extends boolean = false> = {
  meta: Omit<Rule.RuleMetaData, 'docs' | 'schema'> & {
    docs?: RuleDocsInfo<Options>;
    schema: Readonly<JSONSchema> | [];
  };
  create(context: GraphQLESLintRuleContext<Options>): GraphQLESLintRuleListener<WithTypeInfo>;
};

export type ValueOf<T> = T[keyof T];

// eslint-disable-next-line @typescript-eslint/ban-types -- Cosmetic use only, makes the tooltips expand the type can be removed
type Id<T> = { [P in keyof T]: T[P] } & {};

type OmitDistributive<T, K extends PropertyKey> = T extends object ? Id<OmitRecursively<T, K>> : T;
export type OmitRecursively<T extends object, K extends PropertyKey> = Omit<
  { [P in keyof T]: OmitDistributive<T[P], K> },
  K
>;

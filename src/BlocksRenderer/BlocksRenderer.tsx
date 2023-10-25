import * as React from 'react';

import { Block } from '../Block';
import { type TextInlineNode } from '../Text';

/* -------------------------------------------------------------------------------------------------
 * TypeScript types and utils
 * -----------------------------------------------------------------------------------------------*/

interface ParagraphBlockNode {
  type: 'paragraph';
  children: InlineNode[];
}

interface HeadingBlockNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

interface LinkInlineNode {
  type: 'link';
  url: string;
  children: TextInlineNode[];
}

// Inline node types
type InlineNode = TextInlineNode | LinkInlineNode;
type NonTextInlineNode = Exclude<InlineNode, TextInlineNode>;

// Block node types
export type RootNode = ParagraphBlockNode | HeadingBlockNode;
export type Node = RootNode | NonTextInlineNode;

// Util to convert a node to the props of the corresponding React component
export type GetPropsFromNode<T> = Omit<T, 'type' | 'children'> & { children: React.ReactNode };

// Map of all block types to their matching React component
type BlocksComponents = {
  [K in Node['type']]: React.ComponentType<
    // Find the BlockProps in the union that match the type key of the current BlockNode
    // and use it as the component props
    GetPropsFromNode<Extract<Node, { type: K }>>
  >;
};

// Map of all inline types to their matching React component
export type Modifier = Exclude<keyof TextInlineNode, 'type' | 'text'>;
type ModifiersComponents = {
  [K in Modifier]: React.ComponentType<{ children: React.ReactNode }>;
};

/* -------------------------------------------------------------------------------------------------
 * Default blocks and modifiers components
 * -----------------------------------------------------------------------------------------------*/

interface ComponentsContextValue {
  blocks: BlocksComponents;
  modifiers: ModifiersComponents;
}

const defaultComponents: ComponentsContextValue = {
  blocks: {
    paragraph: (props) => <p>{props.children}</p>,
    // TODO all heading levels
    heading: (props) => <h1>{props.children}</h1>,
    link: (props) => <a href={props.url}>{props.children}</a>,
  },
  modifiers: {
    bold: (props) => <strong>{props.children}</strong>,
    italic: (props) => <em>{props.children}</em>,
    underline: (props) => <u>{props.children}</u>,
    strikethrough: (props) => <del>{props.children}</del>,
    code: (props) => <code>{props.children}</code>,
  },
};

/* -------------------------------------------------------------------------------------------------
 * Context to pass blocks and inline components to the nested components
 * -----------------------------------------------------------------------------------------------*/

const ComponentsContext = React.createContext<ComponentsContextValue>(defaultComponents);

interface ComponentsProviderProps {
  children: React.ReactNode;
  value?: ComponentsContextValue;
}

// Export the component with a default value
// so we don't need to import defaultComponentsContextValue in all tests
export const ComponentsProvider = ({
  children,
  value = defaultComponents,
}: ComponentsProviderProps) => {
  return <ComponentsContext.Provider value={value}>{children}</ComponentsContext.Provider>;
};

export function useComponentsContext() {
  return React.useContext(ComponentsContext);
}

/* -------------------------------------------------------------------------------------------------
 * BlocksRenderer
 * -----------------------------------------------------------------------------------------------*/

interface BlocksRendererProps {
  content: RootNode[];
  blocks?: Partial<BlocksComponents>;
  modifiers?: Partial<ModifiersComponents>;
}

export const BlocksRenderer = (props: BlocksRendererProps) => {
  // Merge default blocks with the ones provided by the user
  const blocks = {
    ...defaultComponents.blocks,
    ...props.blocks,
  };

  // Merge default modifiers with the ones provided by the user
  const modifiers = {
    ...defaultComponents.modifiers,
    ...props.modifiers,
  };

  return (
    <div>
      <ComponentsProvider value={{ blocks, modifiers }}>
        {/* TODO use WeakMap instead of index as the key */}
        {props.content.map((content, index) => (
          <Block content={content} key={index} />
        ))}
      </ComponentsProvider>
    </div>
  );
};

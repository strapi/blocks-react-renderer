import * as React from 'react';

import { Block } from '../Block';
import { type TextInlineNode } from '../Text';

/* -------------------------------------------------------------------------------------------------
 * TypeScript types and utils
 * -----------------------------------------------------------------------------------------------*/

interface LinkInlineNode {
  type: 'link';
  url: string;
  children: TextInlineNode[];
}

interface ListItemInlineNode {
  type: 'list-item';
  children: DefaultInlineNodeChild[];
}

// Inline node types
type DefaultInlineNodeChild = TextInlineNode | LinkInlineNode;
type NonTextInlineNode = Exclude<DefaultInlineNodeChild, TextInlineNode> | ListItemInlineNode;

interface ParagraphBlockNode {
  type: 'paragraph';
  children: DefaultInlineNodeChild[];
}

interface HeadingBlockNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: DefaultInlineNodeChild[];
}

interface ListBlockNode {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: (ListItemInlineNode | ListBlockNode)[];
}

// Block node types
export type RootNode = ParagraphBlockNode | HeadingBlockNode | ListBlockNode;
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
    heading: ({ level, children }) => {
      switch (level) {
        case 1:
          return <h1>{children}</h1>;
        case 2:
          return <h2>{children}</h2>;
        case 3:
          return <h3>{children}</h3>;
        case 4:
          return <h4>{children}</h4>;
        case 5:
          return <h5>{children}</h5>;
        case 6:
          return <h6>{children}</h6>;
      }
    },
    link: (props) => <a href={props.url}>{props.children}</a>,
    list: (props) => {
      if (props.format === 'ordered') {
        return <ol>{props.children}</ol>;
      }

      return <ul>{props.children}</ul>;
    },
    'list-item': (props) => <li>{props.children}</li>,
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

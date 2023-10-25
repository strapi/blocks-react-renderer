import * as React from 'react';

import { useComponentsContext } from '../BlocksRenderer';
import { Text } from '../Text';

import type { Node, GetPropsFromNode } from '../BlocksRenderer';

type BlockProps = GetPropsFromNode<Node>;

interface BlockRendererProps {
  content: Node;
}

export const Block = ({ content }: BlockRendererProps) => {
  const { children: childrenNodes, type, ...props } = content;

  // Get matching React component from the context
  const { blocks } = useComponentsContext();
  const BlockComponent = blocks[type] as React.ComponentType<BlockProps> | undefined;

  if (!BlockComponent) {
    /**
     * Silently ignore blocks that we don't know how to render
     * This shouldn't happen for now, but would enable us to add new block types
     * or custom blocks in the future without breaking the renderer.
     */
    return null;
  }

  return (
    <BlockComponent {...props}>
      {childrenNodes.map((childNode, index) => {
        if (childNode.type === 'text') {
          const { type: _type, ...childNodeProps } = childNode;

          // TODO use node as key with WeakMap
          return <Text {...childNodeProps} key={index} />;
        }

        // TODO use node as key with WeakMap
        return <Block content={childNode} key={index} />;
      })}
    </BlockComponent>
  );
};

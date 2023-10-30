import * as React from 'react';

import { useComponentsContext, type Node, type GetPropsFromNode } from './BlocksRenderer';
import { Text } from './Text';

type BlockComponentProps = GetPropsFromNode<Node>;

interface BlockProps {
  content: Node;
}

const voidTypes = ['image'];

const Block = ({ content }: BlockProps) => {
  const { children: childrenNodes, type, ...props } = content;

  // Get matching React component from the context
  const { blocks, missingBlockTypes } = useComponentsContext();
  const BlockComponent = blocks[type] as React.ComponentType<BlockComponentProps> | undefined;

  if (!BlockComponent) {
    // Only warn once per missing block
    if (
      ['development', 'test'].includes(process.env.NODE_ENV as string) &&
      !missingBlockTypes.includes(type)
    ) {
      console.warn(`No component found for block type "${type}"`);
      missingBlockTypes.push(type);
    }

    // Don't throw an error, just ignore the block
    return null;
  }

  // Handle void types separately as they should not render children
  if (voidTypes.includes(type) || !childrenNodes) {
    return <BlockComponent {...props} />;
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

export { Block };

import * as React from 'react';

import { useComponentsContext, type Node, type GetPropsFromNode } from './BlocksRenderer';
import { Text } from './Text';

type BlockComponentProps = GetPropsFromNode<Node>;
type ListNode = Extract<Node, { type: 'list' }>;
type ListItemNode = Extract<Node, { type: 'list-item' }>;

interface BlockProps {
  content: Node;
  nestedLists?: ListNode[];
}

const voidTypes = ['image'];

/**
 * Add props that are specific to a block type, and not present in that node type
 */
const augmentProps = (content: Node) => {
  const { children: childrenNodes, type, ...props } = content;

  if (type === 'code' || type === 'heading') {
    // Builds a plain text string from an array of nodes, regardless of links or modifiers
    const getPlainText = (children: typeof childrenNodes): string => {
      return children.reduce((currentPlainText, node) => {
        if (node.type === 'text') {
          return currentPlainText.concat(node.text);
        }

        if (node.type === 'link') {
          return currentPlainText.concat(getPlainText(node.children));
        }

        return currentPlainText;
      }, '');
    };

    return {
      ...props,
      plainText: getPlainText(content.children),
    };
  }

  return props;
};

const groupListItems = (children: ListNode['children']) => {
  const items: { item: ListItemNode; nestedLists: ListNode[] }[] = [];

  for (const child of children) {
    if (child.type === 'list-item') {
      items.push({ item: child, nestedLists: [] });
      continue;
    }

    // The editor stores sublists next to their parent list item.
    if (items.length === 0) {
      items.push({ item: { type: 'list-item', children: [] }, nestedLists: [] });
    }

    items[items.length - 1].nestedLists.push(child);
  }

  return items;
};

const Block = ({ content, nestedLists }: BlockProps) => {
  const { children: childrenNodes, type, ...props } = content;

  // Get matching React component from the context
  const { blocks, missingBlockTypes } = useComponentsContext();
  const BlockComponent = blocks[type] as React.ComponentType<BlockComponentProps> | undefined;

  if (!BlockComponent) {
    // Only warn once per missing block
    if (!missingBlockTypes.includes(type)) {
      console.warn(`[@strapi/block-react-renderer] No component found for block type "${type}"`);
      missingBlockTypes.push(type);
    }

    // Don't throw an error, just ignore the block
    return null;
  }

  // Handle void types separately as they should not render children
  if (voidTypes.includes(type)) {
    return <BlockComponent {...props} />;
  }

  // Handle empty paragraphs separately as they should render a <br> tag
  if (
    type === 'paragraph' &&
    childrenNodes.length === 1 &&
    childrenNodes[0].type === 'text' &&
    childrenNodes[0].text === ''
  ) {
    return <br />;
  }

  const augmentedProps = augmentProps(content);

  if (type === 'list') {
    return (
      <BlockComponent {...augmentedProps}>
        {groupListItems(childrenNodes).map(({ item, nestedLists }, index) => (
          <Block content={item} nestedLists={nestedLists} key={index} />
        ))}
      </BlockComponent>
    );
  }

  return (
    <BlockComponent {...augmentedProps}>
      {childrenNodes.map((childNode, index) => {
        if (childNode.type === 'text') {
          const { type: _type, ...childNodeProps } = childNode;

          // TODO use node as key with WeakMap
          return <Text {...childNodeProps} key={index} />;
        }

        // TODO use node as key with WeakMap
        return <Block content={childNode} key={index} />;
      })}
      {nestedLists?.map((list, index) => <Block content={list} key={index} />)}
    </BlockComponent>
  );
};

export { Block };

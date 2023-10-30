import * as React from 'react';

import { useComponentsContext } from '../BlocksRenderer';

interface TextInlineNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

type Modifier = Exclude<keyof TextInlineNode, 'type' | 'text'>;

type TextInlineProps = Omit<TextInlineNode, 'type'>;

const Text = ({ text, ...modifiers }: TextInlineProps) => {
  // Get matching React component from the context
  const { modifiers: modifierComponents } = useComponentsContext();

  const modifierNames = Object.keys(modifiers) as Modifier[];

  // Loop on each active modifier to wrap the text in its component
  return modifierNames.reduce(
    (children, modifierName) => {
      // Don't wrap the text if the modifier is disabled
      if (!modifiers[modifierName]) {
        return children;
      }

      const ModifierComponent = modifierComponents[modifierName];

      // Silently fail if the modifier is unknown
      // in case we add new modifiers or other attributes in the future
      if (!ModifierComponent) {
        return children;
      }

      return <ModifierComponent>{children}</ModifierComponent>;
    },
    // By default, return the text without any wrapper to avoid useless nesting
    <>{text}</>
  );
};

export type { TextInlineNode, Modifier };
export { Text };

import * as React from 'react';

import { useComponentsContext } from '../BlocksRenderer';

import type { Modifier } from '../BlocksRenderer';

/* -------------------------------------------------------------------------------------------------
 * Default modifier components
 * -----------------------------------------------------------------------------------------------*/

export interface TextInlineNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

type TextInlineProps = Omit<TextInlineNode, 'type'>;

export const Text = ({ text, ...modifiers }: TextInlineProps) => {
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
    <span>{text}</span>
  );
};

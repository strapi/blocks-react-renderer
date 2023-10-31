# Strapi Blocks React Renderer

Easily render the content of Strapi's new Blocks rich text editor in your React frontend.

## Installation

Install the Blocks renderer and its peer dependencies:

```sh
yarn add @strapi/blocks-react-renderer react react-dom
```

```sh
npm install @strapi/blocks-react-renderer react react-dom
```

## Basic usage

After fetching your Strapi content, you can use the BlocksRenderer component to render the data from a blocks attribute. Pass the array of blocks coming from your Strapi API to the `content` prop:

```jsx
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

// Content should come from your Strapi API
const content = [
  {
    type: 'paragraph',
    children: [{ type: 'text', text: 'A simple paragraph' }],
  },
];

const App = () => {
  return <BlocksRenderer content={content} />;
};
```

## Custom components

You can provide your own React components to the renderer, both for blocks and modifier. They will be merged with the default components, so you can override only the ones you need.

- **Blocks** are full-width elements, usually at the root of the content. The available options are:
  - paragraph
  - heading
  - list
  - quote
  - code
  - image
  - link
- **Modifiers** are inline elements, used to change the appearance of fragments of text within a block. The available options are:
  - bold
  - italic
  - underline
  - strikethrough
  - code

To provide your own components, pass an object to the `blocks` and `modifiers` props of the renderer. For each type, the value should be a React component that will receive the props of the block or modifier. Make sure to always render the children, so that the nested blocks and modifiers are rendered as well.

```jsx
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

// Content should come from your Strapi API
const content = [
  {
    type: 'paragraph',
    children: [{ type: 'text', text: 'A simple paragraph' }],
  },
];

const App = () => {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        // You can use the default components to set class names
        paragraph: ({ children }) => <p className="text-neutral900 max-w-prose">{children}</p>,
        // ...or point to a design system
        heading: ({ children, level }) => {
          switch (level) {
            case 1:
              return <Typography variant="h1">{children}</h1>
            case 2:
              return <Typography variant="h2">{children}</h2>
            case 3:
              return <Typography variant="h3">{children}</h3>
            case 4:
              return <Typography variant="h4">{children}</h4>
            case 5:
              return <Typography variant="h5">{children}</h5>
            case 6:
              return <Typography variant="h6">{children}</h6>
            default:
              return <Typography variant="h1">{children}</h1>
          }
          // For links, you may want to use the component from your router or framework
          link: ({ children, href }) => <Link to={href}>{children}</Link>,
        },
      }}
      modifiers={{
        bold: ({ children }) => <strong>{children}</strong>,
        italic: ({ children }) => <span className="italic">{children}</em>,
      }}
    />
  );
};
```

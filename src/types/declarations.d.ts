/// <reference types="vite/client" />

declare module 'canvas-confetti' {
  const confetti: any;
  export default confetti;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'react-dom/client' {
  import { Root } from 'react-dom';
  export function createRoot(container: Element | DocumentFragment): any;
}

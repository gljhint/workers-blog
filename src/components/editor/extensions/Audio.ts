import { Node, mergeAttributes } from '@tiptap/core';

export interface AudioOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Add an audio element
       */
      setAudio: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export const Audio = Node.create<AudioOptions>({
  name: 'audio',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      controls: {
        default: true,
      },
      preload: {
        default: 'metadata',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'audio',
      mergeAttributes(
        {
          controls: true,
          preload: 'metadata',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Audio;
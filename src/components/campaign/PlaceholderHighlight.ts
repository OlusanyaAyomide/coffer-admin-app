import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const PLACEHOLDER_RE = /\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi;

export interface PlaceholderHighlightOptions {
  allowed: ReadonlyArray<string>;
}

/**
 * TipTap extension that decorates `{{name}}` occurrences inline — valid
 * placeholders get a pill style, unknown ones a wavy underline. Decoration-only:
 * the underlying text stays plain, so `editor.getHTML()` returns the unmodified
 * `{{name}}` syntax.
 */
export const PlaceholderHighlight =
  Extension.create<PlaceholderHighlightOptions>({
    name: 'placeholderHighlight',

    addOptions() {
      return { allowed: [] };
    },

    addProseMirrorPlugins() {
      const allowedSet = new Set(
        this.options.allowed.map((s) => s.toLowerCase()),
      );

      return [
        new Plugin({
          key: new PluginKey('placeholderHighlight'),
          props: {
            decorations(state) {
              const decorations: Array<Decoration> = [];

              state.doc.descendants((node, pos) => {
                if (!node.isText || !node.text) return;
                const text = node.text;
                const re = new RegExp(PLACEHOLDER_RE.source, 'gi');
                let match: RegExpExecArray | null;
                while ((match = re.exec(text)) !== null) {
                  const name = match[1].toLowerCase();
                  const start = pos + match.index;
                  const end = start + match[0].length;
                  decorations.push(
                    Decoration.inline(start, end, {
                      class: allowedSet.has(name)
                        ? 'placeholder-valid'
                        : 'placeholder-invalid',
                    }),
                  );
                }
              });

              return DecorationSet.create(state.doc, decorations);
            },
          },
        }),
      ];
    },
  });

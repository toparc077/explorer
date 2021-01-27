// @ts-nocheck
import { clarity } from '@sandbox/common/clarity-reference';

export function autocomplete(monaco: any) {
  // @ts-ignore
  const provider = {
    triggerCharacters: ['(', "'", '"', ' '],
    provideCompletionItems: (model, position) => {
      // // Get all the text content before the cursor
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const fullRange = model.getFullModelRange();
      const text = model.getValueInRange(fullRange);
      const lines = text.split('\n');
      const nfts = new Set([]);
      const fts = new Set([]);
      const functions = new Set([]);
      const principals = new Set([]);

      const getToken = (line, replacer) =>
        line
          .replace(`${replacer}`, '')
          .split(' ')
          .map(t => t.replace(new RegExp(/\)/, 'g'), ''))
          .filter(t => t !== ' ')
          .filter(t => t !== '')
          .filter(t => t)[0];

      const DEFINE_NFT = `(define-non-fungible-token`;
      const DEFINE_FT = `(define-fungible-token`;
      const DEFINE_PUBLIC = `(define-public (`;
      const DEFINE_READ_ONLY = `(define-read-only (`;

      lines.forEach(line => {
        if (line.includes(" '")) {
          const token = line.split(" '").map(t => t.replace(new RegExp(/\)/, 'g'), ''))[1];
          if (token) {
            principals.add(token);
          }
        }
        if (line.includes(DEFINE_NFT)) {
          const token = getToken(line, `${DEFINE_NFT} `);
          if (token) {
            nfts.add(token);
          }
        }
        if (line.includes(DEFINE_FT)) {
          const token = getToken(line, `${DEFINE_FT} `);
          fts.add(token);
        }
        if (line.includes(DEFINE_PUBLIC)) {
          const token = getToken(line, `${DEFINE_PUBLIC}`);
          functions.add(token);
        }
        if (line.includes(DEFINE_READ_ONLY)) {
          const token = getToken(line, `${DEFINE_READ_ONLY}`);
          functions.add(token);
        }
      });

      if (
        textUntilPosition.match(/(nft-mint|nft-burn|nft-get-owner|nft-transfer)\?\s$/) &&
        [...nfts].length > 0
      ) {
        return {
          suggestions: [...nfts].map(nft => ({
            label: nft,
            insertText: nft,
            kind: monaco.languages.CompletionItemKind.Constant,
          })),
        };
      }
      if (
        textUntilPosition.match(/(ft-mint|ft-burn|ft-get-owner|ft-transfer)\?\s$/) &&
        [...fts].length > 0
      ) {
        return {
          suggestions: [...fts].map(nft => ({
            label: nft,
            insertText: nft,
            kind: monaco.languages.CompletionItemKind.Constant,
          })),
        };
      }

      if (textUntilPosition.endsWith('(')) {
        return {
          suggestions: clarity.functions.map(func => ({
            // Show the full file path for label
            label: func.name,
            // Don't keep extension for JS files
            insertText: func.name.split(' ')[0],
            kind: monaco.languages.CompletionItemKind.Function,
          })),
        };
      }

      return;
    },
  };
  monaco.languages.registerCompletionItemProvider('clarity', provider);
}

import React from 'react';
import Prism from 'prismjs';

import createCommands from './commands';
import createQueries from './queries';
import handler from './handler';
import defaultOption from './option';
import { CodeBlock, CodeLine } from './components';

// https://github.com/GitbookIO/slate-edit-code
const createDecoration = ({ text, path, textStart, textEnd, start, end, data }) => {
  if (start >= textEnd || end <= textStart) {
    return null;
  }

  // Shrink to this text boundaries
  start = Math.max(start, textStart);
  end = Math.min(end, textEnd);

  // Now shift offsets to be relative to this text
  start -= textStart;
  end -= textStart;

  return {
    anchor: {
      key: text.key,
      path,
      offset: start,
    },
    focus: {
      key: text.key,
      path,
      offset: end,
    },
    type: 'prismjs-token',
    data,
  };
};

// may be a better name
const createCodePlugin = opt => {
  const option = Object.assign({}, defaultOption, opt);
  const schema = {
    blocks: {
      code: {
        nodes: [
          {
            match: { type: 'code_line' },
          },
        ],
        normalize,
      },
      code_line: {
        nodes: [{ match: { object: 'text' } }],
      },
    },
  };
  return {
    commands: createCommands(option),
    queries: createQueries(option),
    ...handler(option),
    schema,
    renderBlock,
    renderDecoration,
    decorateNode,
  };

  function normalize(editor, error) {
    if (error.code === 'child_type_invalid') {
      const { node, child } = error;

      if (child.type === 'paragraph') return editor.moveNodeAfterAnotherNode(child, node);
    }
  }

  function renderBlock(props, editor, next) {
    const { node } = props;
    switch (node.type) {
      case option.codeType:
        return <CodeBlock {...props} />;
      case option.codeLineType:
        return <CodeLine {...props} />;
      default:
        return next();
    }
  }

  function renderDecoration(props, editor, next) {
    const { decoration, children, attributes } = props;
    if (decoration.type === option.markType) {
      const className = `${decoration.data.get('className')} token`;
      return (
        <span {...attributes} className={className}>
          {children}
        </span>
      );
    }
    return next();
  }

  function decorateNode(node, editor, next) {
    const others = next();
    if (node.type !== option.codeType) return others;
    const texts = Array.from(node.texts());
    const blockTotalText = texts.map(t => t[0].text).join('\n');
    const language = node.data.get('language');

    const grammer = Prism.languages[language];
    const tokens = Prism.tokenize(blockTotalText, grammer);

    const [, decorations] = texts.reduce(
      (acc, [text, path]) => {
        const [textStart, outDecorations] = acc;
        const textEnd = textStart + text.text.length;

        function processToken(token, type, info) {
          const [offset, innerDecorations] = info;
          if (typeof token === 'string') {
            let decoration = null;
            if (type) {
              decoration = createDecoration({
                text,
                path,
                textStart,
                textEnd,
                start: offset,
                end: offset + token.length,
                data: { className: type },
              });
            }
            return [offset + token.length, innerDecorations.concat(decoration)];
          } else {
            // typeof token === 'object'
            const currentClassName = [type]
              .concat(token.type, token.alias)
              .filter(x => !!x)
              .join(' ');
            if (typeof token.content === 'string') {
              const decoration = createDecoration({
                text,
                path,
                textStart,
                textEnd,
                start: offset,
                end: offset + token.content.length,
                data: { className: currentClassName },
              });
              return [offset + token.content.length, innerDecorations.concat(decoration)];
            } else {
              return token.content.reduce(
                (innerAcc, content) => processToken(content, token.type, innerAcc),
                info,
              );
            }
          }
        }

        const [, newDecorations] = tokens.reduce(
          (tokenAcc, token) => processToken(token, null, tokenAcc),
          [0, outDecorations],
        );
        return [textEnd + 1, newDecorations]; // '+1' for '/n'
      },
      [0, []],
    );
    return decorations.filter(x => !!x);
  }
};

export default createCodePlugin;

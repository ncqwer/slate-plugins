import React, { useState } from 'react';
import Prism from 'prismjs';
import copyHelper from 'copy-to-clipboard';
import { useSelected } from 'slate-react';
import { Node } from 'slate';

import { Icon } from '@zhujianshi/slate-plugin-utils';

import { MARK_TYPE, CODE_TYPE, CODE_LINE_TYPE } from './constants';

import './style.less';

// https://github.com/GitbookIO/slate-edit-code
const createDecoration = ({ text, path, textStart, textEnd, start, end, className }) => {
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
      path,
      offset: start,
    },
    focus: {
      path,
      offset: end,
    },
    type: 'prismjs-token',
    className,
  };
};

const CopyButton = ({ onClick, ...others }) => {
  const [copyStatus, setCopyStatus] = useState(false);
  return (
    <div {...others} onClick={handleClick} onMouseLeave={handleMouseLeave}>
      {!copyStatus ? <Icon type="copy" /> : 'copyed'}
    </div>
  );

  function handleClick() {
    /* eslint-disable no-unused-expressions*/
    onClick && onClick();
    setCopyStatus(true);
  }

  function handleMouseLeave() {
    setCopyStatus(false);
  }
};

const renderDecoration = (props, next) => {
  const { decoration, children, attributes } = props;
  if (decoration.type === MARK_TYPE) {
    const className = `${decoration.className} token`;
    return (
      <span {...attributes} className={className}>
        {children}
      </span>
    );
  }
  return next();
};

const decorate = ([element, elementPath], next) => {
  if (element.type !== CODE_TYPE) return next();
  const textEntry = Array.from(Node.texts(element));
  const blockTotalText = textEntry.map(t => t[0].text).join('\n');
  const language = element.language;

  const grammer = Prism.languages[language];
  const tokens = Prism.tokenize(blockTotalText, grammer);

  const [, decorations] = textEntry.reduce(
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
              path: elementPath.concat(path),
              textStart,
              textEnd,
              start: offset,
              end: offset + token.length,
              className: type,
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
              path: elementPath.concat(path),
              textStart,
              textEnd,
              start: offset,
              end: offset + token.content.length,
              className: currentClassName,
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
};

export default opt => {
  const {
    block: CODE_CLASS,
    'block--selected': CODE_SELECTED_CLASS,
    'block__copy-button': COPY_BUTTON_CLASS,
    block__hint: HINT_CLASS,
    block__line: LINE_CLASS,
  } = opt.className;
  return {
    renderElement: (props, next) => {
      const { element } = props;
      switch (element.type) {
        case CODE_TYPE:
          return <CodeBlock {...props} />;
        case CODE_LINE_TYPE:
          return <CodeLine {...props} />;
        default:
          return next();
      }
    },
    decorate,
    renderDecoration,
  };
  function CodeBlock(props) {
    const { attributes, element, children } = props;
    const isSelected = useSelected();
    const language = element.language;
    const className = isSelected ? CODE_SELECTED_CLASS : CODE_CLASS;
    return (
      <div {...attributes} className={className}>
        <div contentEditable={false}>
          <CopyButton className={COPY_BUTTON_CLASS} onClick={handleCopyBtnClick} />
          <div className={HINT_CLASS}>exit: Shift+↩</div>
        </div>
        <pre className={`code language-${language}`}>
          <code>{children}</code>
        </pre>
      </div>
    );

    function handleCopyBtnClick() {
      const text = Array.from(Node.texts(element))
        .map(([textNode]) => textNode.text)
        .join('\n');
      copyHelper(text);
    }
  }
  function CodeLine(props) {
    const { children, attributes } = props;
    return (
      <div {...attributes} className={LINE_CLASS}>
        {children}
      </div>
    );
  }
};

// export default opt => {
//   const {
//     block: CODE_CLASS,
//     'block--selected': CODE_SELECTED_CLASS,
//     'block__copy-button': COPY_BUTTON_CLASS,
//     block__hint: HINT_CLASS,
//     block__line: LINE_CLASS,
//   } = opt.className;
//   const CodeBlock = props => {
//     const { attributes, node, children, isSelected } = props;
//     const language = node.data.get('language');
//     const className = isSelected ? CODE_SELECTED_CLASS : CODE_CLASS;
//     return (
//       <div {...attributes} className={className}>
//         <div contentEditable={false}>
//           <CopyButton className={COPY_BUTTON_CLASS} onClick={handleCopyBtnClick} />
//           <div className={HINT_CLASS}>exit: Shift+↩</div>
//         </div>
//         <pre className={`code language-${language}`}>
//           <code>{children}</code>
//         </pre>
//       </div>
//     );

//     function handleCopyBtnClick() {
//       const text = node
//         .getTexts()
//         .map(t => t.text)
//         .join('\n');
//       copyHelper(text);
//     }
//   };

//   const CodeLine = props => {
//     const { children, attributes } = props;
//     return (
//       <div {...attributes} className={LINE_CLASS}>
//         {children}
//       </div>
//     );
//   };
//   return {
//     renderBlock,
//     renderDecoration,
//     decorateNode,
//   };

//   function renderBlock(props, editor, next) {
//     const { node } = props;
//     switch (node.type) {
//       case opt.codeType:
//         return <CodeBlock {...props} />;
//       case opt.codeLineType:
//         return <CodeLine {...props} />;
//       default:
//         return next();
//     }
//   }

//   function renderDecoration(props, editor, next) {
//     const { decoration, children, attributes } = props;
//     if (decoration.type === opt.markType) {
//       const className = `${decoration.data.get('className')} token`;
//       return (
//         <span {...attributes} className={className}>
//           {children}
//         </span>
//       );
//     }
//     return next();
//   }

//   function decorateNode(node, editor, next) {
//     const others = next();
//     if (node.type !== opt.codeType) return others;
//     const texts = Array.from(node.texts());
//     const blockTotalText = texts.map(t => t[0].text).join('\n');
//     const language = node.data.get('language');

//     const grammer = Prism.languages[language];
//     const tokens = Prism.tokenize(blockTotalText, grammer);

//     const [, decorations] = texts.reduce(
//       (acc, [text, path]) => {
//         const [textStart, outDecorations] = acc;
//         const textEnd = textStart + text.text.length;

//         function processToken(token, type, info) {
//           const [offset, innerDecorations] = info;
//           if (typeof token === 'string') {
//             let decoration = null;
//             if (type) {
//               decoration = createDecoration({
//                 text,
//                 path,
//                 textStart,
//                 textEnd,
//                 start: offset,
//                 end: offset + token.length,
//                 data: { className: type },
//               });
//             }
//             return [offset + token.length, innerDecorations.concat(decoration)];
//           } else {
//             // typeof token === 'object'
//             const currentClassName = [type]
//               .concat(token.type, token.alias)
//               .filter(x => !!x)
//               .join(' ');
//             if (typeof token.content === 'string') {
//               const decoration = createDecoration({
//                 text,
//                 path,
//                 textStart,
//                 textEnd,
//                 start: offset,
//                 end: offset + token.content.length,
//                 data: { className: currentClassName },
//               });
//               return [offset + token.content.length, innerDecorations.concat(decoration)];
//             } else {
//               return token.content.reduce(
//                 (innerAcc, content) => processToken(content, token.type, innerAcc),
//                 info,
//               );
//             }
//           }
//         }

//         const [, newDecorations] = tokens.reduce(
//           (tokenAcc, token) => processToken(token, null, tokenAcc),
//           [0, outDecorations],
//         );
//         return [textEnd + 1, newDecorations]; // '+1' for '/n'
//       },
//       [0, []],
//     );
//     return decorations.filter(x => !!x);
//   }
// };

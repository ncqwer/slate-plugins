import React, { useRef, useEffect, useState } from 'react';

import katex from 'katex';

import 'katex/dist/katex.min.css';
import './block.less';

const KatexPreview = ({ text, onClick }) => {
  const ref = useRef(null);
  const [katexHtml, setKatexHtml] = useState('');
  const [validState, setValidState] = useState(true);
  const className = ['preview']
    .concat(validState && text.length === 0 ? 'empty' : '', validState ? '' : 'error')
    .join(' ');
  useEffect(() => {
    try {
      const result = katex.renderToString(text);
      setKatexHtml(result);
      setValidState(true);
    } catch (e) {
      if (e instanceof katex.ParseError) {
        setValidState(false);
        setKatexHtml('');
      } else {
        throw e;
      }
    }
  }, [text]);
  return (
    <div
      ref={ref}
      contentEditable={false}
      className={className}
      dangerouslySetInnerHTML={{ __html: katexHtml }}
      onClick={onClick}
    />
  );
};

export const KatexBlock = props => {
  const { node, isSelected, attributes, children, editor } = props;
  const mathTex = node.text;
  const className = ['container-block'].concat(isSelected ? 'active' : '').join(' ');
  return (
    <figure {...attributes} className={className}>
      <div className="content">{children}</div>
      {renderPreview()}
    </figure>
  );

  // render function
  function renderPreview() {
    return <KatexPreview text={mathTex} onClick={onClick} />;
  }

  // handle function
  function onClick(e) {
    editor.moveToStartOfNode(node).focus();
  }
};

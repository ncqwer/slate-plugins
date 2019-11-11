import React from 'react';
// import "prismjs/themes/prism.css";
// import "prismjs/themes/prism-tomorrow.css";

import './style.less';

export const CodeBlock = props => {
  const { attributes, node, children, isSelected } = props;
  const language = node.data.get('language');
  const className = `code_wraper${isSelected ? ' active' : ''}`;
  return (
    <div {...attributes} className={className}>
      <div contentEditable={false}>
        <button className={'code_copy_button'}>copy</button>
        <div className="code_block_hint">exit: Shift+↩</div>
      </div>
      <pre className={`code language-${language}`}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const CodeLine = props => {
  const { children, attributes } = props;
  return (
    <div {...attributes} className="code_line">
      {children}
    </div>
  );
};

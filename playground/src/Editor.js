import React, { useMemo, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

import codeBaseReact from '@zhujianshi/slate-code-base';
import '@zhujianshi/slate-code-base/lib/index.css';

import { compose, slateExtend } from '@zhujianshi/slate-plugin-utils';

const { renderElement, decorate, renderDecoration, onKeyDown } = slateExtend(codeBaseReact(), {
  renderElement: ({ attributes, children }) => <p {...attributes}>{children}</p>,
  decorate: () => [],
  renderDecoration: () => {},
  onKeyDown: () => {},
});

const HEADINGS = 10;
const initialValue = [];

// const {withCode,Code} = codeFactory();

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    children: [
      {
        text: 'const hhh= ()=>{}',
        marks: [],
      },
    ],
    type: 'paragraph',
  });
}

const HugeDocumentExample = () => {
  const editor = useMemo(() => compose(withReact, createEditor)(), []);
  const handleKeyDown = useCallback(e => onKeyDown(e, editor), [editor]);
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable
        renderElement={renderElement}
        spellCheck
        autoFocus
        decorate={decorate}
        renderDecoration={renderDecoration}
        onKeyDown={handleKeyDown}
      />
    </Slate>
  );
};

export default HugeDocumentExample;

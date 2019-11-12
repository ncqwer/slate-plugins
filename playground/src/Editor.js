import React, { useState, useRef } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';

import codeBase from '@zhujianshi/slate-code-base';
import codeMath from '@zhujianshi/slate-code-math';
import '@zhujianshi/slate-code-base/lib/index.css';
import '@zhujianshi/slate-code-math/lib/index.css';
import './Editor.css';
const plugins = [codeBase(), codeMath()];
// const plugins = [];
const ExtendedEditor = () => {
  const ref = useRef(null);
  const [value, setValue] = useState(
    Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                text: 'A line of text in a paragraph.',
              },
            ],
          },
        ],
      },
    }),
  );
  return (
    <div className="editor_wrapper">
      <Editor
        value={value}
        onChange={({ value }) => {
          // console.log(value);
          setValue(value);
        }}
        plugins={plugins}
        ref={ref}
      ></Editor>
    </div>
  );
};

export default ExtendedEditor;

import React, { useState, useRef } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';

/* eslint-disable*/
import codeBase from '@zhujianshi/slate-code-base';
import mathPlugin from '@zhujianshi/slate-code-math';
import '@zhujianshi/slate-code-base/lib/index.css';
import '@zhujianshi/slate-code-math/lib/index.css';

import './Editor.less';
const plugins = [codeBase(), mathPlugin()];
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
                text: 'Try type $$+space to create math block:',
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
          setValue(value);
        }}
        plugins={plugins}
        ref={ref}
      ></Editor>
    </div>
  );
};

export default ExtendedEditor;

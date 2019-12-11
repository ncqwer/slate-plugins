import React, { useState, useRef } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';

import Draggable from '@zhujianshi/slate-draggable';
import codeBase from '@zhujianshi/slate-code-base';
import codeMath from '@zhujianshi/slate-code-math';
import table from '@zhujianshi/slate-table';
import list from '@zhujianshi/slate-list';
import '@zhujianshi/slate-code-base/lib/index.css';
import '@zhujianshi/slate-code-math/lib/index.css';
import '@zhujianshi/slate-table/lib/index.css';
import '@zhujianshi/slate-list/lib/index.css';
import '@zhujianshi/slate-draggable/lib/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './Editor.css';

const code = codeBase();

const plugins = [Draggable(), code, codeMath(), table(), list()];
// const plugins = [code, codeMath(), table()];
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

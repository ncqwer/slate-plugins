import React, { useRef } from 'react';
import Backend from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';

import { useThrottle } from '@zhujianshi/slate-plugin-utils';
import './style.less';
export default opt => {
  const {
    block__body__handler: HANDLER_CLASS,
    block: BLOCK_CLASS,
    'block--invisible': BLOCK_INVISIBLE_CLASS,
    block__body: BLOCK_BODY_CLASS,
  } = opt.className;
  const DnDContainer = props => {
    const self = useRef(null);
    const { node, children, editor } = props;
    const [moveNode] = useThrottle((source, target) => {
      if (source.key === target.key) return;
      console.log('heavy task');
      return editor.moveNodeBeforeAnotherNode(source, target);
    }, 500);
    // const moveNode = (source, target) => {
    //   console.log('heavy task');
    //   if (source.key === target.key) return;
    //   return editor.moveNodeBeforeAnotherNode(source, target);
    // };
    const [{ isDragging }, dragRef, previewRef] = useDrag({
      item: {
        source: node,
        type: 'topBlock',
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
      begin: monitor => {
        editor.deselect().blur();
      },
    });
    const [, dropRef] = useDrop({
      accept: 'topBlock',
      hover: ({ source }) => {
        moveNode(source, node);
      },
    });
    previewRef(self);
    dropRef(self);
    return (
      <div className={isDragging ? BLOCK_INVISIBLE_CLASS : BLOCK_CLASS}>
        <div ref={self} className={BLOCK_BODY_CLASS}>
          <span contentEditable={false} ref={dragRef} className={HANDLER_CLASS}>
            :::
          </span>
          {children}
        </div>
      </div>
    );
  };

  return {
    renderEditor,
    renderBlock,
  };

  function renderEditor(props, editor, next) {
    return <DndProvider backend={Backend}>{next()}</DndProvider>;
  }

  function renderBlock(props, editor, next) {
    const { node } = props;
    if (!editor.isTopBlock(node)) return next();
    return <DnDContainer {...props}>{next()}</DnDContainer>;
  }
};

import React, { Fragment } from 'react';

import './style.less';

export default opt => {
  const {
    'block--order': ORDER_LIST,
    'block--unorder': UNORDER_LIST,
    'block--task': TASK_LIST,
    block__item__checkbox: LIST_ITEM_CHECKBOX,
    'block__item__checkbox--checked': LIST_ITEM_CHECKBOX_CHECKED,
    'block__item--order': ORDER_LIST_ITEM,
    'block__item--unorder': UNORDER_LIST_ITEM,
    'block__item--task': TASK_LIST_ITEM,
  } = opt.className;
  const { listType, listItemType } = opt;
  return {
    renderBlock(props, editor, next) {
      const { type } = props.node;
      if (type === listType) return <ListContainer {...props} />;
      if (type === listItemType) return <ListItem {...props} />;

      return next();
    },
  };

  // component
  function ListContainer({ attributes, children, node }) {
    const firstNode = node.nodes.first();
    const type = firstNode.data.get('modifier');
    return (
      <Fragment>
        {renderOrder()}
        {renderUnorder()}
        {renderTask()}
      </Fragment>
    );
    function renderOrder() {
      const startIdx = firstNode.data.get('startIdx') || 1;
      if (type !== 'order') return null;
      return (
        <ol {...attributes} className={ORDER_LIST} start={startIdx}>
          {children}
        </ol>
      );
    }
    function renderUnorder() {
      if (type !== 'unorder') return null;
      return (
        <ul {...attributes} className={UNORDER_LIST}>
          {children}
        </ul>
      );
    }
    function renderTask() {
      if (type !== 'task') return null;
      return (
        <ul {...attributes} className={TASK_LIST}>
          {children}
        </ul>
      );
    }
  }

  function ListItem({ attributes, children, node, editor }) {
    let listItemClassName = null;
    const modifier = node.data.get('modifier');
    const checkStatus = node.data.get('checked');
    if (modifier === 'order') listItemClassName = ORDER_LIST_ITEM;
    if (modifier === 'unorder') listItemClassName = UNORDER_LIST_ITEM;
    if (modifier === 'task') listItemClassName = TASK_LIST_ITEM;
    return (
      <li {...attributes} className={listItemClassName}>
        {renderTaskCheckBox()}
        {children}
      </li>
    );
    function renderTaskCheckBox() {
      const checkClassName = checkStatus ? LIST_ITEM_CHECKBOX_CHECKED : LIST_ITEM_CHECKBOX;
      if (modifier !== 'task') return null;
      return (
        <input
          type="checkbox"
          contentEditable={false}
          className={checkClassName}
          onClick={handleCheckboxClick}
        />
      );
    }

    function handleCheckboxClick() {
      const newData = node.data.set('checked', !checkStatus);
      return editor.setNodeByKey(node.key, { data: newData });
    }
  }
};

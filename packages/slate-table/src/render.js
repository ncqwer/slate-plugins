import React, { useEffect, useRef, Fragment } from 'react';

import { Icon } from '@zhujianshi/slate-plugin-utils';
import './style.less';

export default opt => {
  const {
    block: TABLE_CLASS,
    'block__tool--table-menu': TABLE_MENU_CLASS,
    'block__tool--row-menu': ROW_MENU_CLASS,
    'block__tool--col-menu': COL_MENU_CLASS,
    'block__tool--plus': PLUS_CLASS,
  } = opt.className;
  const STable = ({ children, node, attributes, editor, isSelected, isFocused }) => {
    return (
      <figure className={TABLE_CLASS}>
        {renderTableMenu()}
        {renderBody()}
        {renderPlusIcon()}
        {renderRowMenu()}
        {renderColMenu()}
      </figure>
    );

    function renderBody() {
      return (
        <table {...attributes}>
          <thead>{children[0]}</thead>
          <tbody>{children.slice(1)}</tbody>
        </table>
      );
    }

    function renderPlusIcon() {
      const pos = node.data.get('plusPos');
      if (!isSelected) return <Fragment />;
      if (!pos) return <Fragment />;
      const style = {
        left: pos.left,
        top: pos.top,
      };
      return (
        <div
          contentEditable={false}
          onClick={handleInsert('insertRowAfter')}
          className={PLUS_CLASS}
          style={style}
        >
          <Icon type="row-add" />
        </div>
      );
    }
    function renderRowMenu() {
      const pos = node.data.get('rowMenuPos');
      if (!isSelected) return <Fragment />;
      if (!pos) return <Fragment />;
      const style = {
        left: pos.left,
        top: pos.top,
        height: `${pos.height}px`,
      };
      return (
        <div
          contentEditable={false}
          onClick={handleRemove('row')}
          className={ROW_MENU_CLASS}
          style={style}
        >
          <ul>
            <li>
              <Icon type="delete" />
            </li>
          </ul>
        </div>
      );
    }
    function renderColMenu() {
      const pos = node.data.get('colMenuPos');
      const isInHead = node.data.get('isInHead');
      if (!isInHead) return <Fragment />;
      if (!isSelected) return <Fragment />;
      if (!pos) return <Fragment />;
      const style = {
        left: pos.left,
        top: pos.top,
        width: `${pos.width}px`,
      };
      return (
        <div contentEditable={false} className={COL_MENU_CLASS} style={style}>
          <ul>
            <li onClick={handleInsert('insertColumnBefore')}>
              <Icon type="add_col_before" />
            </li>
            <li onClick={handleLeftAlign}>
              <Icon type="align-left" />
            </li>
            <li onClick={handleCenterAlign}>
              <Icon type="align-center" />
            </li>
            <li onClick={handleRightAlign}>
              <Icon type="align-right" />
            </li>
            <li onClick={handleRemove('column')}>
              <Icon type="delete" />
            </li>
            <li onClick={handleInsert('insertColumnAfter')}>
              <Icon type="add_col_after" />
            </li>
          </ul>
        </div>
      );
    }

    function renderTableMenu() {
      const height = node.data.get('tableHeight');
      if (!height) return <Fragment />;
      if (!isSelected) return <Fragment />;
      const isSingleRow = node.nodes.size === 1;
      const style = {
        height: `${height}px`,
      };
      return (
        <div contentEditable={false} className={TABLE_MENU_CLASS} style={style}>
          <ul>
            <li>
              <Icon type="table" />
            </li>
            {!isSingleRow && (
              <li onClick={handleRemoveTable}>
                <Icon type="delete" />
              </li>
            )}
          </ul>
        </div>
      );
    }

    function handleLeftAlign() {
      editor.alignColumnText('left');
    }
    function handleCenterAlign() {
      editor.alignColumnText('center');
    }
    function handleRightAlign() {
      editor.alignColumnText('right');
    }
    function handleInsert(command) {
      return () => editor[command]();
    }
    function handleRemove(type) {
      if (type === 'row') return () => editor.removeRow();
      if (type === 'column') return () => editor.removeColumn();
    }
    function handleRemoveTable() {
      return editor.removeNodeByKey(node.key);
    }
  };
  const SRow = ({ attributes, children, node, isFocused, editor }) => {
    const nodeKey = node.key;
    const self = useRef(null);
    useEffect(() => {
      const [tableBlock] = editor.getTablePositionByKey(nodeKey);
      const isLastRow = tableBlock.nodes.last() === node;
      const prevTableData = tableBlock.data;
      let newTableData = prevTableData;
      if (isLastRow && self.current) {
        const { offsetTop, offsetHeight } = self.current;
        newTableData = newTableData.set('tableHeight', offsetTop + offsetHeight);
      }
      if (isFocused && self.current) {
        const { offsetTop, offsetHeight, offsetWidth, offsetLeft } = self.current;
        const plusTop = offsetTop + offsetHeight;
        const plusLeft = offsetLeft + offsetWidth / 2;
        const menuTop = offsetTop;
        const menuLeft = offsetLeft + offsetWidth;
        const isInHead = tableBlock.nodes.first().key === nodeKey;
        newTableData = newTableData
          .set('plusPos', {
            top: plusTop,
            left: plusLeft,
          })
          .set('rowMenuPos', {
            top: menuTop,
            height: offsetHeight,
            left: menuLeft,
          })
          .set('isInHead', isInHead);
      }
      if (newTableData !== prevTableData)
        editor.setNodeByKey(tableBlock.key, { data: newTableData });
    });
    return (
      <tr {...attributes} ref={self}>
        {children}
      </tr>
    );
  };
  const SCell = ({ attributes, children, node, isFocused, editor }) => {
    const nodeKey = node.key;
    const self = useRef(null);
    const alignClass = node.data.get('text-align');
    useEffect(() => {
      if (isFocused && self.current) {
        const [tableBlock, rowBlock] = editor.getTablePositionByKey(nodeKey);
        const isHead = tableBlock.nodes.first() === rowBlock;
        if (isHead) {
          const { offsetTop, offsetWidth, offsetLeft } = self.current;
          const newData = tableBlock.data.set('colMenuPos', {
            top: offsetTop,
            width: offsetWidth,
            left: offsetLeft,
          });
          editor.setNodeByKey(tableBlock.key, { data: newData });
        }
      }
    });
    return (
      <td {...attributes} className={alignClass} ref={self}>
        {children}
      </td>
    );
  };
  const { tableType, rowType, cellType } = opt;
  return {
    renderBlock,
  };

  function renderBlock(props, editor, next) {
    const { node } = props;
    if (node.type === tableType) return <STable {...props} />;
    if (node.type === rowType) return <SRow {...props} />;
    if (node.type === cellType) return <SCell {...props} />;

    return next();
  }
};

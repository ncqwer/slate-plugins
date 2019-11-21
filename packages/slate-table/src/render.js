import React, { useEffect, useRef, Fragment } from 'react';
import './style.less';

/*
      <div className="table-tool-bar">
        <ul>
          <li>表格</li>
          <li onClick={handleLeftAlign}>左对齐</li>
          <li onClick={handleCenterAlign}>居中对齐</li>
          <li onClick={handleRightAlign}>右对齐</li>
          <li onClick={handleRemoveTable}>删除</li>
          <li onClick={handleInsert('insertColumnBefore')}>向前插列</li>
          <li onClick={handleInsert('insertColumnAfter')}>向后插列</li>
          <li onClick={handleInsert('insertRowBefore')}>向前插行</li>
          <li onClick={handleInsert('insertRowAfter')}>向后插行</li>
          <li onClick={handleRemove('row')}>删除当前行</li>
          <li onClick={handleRemove('column')}>删除当前列</li>
        </ul>
      </div>
*/

const STable = ({ children, node, attributes, editor, isSelected, isFocused }) => {
  return (
    <figure className="figure-table">
      {renderBody()}
      {renderPlusIcon()}
      {renderRowMenu()}
      {renderColMenu()}
    </figure>
  );

  function renderBody() {
    const hasHeader = !node.data.get('headless');
    if (hasHeader) {
      return (
        <table {...attributes}>
          <thead>{children[0]}</thead>
          <tbody>{children.slice(1)}</tbody>
        </table>
      );
    }
    return (
      <table {...attributes}>
        <tbody>{children}</tbody>
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
        className="table-tool-plus"
        style={style}
      >
        <span className="iconfont icon-row-add" />
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
        className="table-tool-menu-row"
        style={style}
      >
        <span className="iconfont icon-delete" />
      </div>
    );
  }
  function renderColMenu() {
    const pos = node.data.get('colMenuPos');
    const [, rowBlock] = editor.getTablePosition();
    if (node.nodes.first() !== rowBlock) return <Fragment />;
    if (!isSelected) return <Fragment />;
    if (!pos) return <Fragment />;
    const style = {
      left: pos.left,
      top: pos.top,
      width: `${pos.width}px`,
    };
    return (
      <div contentEditable={false} className="table-tool-menu-col" style={style}>
        <ul>
          <li onClick={handleInsert('insertColumnBefore')}>
            <span className="iconfont icon-row-add" />
          </li>
          <li onClick={handleLeftAlign}>
            <span className="iconfont icon-align-left" />
          </li>
          <li onClick={handleCenterAlign}>
            <span className="iconfont icon-align-center" />
          </li>
          <li onClick={handleRightAlign}>
            <span className="iconfont icon-align-right" />
          </li>
          <li onClick={handleRemove('column')}>
            <span className="iconfont icon-delete" />
          </li>
          <li onClick={handleInsert('insertColumnAfter')}>
            <span className="iconfont icon-row-add" />
          </li>
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
};
const SRow = ({ attributes, children, node, isFocused, editor }) => {
  const nodeKey = node.key;
  const self = useRef(null);
  useEffect(() => {
    if (isFocused && self.current) {
      const [tableBlock] = editor.getTablePositionByKey(nodeKey);
      const { offsetTop, offsetHeight, offsetWidth, offsetLeft } = self.current;
      const plusTop = offsetTop + offsetHeight;
      const plusLeft = offsetLeft + offsetWidth / 2;
      const menuTop = offsetTop;
      const menuLeft = offsetLeft + offsetWidth;
      const newData = tableBlock.data
        .set('plusPos', {
          top: plusTop,
          left: plusLeft,
        })
        .set('rowMenuPos', {
          top: menuTop,
          height: offsetHeight,
          left: menuLeft,
        });
      editor.setNodeByKey(tableBlock.key, { data: newData });
    }
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
export default opt => {
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

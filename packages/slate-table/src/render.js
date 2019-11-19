import React from 'react';
import './style.less';

const STable = ({ children, node, attributes, editor }) => {
  return (
    <figure className="figure-table">
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
        </ul>
      </div>
      {renderBody()}
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

  function handleLeftAlign() {
    editor.alignColumnText('left');
  }
  function handleCenterAlign() {
    editor.alignColumnText('center');
  }
  function handleRightAlign() {
    editor.alignColumnText('right');
  }
  function handleRemoveTable() {
    const [tableBlock] = editor.getTablePosition();
    return editor.removeNodeByKey(tableBlock.key);
  }
  function handleInsert(command) {
    return () => editor[command]();
  }
};
const SRow = ({ attributes, children }) => <tr {...attributes}>{children}</tr>;
const SCell = ({ attributes, children, node }) => {
  const alignClass = node.data.get('text-align');
  return (
    <td {...attributes} className={alignClass}>
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
    if (node.type === tableType) return <STable {...props}></STable>;
    if (node.type === rowType) return <SRow {...props}></SRow>;
    if (node.type === cellType) return <SCell {...props}></SCell>;

    return next();
  }
};

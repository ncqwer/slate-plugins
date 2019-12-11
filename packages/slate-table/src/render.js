import React, { useState, Fragment } from 'react';

import {
  Icon,
  IconBar,
  useDebounce,
  useResizeDetecter,
  useWatch,
} from '@zhujianshi/slate-plugin-utils';
import './style.less';

export default opt => {
  const {
    block: TABLE_CLASS,
    'block__tool--table-menu': TABLE_MENU_CLASS,
    'block__tool--row-menu': ROW_MENU_CLASS,
    'block__tool--col-menu': COL_MENU_CLASS,
    'block__icon-bar--table': ICON_TABLE,
    'block__icon-bar--row': ICON_ROW,
    'block__icon-bar--col': ICON_COL,
    'block__custom-rc--tooltip': TOOLTIP,
  } = opt.className;
  const STable = ({ children, node, attributes, editor, isSelected, isFocused }) => {
    const [tableHeight, setTableHeight] = useState(0);
    const rawHandler = ({ contentRect }) => {
      setTableHeight(contentRect.height);
    };
    const [handler] = useDebounce(rawHandler);
    const ref = useResizeDetecter(handler);
    return (
      <figure className={TABLE_CLASS}>
        {renderTableMenu()}
        {renderBody()}
        {renderRowMenu()}
        {renderColMenu()}
      </figure>
    );

    function renderBody() {
      return (
        <table {...attributes} ref={ref}>
          <thead>{children[0]}</thead>
          <tbody>{children.slice(1)}</tbody>
        </table>
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
        <IconBar
          className={ROW_MENU_CLASS}
          placement="right"
          trigger={['hover']}
          innerStyle={style}
          popupClassName={TOOLTIP}
        >
          <ul className={ICON_ROW}>
            <li onClick={handleInsert('insertRowBefore')}>
              <Icon type="add_row_before" />
            </li>
            <li onClick={handleInsert('insertRowAfter')}>
              <Icon type="add_row_after" />
            </li>
            <li onClick={handleRemove('row')}>
              <Icon type="delete" />
            </li>
          </ul>
        </IconBar>
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
        <IconBar
          className={COL_MENU_CLASS}
          placement="top"
          trigger={['hover']}
          innerStyle={style}
          popupClassName={TOOLTIP}
        >
          <ul className={ICON_COL}>
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
        </IconBar>
      );
    }

    function renderTableMenu() {
      if (!tableHeight) return <Fragment />;
      if (!isSelected) return <Fragment />;
      const style = {
        height: `${tableHeight}px`,
      };

      return (
        <IconBar
          className={TABLE_MENU_CLASS}
          placement="left"
          trigger={['hover']}
          innerStyle={style}
          popupClassName={TOOLTIP}
        >
          <ul className={ICON_TABLE}>
            <li>
              <Icon type="table" />
            </li>
            <li onClick={handleRemoveTable}>
              <Icon type="delete" />
            </li>
          </ul>
        </IconBar>
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
    // const self = useRef(null);
    const [handler] = useDebounce(({ target }) => {
      if (isFocused && !!target) {
        const [tableBlock] = editor.getTablePositionByKey(nodeKey);
        const { offsetTop, offsetHeight, offsetWidth, offsetLeft } = target;
        const menuTop = offsetTop;
        const menuLeft = offsetLeft + offsetWidth;
        const isInHead = tableBlock.nodes.first().key === nodeKey;
        const newTableData = tableBlock.data
          .set('rowMenuPos', {
            top: menuTop,
            height: offsetHeight,
            left: menuLeft,
          })
          .set('isInHead', isInHead);
        editor.setNodeByKey(tableBlock.key, { data: newTableData });
      }
    });
    const self = useResizeDetecter(handler);
    useWatch(() => {
      handler({ target: self.current });
    }, [isFocused]);
    // useEffect(() => {
    //   const [tableBlock] = editor.getTablePositionByKey(nodeKey);
    //   const isLastRow = tableBlock.nodes.last() === node;
    //   const prevTableData = tableBlock.data;
    //   let newTableData = prevTableData;
    //   if (isLastRow && self.current) {
    //     const { offsetTop, offsetHeight } = self.current;
    //     newTableData = newTableData.set('tableHeight', offsetTop + offsetHeight);
    //   }
    //   if (isFocused && self.current) {
    //     const { offsetTop, offsetHeight, offsetWidth, offsetLeft } = self.current;
    //     const plusTop = offsetTop + offsetHeight;
    //     const plusLeft = offsetLeft + offsetWidth / 2;
    //     const menuTop = offsetTop;
    //     const menuLeft = offsetLeft + offsetWidth;
    //     const isInHead = tableBlock.nodes.first().key === nodeKey;
    //     newTableData = newTableData
    //       .set('plusPos', {
    //         top: plusTop,
    //         left: plusLeft,
    //       })
    //       .set('rowMenuPos', {
    //         top: menuTop,
    //         height: offsetHeight,
    //         left: menuLeft,
    //       })
    //       .set('isInHead', isInHead);
    //   }
    //   if (newTableData !== prevTableData)
    //     editor.setNodeByKey(tableBlock.key, { data: newTableData });
    // });
    return (
      <tr {...attributes} ref={self}>
        {children}
      </tr>
    );
  };
  const SCell = ({ attributes, children, node, isFocused, editor }) => {
    const nodeKey = node.key;
    const alignClass = node.data.get('text-align');
    const [handler] = useDebounce(({ target }) => {
      if (isFocused && self.current) {
        const [tableBlock, rowBlock] = editor.getTablePositionByKey(nodeKey);
        const isHead = tableBlock.nodes.first() === rowBlock;
        if (isHead) {
          const { offsetTop, offsetWidth, offsetLeft } = target;
          const newData = tableBlock.data.set('colMenuPos', {
            top: offsetTop,
            width: offsetWidth,
            left: offsetLeft,
          });
          editor.setNodeByKey(tableBlock.key, { data: newData });
        }
      }
    });
    const self = useResizeDetecter(handler);
    useWatch(() => {
      handler({ target: self.current });
    }, [isFocused]);
    // useEffect(() => {
    //   if (isFocused && self.current) {
    //     const [tableBlock, rowBlock] = editor.getTablePositionByKey(nodeKey);
    //     const isHead = tableBlock.nodes.first() === rowBlock;
    //     if (isHead) {
    //       const { offsetTop, offsetWidth, offsetLeft } = self.current;
    //       const newData = tableBlock.data.set('colMenuPos', {
    //         top: offsetTop,
    //         width: offsetWidth,
    //         left: offsetLeft,
    //       });
    //       editor.setNodeByKey(tableBlock.key, { data: newData });
    //     }
    //   }
    // });
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

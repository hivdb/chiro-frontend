import React from 'react';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import {Table, Button} from 'semantic-ui-react';
import style from './style.module.scss';
import ColumnDef from './column-def';

export {ColumnDef};


function getNextDirection(direction) {
  if (direction === null) {
    return 'ascending';
  }
  else if (direction === 'ascending') {
    return 'descending';
  }
  else {
    return null;
  }
}


function groupBySpanIndex(rows) {
  const groups = [];
  let prevRow;
  let prevGroup;
  for (const row of rows) {
    let curGroup;
    if (prevRow && prevRow._spanIndex === row._spanIndex) {
      prevGroup.push(row);
      curGroup = prevGroup;
    }
    else {
      curGroup = [row];
      groups.push(curGroup);
    }
    prevRow = row;
    prevGroup = curGroup;
  }
  return groups;
}


export default class ChiroTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string,
    columnDefs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      render: PropTypes.func.isRequired,
      sort: PropTypes.func.isRequired,
      sortable: PropTypes.bool.isRequired
    })),
    data: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ).isRequired,
    disableCopy: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    disableCopy: false,
  };

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
      sortedByColumn: null,
      sortedData: data,
      sortDirection: null
    };
    this.table = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {cacheKey, data} = this.props;
    if (prevProps.cacheKey !== cacheKey) {
      // cache key was updated
      this.setState({
        sortedByColumn: null,
        sortedData: data,
        sortDirection: null
      });
    }
  }

  handleSort(column, sortFunc) {
    if (sortFunc && typeof sortFunc !== 'function') {
      const sortKeys = sortFunc.map(key => `${column}.${key}`);
      sortFunc = value => sortBy(value, sortKeys);
    }
    return () => {
      let {sortedByColumn, sortDirection, sortedData} = this.state;

      if (column === sortedByColumn) {
        sortDirection = getNextDirection(sortDirection);
      }
      else {
        sortDirection = 'ascending';
      }
      sortedByColumn = column;

      if (sortDirection === null) {
        const {data} = this.props;
        sortedData = data;
      }
      else if (sortDirection === 'ascending') {
        sortedData = sortFunc(sortedData);
      }
      else { // descending
        sortedData = sortedData.reverse();
      }

      this.setState({
        sortedByColumn,
        sortedData,
        sortDirection
      });
    };
  }

  handleCopy() {
    const node = this.table.current.querySelector('table');
    let content = [];
    for (const row of node.rows) {
      let tr = [];
      for (const cell of row.cells) {
        tr.push(`"${cell.innerText.replace('"', '\\"')}"`);
      }
      content.push(tr.join('\t'));
    }
    content = content.join('\n');
    navigator.clipboard.writeText(content);
  }

  getRowSpanMatrix() {
    const {columnDefs} = this.props;
    const {sortedData} = this.state;
    const matrix = new Array(sortedData.length).fill(1).map(
      () => new Array(columnDefs.length).fill(1)
    );
    if (columnDefs.every(({multiCells}) => !multiCells)) {
      return matrix;
    }
    const groupedData = groupBySpanIndex(sortedData);
    let idx = 0;
    for (const group of groupedData) {
      const rowSpan = group.length;
      for (let jdx = 0; jdx < columnDefs.length; jdx ++) {
        if (columnDefs[jdx].multiCells) {
          continue;
        }
        matrix[idx][jdx] = rowSpan;
        for (let offset = 1; offset < rowSpan; offset ++) {
          matrix[idx + offset][jdx] = 0;
        }
      }
      idx += rowSpan;
    }
    return matrix;
  }

  render() {
    const {color, columnDefs} = this.props;
    const {sortedByColumn, sortedData, sortDirection} = this.state;
    const context = columnDefs.reduce((acc, {name}) => {
      acc[name] = {};
      return acc;
    }, {});
    const rowSpanMatrix = this.getRowSpanMatrix();

    const {disableCopy} = this.props;

    return <div ref={this.table} className={style['chiro-table-container']}>
      {disableCopy? null:
      <Button
       size="mini"
       floated='right'
       className={style['copy-button']}
       onClick={this.handleCopy.bind(this)}>
        Copy to clipboard
      </Button>
      }
      <Table
       color={color} sortable celled compact selectable
       className={style['chiro-table']}>
        <Table.Header>
          <Table.Row>
            {columnDefs.map(({name, label, sort, sortable}, idx) => (
              <Table.HeaderCell
               {...(sortable ? {
                 sorted: sortedByColumn === name ? sortDirection : null,
                 onClick: this.handleSort(name, sort)
               } : {})}
               textAlign="center"
               key={idx}>
                {label}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map((row, idx) => (
            <Table.Row verticalAlign="top" key={idx}>
              {columnDefs.map(({
                name, render, renderConfig,
                textAlign, label
              }, jdx) => (
                <Table.Cell
                 key={jdx}
                 className={rowSpanMatrix[idx][jdx] === 0 ? style.hide : null}
                 rowSpan={
                   rowSpanMatrix[idx][jdx] > 1 ?
                     rowSpanMatrix[idx][jdx] : null
                 }
                 {...(textAlign === 'justify' ?
                   {className: style.justify} :
                   {textAlign}
                 )}>
                  {rowSpanMatrix[idx][jdx] > 0 ?
                    <span className={style['cell-label']}>{label}</span>
                    : null}
                  <span className={style['cell-value']}>
                    {render(
                      nestedGet(row, name),
                      row,
                      context[name],
                      renderConfig
                    )}
                  </span>
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
    ;
  }
}

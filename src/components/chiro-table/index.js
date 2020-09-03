import React from 'react';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
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
        tr.push(`"${cell.innerText.replace('"', '\"')}"`);
      }
      content.push(tr.join('\t'));
    }
    content = content.join('\n');
    navigator.clipboard.writeText(content);
  }

  render() {
    const {color, columnDefs} = this.props;
    const {sortedByColumn, sortedData, sortDirection} = this.state;
    const context = columnDefs.reduce((acc, {name}) => {
      acc[name] = {};
      return acc;
    }, {});

    const {disableCopy} = this.props;

    return  <div ref={this.table} className={style['chiro-table-container']}>
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
              {columnDefs.map(({name, render, textAlign, label}, jdx) => (
                <Table.Cell
                 key={jdx}
                 {...(textAlign === 'justify' ?
                   {className: style.justify} :
                   {textAlign}
                 )}>
                  <span className={style['cell-label']}>{label}</span>
                  <span className={style['cell-value']}>
                    {render(nestedGet(row, name), row, context[name])}
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

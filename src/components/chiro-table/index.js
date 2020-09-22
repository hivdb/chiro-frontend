import React from 'react';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import {Table, Button, Menu} from 'semantic-ui-react';
import style from './style.module.scss';
import ColumnDef from './column-def';
import {dumpCSV, dumpTSV, dumpExcelSimple} from '../../utils/sheet-utils';

import {makeDownload} from 'sierra-frontend/dist/utils/download';

export {ColumnDef};

const OPT_CHANGE_EVENT = 'chirodefaulttabledownloadoptchanged';
const KEY_DEFAULT_DOWNLOAD_OPT = '--chiro-default-table-download-opt';
const DEFAULT_DOWNLOAD_OPT = 'copy-tsv';
const DOWNLOAD_OPTS = [
  'download-csv',
  'download-excel',
  'copy-tsv'
];


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
    sheetName: PropTypes.string.isRequired,
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
    tableScrollStyle: PropTypes.object.isRequired,
    tableStyle: PropTypes.object.isRequired,
    disableCopy: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    disableCopy: false,
    sheetName: 'Sheet1',
    tableScrollStyle: {},
    tableStyle: {}
  };

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
      sortedByColumn: null,
      sortedData: data,
      sortDirection: null,
      enableRowSpan: true,
      showOptMenu: false,
      defaultOpt: this.loadDefaultDownloadOption(),
      copying: false
    };
    this.table = React.createRef();
  }

  handleStorageChange = () => {
    const defaultOpt = this.loadDefaultDownloadOption();
    if (this.state.defaultOpt !== defaultOpt) {
      this.setState({defaultOpt});
    }
  }

  loadDefaultDownloadOption = () => {
    let opt = window.localStorage.getItem(KEY_DEFAULT_DOWNLOAD_OPT);
    if (!DOWNLOAD_OPTS.includes(opt)) {
      opt = DEFAULT_DOWNLOAD_OPT;
    }
    return opt;
  }
  
  saveDefaultDownloadOption = (opt) => {
    window.localStorage.setItem(KEY_DEFAULT_DOWNLOAD_OPT, opt);
    window.dispatchEvent(new Event(OPT_CHANGE_EVENT));
    this.setState({showOptMenu: false});
  }

  componentDidMount() {
    window.addEventListener(
      OPT_CHANGE_EVENT, this.handleStorageChange, false
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      OPT_CHANGE_EVENT, this.handleStorageChange, false
    );
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
        sortedData = sortFunc(sortedData, column);
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

  readTableData = () => {
    this.setState({
      copying: true,
      enableRowSpan: false
    });
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        const node = this.table.current.querySelector('table');
        let content = [];
        for (const row of node.rows) {
          let tr = [];
          for (const cell of row.cells) {
            tr.push(cell.innerText);
          }
          content.push(tr);
        }
        resolve(content);
        this.setState({
          copying: false,
          enableRowSpan: true
        });
      }, 300);
    });
    return promise;
  }

  handleCopy = async () => {
    const content = await this.readTableData();
    navigator.clipboard.writeText(dumpTSV(content));
    this.saveDefaultDownloadOption('copy-tsv');
  }

  handleDownloadCSV = async () => {
    const content = await this.readTableData();
    makeDownload(
      'datasheet.csv',
      'text/csv;charset=utf-8',
      dumpCSV(content, ',', true)
    );
    this.saveDefaultDownloadOption('download-csv');
  }

  handleDownloadExcel = async () => {
    const {sheetName} = this.props;
    const content = await this.readTableData();
    const xlsxBlob = dumpExcelSimple(
      content,
      sheetName
    );
    makeDownload(
      /* fileName=  */ 'datasheet.xlsx',
      /* mediaType= */ null,
      /* data=      */ xlsxBlob,
      /* isBlob=    */ true
    );
    this.saveDefaultDownloadOption('download-excel');
  }
  
  showDownloadOptMenu = () => {
    this.setState({showOptMenu: true});
  }

  hideDownloadOptMenu = (evt) => {
    setTimeout(() => this.setState({showOptMenu: false}), 10);
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
    const {color, columnDefs, tableScrollStyle, tableStyle} = this.props;
    const {
      sortedByColumn, sortedData,
      sortDirection, enableRowSpan,
      copying, showOptMenu,
      defaultOpt
    } = this.state;
    const context = columnDefs.reduce((acc, {name}) => {
      acc[name] = {};
      return acc;
    }, {});
    const rowSpanMatrix = this.getRowSpanMatrix();

    const {disableCopy} = this.props;

    return <div
     ref={this.table}
     data-copying={copying}
     className={style['chiro-table-container']}>
      <div className={style['chiro-table-scroll']} style={tableScrollStyle}>
        <Table
         style={tableStyle}
         color={color} sortable celled compact selectable
         className={style['chiro-table']}>
          <Table.Header>
            <Table.Row>
              {columnDefs.map(({
                name, label, sort, sortable, headCellStyle
              }, idx) => (
                <Table.HeaderCell
                 {...(sortable ? {
                   sorted: sortedByColumn === name ? sortDirection : null,
                   onClick: this.handleSort(name, sort)
                 } : {})}
                 textAlign="center"
                 style={headCellStyle}
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
                  textAlign, label, bodyCellStyle
                }, jdx) => (
                  <Table.Cell
                   key={jdx}
                   className={
                     enableRowSpan && rowSpanMatrix[idx][jdx] === 0 ?
                       style.hide : null
                   }
                   style={bodyCellStyle}
                   rowSpan={
                     enableRowSpan && rowSpanMatrix[idx][jdx] > 1 ?
                       rowSpanMatrix[idx][jdx] : null
                   }
                   {...(textAlign === 'justify' ?
                     {className: style.justify} :
                     {textAlign}
                   )}>
                    <span className={style['cell-label']}>{label}</span>
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
      {disableCopy ? null:
      <div
       className={style['download-button-group']}>
        <Button.Group size="mini">
          {defaultOpt === 'copy-tsv' ?
            <Button
             onClick={this.handleCopy}>
              Copy to clipboard
            </Button> : null}
          {defaultOpt === 'download-csv' ?
            <Button
             onClick={this.handleDownloadCSV}>
              Download CSV
            </Button> : null}
          {defaultOpt === 'download-excel' ?
            <Button
             onClick={this.handleDownloadExcel}>
              Download Excel
            </Button> : null}
          <Button
           color="grey"
           className={style['btn-more-option']}
           onFocus={this.showDownloadOptMenu}
           onBlur={this.hideDownloadOptMenu}
           icon={showOptMenu ? "caret up" : "caret down"}
           aria-label="More options" />
        </Button.Group>
        {showOptMenu ?
          <Menu
           inverted
           color="grey"
           vertical
           size="mini"
           className={style['option-menu']}>
            {defaultOpt !== 'copy-tsv' ?
              <Menu.Item
               name="copy-tsv"
               content="Copy to clipboard"
               onClick={this.handleCopy} /> : null}
            {defaultOpt !== 'download-csv' ?
              <Menu.Item
               name="download-csv"
               content="Download CSV"
               onClick={this.handleDownloadCSV} /> : null}
            {defaultOpt !== 'download-excel' ?
              <Menu.Item
               name="download-excel"
               content="Download Excel"
               onClick={this.handleDownloadExcel} /> : null}
          </Menu> : null}
      </div>}
    </div>
    ;
  }
}

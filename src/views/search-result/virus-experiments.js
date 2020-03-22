import React from 'react';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import startCase from 'lodash/startCase';
import {Table} from 'semantic-ui-react';

import {virusExperimentsShape} from './prop-types';

import style from './style.module.scss';


class ColDef {

  constructor(name, label, render, sort) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.render = render ? render : cellData => (
      (cellData === null || cellData === '') ? 'NA' : cellData
    );
    this.sort = sort ? sort : data => sortBy(data, [name]);
  }

}


function readableNum(num) {
  let prec = Math.max(Math.floor(Math.log10(num)) + 1, 2);
  return num.toPrecision(prec);
}


function renderXX50(num, cmp, unit) {
  if (num === null) {
    return 'NA';
  }
  num = readableNum(num);
  return <span className={style['nowrap']}>
    {cmp === '=' ? '' : cmp}{num} {unit}
  </span>;
}


function renderSI(num, cmp) {
  if (num === null) {
    return 'ND';
  }
  num = readableNum(num);
  return `${cmp === '=' ? '' : cmp}${num}`;
}


const tableColumns = [
  new ColDef(
    'articles', 'Author/Year',
    articles => articles.map(
      ({nickname}) => nickname.join('/')
    ).join('; ')
  ),
  new ColDef(
    'virusName', 'Virus Species',
    (virus, {strainName}) => strainName ? <>
      {virus}
      <div className={style['supplement-info']}>
        {strainName}
      </div>
    </> : virus,
  ),
  new ColDef('virusInput'),
  new ColDef('compoundObj.name', 'Compound'),
  new ColDef('compoundObj.target', 'Target'),
  new ColDef(
    'cellsObj.name', 'Cells',
    (name, {cellsObj: {fullName}}) => <>
      {name}
      {fullName ? <div className={style['supplement-info']}>
        {fullName}
      </div> : null}
    </>
  ),
  new ColDef('measurement'),
  new ColDef(
    'ec50', 'EC50',
    (ec50, {ec50cmp, ec50unit}) => renderXX50(ec50, ec50cmp, ec50unit),
    data => sortBy(data, ['ec50unit', 'ec50', 'ec50cmp'])
  ),
  new ColDef(
    'si', 'SI',
    (si, {sicmp}) => renderSI(si, sicmp),
    data => sortBy(data, ['sicmp', 'si'])
  )
];


function reformExpData(expData) {
  return expData.edges.map(({node}) => node);
}


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


export default class VirusExperiments extends React.Component {

  static propTypes = {
    data: virusExperimentsShape.isRequired
  }

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
      sortedByColumn: null,
      sortedData: reformExpData(data),
      sortDirection: null
    };
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
        sortedData = reformExpData(data);
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

  render() {
    const {sortedByColumn, sortedData, sortDirection} = this.state;

    return <Table basic="very" sortable celled compact selectable>
      <Table.Header>
        <Table.Row>
          {tableColumns.map(({name, label, sort}, idx) => (
            <Table.HeaderCell
             sorted={sortedByColumn === name ? sortDirection : null}
             onClick={this.handleSort(name, sort)}
             key={idx}>
              {label}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map((row, idx) => (
          <Table.Row key={idx}>
            {tableColumns.map(({name, render}, jdx) => (
              <Table.Cell key={jdx}>
                {render(nestedGet(row, name), row)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>;
  }

}

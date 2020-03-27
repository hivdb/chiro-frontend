import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import ExpTable from './exptable';
import {virusExperimentsShape} from './prop-types';
import {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef
} from './table-helper';


function renderSI(num, cmp) {
  if (num === null) {
    return 'ND';
  }
  num = readableNum(num);
  return `${cmp === '=' ? '' : cmp}${num}`;
}


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  new ColDef('moi.text', 'MOI', null, null, false),
  compoundColDef('Compound'),
  new ColDef(
    'drugTiming', 'Timing',
    value => (
      value && value.length > 0 ? <>
        {value.map(({text}) => text).join(' and ')} hr
      </> : 'NA'
    ),
    data => sortBy(data, [
      'drugTiming[0].lower',
      'drugTiming[0].upper']),
  ),
  new ColDef('cellsName', 'Cells'),
  new ColDef(
    'durationOfInfection.text', 'Infection Duration',
    value => value ? `${value} hr` : 'NA'
  ),
  new ColDef('measurement'),
  new ColDef(
    'ec50', 'EC50',
    (ec50, {ec50cmp, ec50unit, ec50inactive}) => (
      renderXX50(ec50, ec50cmp, ec50unit, ec50inactive)
    ),
    data => sortBy(data, ['ec50unit', 'ec50', 'ec50cmp', 'ec50inactive'])
  ),
  new ColDef(
    'si', 'SI',
    (si, {sicmp}) => renderSI(si, sicmp),
    data => sortBy(data, ['sicmp', 'si'])
  )
];


export default class VirusExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: virusExperimentsShape.isRequired
  }

  render() {
    const {cacheKey, data} = this.props;
    return (
      <ExpTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }

}

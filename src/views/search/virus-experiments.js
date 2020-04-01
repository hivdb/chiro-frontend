import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import ExpTable from './exptable';
import {virusExperimentsShape} from './prop-types';
import {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef,
  nameAndDescColDef
} from './table-helper';


function renderSI(num, cmp) {
  if (num === null) {
    return '-';
  }
  num = readableNum(num);
  return `${cmp === '=' ? '' : cmp}${num}`;
}


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  new ColDef({
    name: 'moi',
    label: 'MOI',
    render: (moi) => {
      if (!moi) {
        return '?';
      }
      const {mean, lower} = moi;
      return isNaN(mean) ? '?' : (
        Math.abs(mean - lower) < 1e-5 ?
          readableNum(mean) : `~${readableNum(mean)}`
      );
    },
    sortable: false
  }),
  compoundColDef('Compound'),
  new ColDef({
    name: 'drugTiming',
    label: 'Timing',
    render: value => (
      (value && value.length > 0) ? <>
        {value.map(({text}) => text).join(' and ')} hr
      </> : '?'
    ),
    sort: data => sortBy(data, [
      'drugTiming[0].lower',
      'drugTiming[0].upper']),
  }),
  nameAndDescColDef('cellsObj', 'Cells'),
  new ColDef({
    name: 'durationOfInfection.text',
    label: 'Culture',
    render: h => h ? `${h} hr` : '?'
  }),
  nameAndDescColDef('measurementObj', 'Measurement'),
  new ColDef({
    name: 'ec50',
    label: 'EC50 (\xb5M)',
    render: (ec50, {ec50cmp, ec50unit, ec50inactive}) => (
      renderXX50(ec50, ec50cmp, ec50unit, ec50inactive)
    ),
    sort: data => sortBy(
      data, ['ec50unit', 'ec50', 'ec50cmp', 'ec50inactive']
    )
  }),
  new ColDef({
    name: 'si',
    label: 'SI',
    render: (si, {sicmp}) => renderSI(si, sicmp),
    sort: data => sortBy(data, ['sicmp', 'si'])
  })
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

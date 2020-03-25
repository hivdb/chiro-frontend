import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import ExpTable from './exptable';
import {biochemExperimentsShape} from './prop-types';

import {
  ColDef, reformExpData, renderXX50,
  authorYearColDef, virusSpeciesDef,
  compoundColDef
} from './table-helper';


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  compoundColDef('Compound'),
  new ColDef('targetName', 'Target'),
  new ColDef(
    'ic50', 'IC50',
    (ic50, {ic50cmp, ic50unit, ic50inactive}) => (
      renderXX50(ic50, ic50cmp, ic50unit, ic50inactive)
    ),
    data => sortBy(data, ['ic50unit', 'ic50', 'ic50cmp', 'ic50inactive'])
  )
];


export default class BiochemExpTable extends React.Component {

  static propTypes = {
    compoundName: PropTypes.string,
    virusName: PropTypes.string,
    data: biochemExperimentsShape.isRequired
  }

  render() {
    const {compoundName, virusName, data} = this.props;
    return (
      <ExpTable
       cacheKey={`${compoundName}@@${virusName}`}
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }

}

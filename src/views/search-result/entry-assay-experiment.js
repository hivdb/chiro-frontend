import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import {entryAssayExperimentsShape} from './prop-types';
import ExpTable from './exptable';
import {
  compoundColDef, ColDef,
  reformExpData, authorYearColDef,
  virusSpeciesDef,
  renderXX50,
} from './table-helper';


const tableColumns = [
  authorYearColDef,
  virusSpeciesDef,
  compoundColDef('compound'),
  new ColDef('cellsName', 'Cells'),
  new ColDef('effectorCellsName', 'Effector Cells'),
  new ColDef('measurement'),
  new ColDef(
    'ec50', 'EC50',
    (ec50, {ec50cmp, ec50unit, ec50inactive}) => (
      renderXX50(ec50, ec50cmp, ec50unit, ec50inactive)
    ),
    data => sortBy(data, ['ec50unit', 'ec50', 'ec50cmp', 'ec50inactive'])
  )
];


export default class EntryAssayExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: entryAssayExperimentsShape.isRequired
  }

  render() {
    const {cacheKey, data} = this.props;
    return (
      <ExpTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data)}
      />
    );
  }
}
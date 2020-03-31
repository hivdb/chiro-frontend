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
  new ColDef({
    name: 'targetName',
    label: 'Target'
  }),
  new ColDef({
    name: 'ic50',
    label: 'IC50 (\xb5M)',
    render: (ic50, {ic50cmp, ic50unit, ic50inactive}) => (
      renderXX50(ic50, ic50cmp, ic50unit, ic50inactive)
    ),
    sort: data => sortBy(
      data, ['ic50unit', 'ic50', 'ic50cmp', 'ic50inactive']
    )
  })
];


export default class BiochemExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: biochemExperimentsShape.isRequired
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

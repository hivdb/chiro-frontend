import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import {Icon, Popup} from 'semantic-ui-react';

import SimpleTable from 'icosa/components/simple-table';
import {biochemExperimentsShape} from './prop-types';

import {
  ColDef, reformExpData, renderXX50,
  authorYearColDef, virusSpeciesDef,
  compoundColDef
} from './table-helper';
import style from './style.module.scss';


const tableColumns = [
  authorYearColDef,
  virusSpeciesDef,
  compoundColDef('Compound'),
  new ColDef({
    name: 'targetName',
    label: 'Target'
  }),
  new ColDef({
    name: 'ic50',
    label: (
      <Popup
       header={'IC50 (\xb5M)'}
       content={
         "Compound concentration required to inhibit the targeted " +
         "enzyme by 50%."}
       trigger={<span className={style['with-info']}>
         {'IC50 (\xb5M)'}<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: (ic50, {ic50cmp, ic50unit, ic50inactive}) => (
      renderXX50(ic50, ic50cmp, ic50unit, ic50inactive)
    ),
    sort: data => sortBy(data, ['ic50unit', 'ic50', 'ic50cmp', 'ic50inactive'])
  })
];


export default class BiochemExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: biochemExperimentsShape.isRequired
  };

  render() {
    const {cacheKey, data} = this.props;
    return (
      <SimpleTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }

}

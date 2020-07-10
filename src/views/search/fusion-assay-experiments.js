import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import {Icon, Popup} from 'semantic-ui-react';

import {fusionAssayExperimentsShape} from './prop-types';
import ChiroTable from '../../components/chiro-table';
import {
  compoundColDef, ColDef,
  reformExpData, authorYearColDef,
  virusSpeciesDef, nameAndDescColDef,
  renderXX50,
} from './table-helper';
import style from './style.module.scss';


const tableColumns = [
  authorYearColDef,
  virusSpeciesDef,
  compoundColDef('Compound'),
  nameAndDescColDef(
    'measurementObj',
    <Popup
     header="Method"
     content="The method by which virus replication is quantified."
     trigger={<span className={style['with-info']}>
       Method<sup><Icon name="info circle" /></sup>
     </span>} />,
  ),
  nameAndDescColDef('effectorCellsObj', 'Effector Cells', '-'),
  nameAndDescColDef('cellsObj', 'Target Cells'),
  new ColDef({
    name: 'ec50',
    label: (
      <Popup
       header={'EC50 (\xb5M)'}
       content={
         "The compound concentration required to inhibit virus " +
         "replication by 50%."}
       trigger={<span className={style['with-info']}>
         {'EC50 (\xb5M)'}<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: (ec50, {ec50cmp, ec50unit, ec50inactive}) => (
      renderXX50(ec50, ec50cmp, ec50unit, ec50inactive)
    ),
    sort: data => sortBy(
      data, ['ec50unit', 'ec50', 'ec50cmp', 'ec50inactive']
    )
  }),
];


export default class FusionAssayExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: fusionAssayExperimentsShape.isRequired
  }

  render() {
    const {cacheKey, data} = this.props;
    return (
      <ChiroTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data)}
      />
    );
  }
}

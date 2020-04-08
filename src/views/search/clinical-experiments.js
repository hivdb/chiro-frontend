import React from 'react';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';

import ChiroTable from '../../components/chiro-table';
import {clinicalExperimentsShape} from './prop-types';

import {
  ColDef, reformExpData,
  authorYearColDef, virusSpeciesDef,
} from './table-helper';


function attachedTextColDef(type) {
  return new ColDef({
    name: type,
    label: type,
    render: (_, {attachedTextObjs}) => {
      for (const one of attachedTextObjs) {
        if (one.type === type) {
          return one.content;
        }
      }
    },
    sortable: false,
    textAlign: 'justify'
  });
}


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  new ColDef({name: 'regimenDetail', label: 'Regimen'}),
  new ColDef({name: 'studyTypeName', label: 'Study Type'}),
  new ColDef({name: 'numSubjects', label: '#'}),
  attachedTextColDef('Population description'),
  attachedTextColDef('Findings'),
];


export default class ClinicalExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: clinicalExperimentsShape.isRequired
  }

  render() {
    const {cacheKey, data} = this.props;
    return (
      <ChiroTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data, data => orderBy(
         data, [r => r.studyTypeOrdinal, r => r.numSubjects],
         ['asc', 'desc']
       ))} />
    );
  }

}

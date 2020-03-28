import React from 'react';
import PropTypes from 'prop-types';

import ExpTable from './exptable';
import {clinicalExperimentsShape} from './prop-types';

import {
  ColDef, reformExpData,
  authorYearColDef, virusSpeciesDef,
} from './table-helper';


function attachedTextColDef(type) {
  return new ColDef(
    type, type,
    (_, {attachedTextObjs}) => {
      for (const one of attachedTextObjs) {
        if (one.type === type) {
          return one.content;
        }
      }
    }, null, false);
}


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  new ColDef('regimenDetail', 'Regimen'),
  new ColDef('studyType'),
  new ColDef('numSubjects', '# Subjects'),
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
      <ExpTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }

}

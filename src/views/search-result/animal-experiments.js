import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import arrayFind from 'lodash/find';

import ExpTable from './exptable';
import {animalExperimentsShape} from './prop-types';

import {
  ColDef, reformExpData,
  authorYearColDef, virusSpeciesDef,
  compoundColDef
} from './table-helper';


const inoculationMap = {
  PROPHYLACTIC: 'Prophylactic',
  THERAPEUTIC: 'Therapeutic'
};

const symbols = {
  'SIG_REDUCE': '↓↓↓',
  'REDUCE': '↓',
  'SIG_INCREASE': '↑↑↑',
  'INCREASE': '↑',
  'NO_CHANGE': '≈'
};

const colors = [
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
  'grey',
  'black',
];

const tableColumns = [
  authorYearColDef,
  new ColDef('animalModelName', 'Host'),
  virusSpeciesDef,
  new ColDef('inoculation', null, null, null, false),
  compoundColDef('Regimen'),
  new ColDef(
    'treatmentType', null, t => inoculationMap[t]),
  new ColDef('numSubjects', null, null, null, false),
  new ColDef('numControls', null, null, null, false),
  new ColDef('dose', null, null, null, false),
  new ColDef('treatmentTime', null, null, null, false)
];


function resultColDefs(rows) {
  const colDefs = {};
  for (const {resultObjs} of rows) {
    for (const {resultName} of resultObjs) {
      if (resultName in colDefs) {
        continue;
      }
      colDefs[resultName] = new ColDef(
        resultName, resultName,
        (_, {resultObjs}) => {
          const resultObj = arrayFind(
            resultObjs,
            r => r.resultName === resultName);
          if (resultObj) {
            return symbols[resultObj.result];
          }
          else {
            return 'NA';
          }
        }, null, false
      );
    }
  }
  return Object.values(colDefs);
}


export default class AnimalExpTable extends React.Component {

  static propTypes = {
    compoundName: PropTypes.string,
    virusName: PropTypes.string,
    data: animalExperimentsShape.isRequired
  }

  render() {
    const {compoundName, virusName, data} = this.props;
    return Object.entries(
      groupBy(
        reformExpData(data),
        row => (
          row.articles
            .map(({nickname}) => nickname)
            .join('$$$')
        )
      )
    ).map(([aname, articleData], idx) => (
      <ExpTable
       key={idx}
       color={colors[idx % colors.length]}
       cacheKey={`${compoundName}@@${virusName}@@${aname}`}
       columnDefs={[...tableColumns, ...resultColDefs(articleData)]}
       data={articleData} />
    ));
  }

}

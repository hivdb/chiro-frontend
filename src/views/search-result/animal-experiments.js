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


const treatmentTypeMap = {
  PROPHYLACTIC: 'Pre',
  THERAPEUTIC: 'Post'
};

const symbols = {
  'SIG_REDUCE': '↓↓↓',
  'REDUCE': '↓',
  'SIG_INCREASE': '↑↑↑',
  'INCREASE': '↑',
  'NO_CHANGE': '<=>'
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

const rxTimePattern = /-?(\d+)([dh]pi)/;

const tableColumns = [
  authorYearColDef,
  new ColDef('animalModelName', 'Host'),
  virusSpeciesDef,
  new ColDef('inoculation', null, null, null, false),
  compoundColDef('Drug(s)'),
  new ColDef('dose', 'Dosage', null, null, false),
  new ColDef('treatmentTime', 'Start',
    (ts, {treatmentType: tt}) => {
      tt = treatmentTypeMap[tt];
      if (rxTimePattern.test(ts)) {
        const match = rxTimePattern.exec(ts);
        let [, num, unit] = match;
        num = parseInt(num);
        unit = {'dpi': 'day', 'hpi': 'hour'}[unit.toLocaleLowerCase()];
        return `${tt} (${num} ${unit})`;
      }
      return tt;
    },
    null, false
  ),
  new ColDef(
    'numSubjects',
    <># Subjects / # Controls</>,
    (ns, {numControls: nc}) => `${ns} / ${nc}`,
    null, false)
];


function resultColDefs(rows) {
  const colDefs = {};
  const displayResultNames = {
    'Lung VL': true,
    'Weight Loss': true,
    'Mortality': true,
    'Lung pathology': true,
    'Clinical Diseases': true
  };
  for (const {resultObjs} of rows) {
    for (const {resultName} of resultObjs) {
      if (resultName in colDefs) {
        continue;
      }
      if (!(resultName in displayResultNames)) {
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

import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import arrayFind from 'lodash/find';
import {Popup, Icon} from 'semantic-ui-react';

import ChiroTable from '../../components/chiro-table';
import {animalExperimentsShape} from './prop-types';
import style from './style.module.scss';

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

const rxTimePattern = /-?(\d+)\s*((?:d|h|minute-)pi)/;

const tableColumns = [
  authorYearColDef,
  new ColDef({name: 'animalModelName', label: 'Host'}),
  virusSpeciesDef,
  new ColDef({name: 'inoculation', label: 'Inoculum', sortable: false}),
  compoundColDef('Drug(s)'),
  new ColDef({name: 'dose', label: 'Dosage', sortable: false}),
  new ColDef({
    name: 'treatmentTime',
    label: 'Start',
    render: (ts, {treatmentType: tt}) => {
      tt = treatmentTypeMap[tt];
      if (rxTimePattern.test(ts)) {
        const match = rxTimePattern.exec(ts);
        let [, num, unit] = match;
        num = parseInt(num);
        unit = {
          'dpi': 'day',
          'hpi': 'hour',
          'minute-pi': 'minute',
        }[unit.toLocaleLowerCase()];
        return `${tt} (${num} ${unit})`;
      }
      return tt;
    },
    sortable: false
  }),
  new ColDef({
    name: 'numSubjects',
    label: <># Subjects /<br /># Controls</>,
    render: (ns, {numControls: nc}) => ns === null || nc === null ?
      `${ns === null ? '?' : ns} / ${nc === null ? '?' : nc}` :
      '?',
    sortable: false
  })
];


function resultColDefs(rows) {
  const colDefs = {};
  const displayResultNames = {
    'Lung VL': 'Lung VL',
    'Weight Loss': <>Weight<br />Loss</>,
    'Mortality': 'Mortality',
    'Lung pathology': <>Lung<br />pathology</>,
    'Clinical Diseases': <>Clinical<br />Diseases</>,
    'Xenograft VL': <>Xenograft VL</>
  };

  for (const key in displayResultNames) {
    displayResultNames[key] = (
      <Popup
       header={key}
       content={<ul className={style['result-col-popup']}>
         <li>↓, ↓↓↓ decreased; </li>
         <li>↑, ↑↑↑ increased; </li>
         <li>
           {'<=>'} no discernable difference;{' '}
         </li>
         <li>ND not done; </li>
         <li>? could not determine</li>
       </ul>}
       trigger={<span className={style['with-info']}>
         {displayResultNames[key]}<sup><Icon name="info circle" /></sup>
       </span>} />
    );
  }

  for (const {resultObjs} of rows) {
    for (const {resultName} of resultObjs) {
      if (resultName in colDefs) {
        continue;
      }
      if (!(resultName in displayResultNames)) {
        continue;
      }
      colDefs[resultName] = new ColDef({
        name: resultName,
        label: displayResultNames[resultName],
        render: (_, {resultObjs}) => {
          const resultObj = arrayFind(
            resultObjs,
            r => r.resultName === resultName);
          if (resultObj) {
            return symbols[resultObj.result];
          }
          else {
            return resultName === 'Mortality' ? 'ND' : '?';
          }
        },
        sortable: false
      });
    }
  }
  return Object.values(colDefs);
}


export default class AnimalExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: animalExperimentsShape.isRequired
  }

  render() {
    const {cacheKey, data} = this.props;
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
      <ChiroTable
       key={idx}
       color={colors[idx % colors.length]}
       cacheKey={cacheKey}
       columnDefs={[...tableColumns, ...resultColDefs(articleData)]}
       data={articleData}
       disableCopy={true}
       />
    ));
  }

}

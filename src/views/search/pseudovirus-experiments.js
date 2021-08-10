import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import {Header, Icon, Popup} from 'semantic-ui-react';

import SimpleTable from 'sierra-frontend/dist/components/simple-table';
import isTargetMAb from '../../utils/is-target-mab';
import {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef,
  nameAndDescColDef
} from './table-helper';
import style from './style.module.scss';


function renderSI(num, cmp) {
  if (num === null) {
    return '-';
  }
  num = readableNum(num);
  return `${cmp === '=' ? '' : cmp}${num}`;
}


const tableColumns = [
  authorYearColDef,
  virusSpeciesDef,
  new ColDef({
    name: 'moi',
    label: (
      <Popup
       header="MOI"
       content="Multiplicity of infection: # viruses / # cells."
       trigger={<span className={style['with-info']}>
         MOI<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: (moi) => {
      if (!moi) {
        return '?';
      }
      const {mean, lower} = moi;
      return isNaN(mean) ? '?' : (
        Math.abs(mean - lower) < 1e-5 ?
          readableNum(mean) : `~${readableNum(mean)}`
      );
    },
    sortable: false
  }),
  compoundColDef('Compound'),
  new ColDef({
    name: 'drugTiming',
    label: (
      <Popup
       header="Timing"
       content={
         "Time of addition of compound to cell culture - time of " +
         "addition of virus to to cell culture. Positive values " +
           "indicate that the compound was added following viral infection."}
       trigger={<span className={style['with-info']}>
         Timing<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: value => (
      (value && value.length > 0) ? <>
        {value.map(({text}) => text).join(' and ')} hr
      </> : '?'
    ),
    sort: data => sortBy(data, [
      'drugTiming[0].lower',
      'drugTiming[0].upper'
    ])
  }),
  nameAndDescColDef(
    'cellsObj',
    <Popup
     hoverable
     header="Cells"
     content={<>
       A description of each cell line can be found on the{' '}
       <Link to="/cells-list/">Cells page</Link>.
     </>}
     trigger={<span className={style['with-info']}>
       Cells<sup><Icon name="info circle" /></sup>
     </span>} />
  ),
  new ColDef({
    name: 'numberOfCells',
    label: 'Number of cells',
    render: (num) => {
      if (!num) {
        return '?';
      }
      const {mean, lower} = num;
      return isNaN(mean) ? '?' : (
        Math.abs(mean - lower) < 1e-5 ?
          readableNum(mean) : `~${readableNum(mean)}`
      );
    },
    sortable: false
  }),
  new ColDef({
    name: 'durationOfInfection.text',
    label: (
      <Popup
       header="Culture"
       content="Duration of culture."
       trigger={<span className={style['with-info']}>
         Culture<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: h => h ? `${h} hr` : '?'
  }),
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
    sort: data => sortBy(data, ['ec50unit', 'ec50', 'ec50cmp', 'ec50inactive'])
  }),
  new ColDef({
    name: 'si',
    label: (
      <Popup
       header="Selectivity index"
       content="Compound concentration toxic to cells (CC50) /  EC50."
       trigger={<span className={style['with-info']}>
         SI<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: (si, {sicmp}) => renderSI(si, sicmp),
    sort: data => sortBy(data, ['sicmp', 'si'])
  })
];

const tableColumnsMAb = [
  ...tableColumns.slice(0, tableColumns.length - 2),
  new ColDef({
    name: 'ec50',
    label: (
      <Popup
       header={'EC50 (ng/ml)'}
       content={
         "The compound concentration required to inhibit virus " +
         "replication by 50%."}
       trigger={<span className={style['with-info']}>
         {'EC50 (ng/ml)'}<sup><Icon name="info circle" /></sup>
       </span>} />
    ),
    render: (ec50, {ec50cmp, ec50unit, ec50inactive}) => (
      renderXX50(
        ec50,
        ec50cmp,
        ec50unit,
        ec50inactive,
        'ng/ml',
        '-',
        {'\xb5M-to-ng/ml': num => num * 150000}
      )
    ),
    sort: data => sortBy(data, [
      ({ec50unit}) => (
        ec50unit === '\xb5M' ?
          'ng/ml' : ec50unit
      ),
      ({ec50, ec50unit}) => (
        ec50unit === '\xb5M' ?
          ec50 * 150000 : ec50
      ),
      'ec50cmp',
      'ec50inactive'
    ])
  })
];


export default class PseudovirusExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: PropTypes.object
  }

  render() {
    const {cacheKey, data} = this.props;
    const reformed = reformExpData(data);
    const vData = (
      reformed.filter(({compoundObjs}) => (
        compoundObjs.some(({target}) => !isTargetMAb(target))
      ))
    );
    const mabData = (
      reformed.filter(({compoundObjs}) => (
        compoundObjs.some(({target}) => isTargetMAb(target))
      ))
    );
    return <>
      {vData.length > 0 ?
        <SimpleTable
         cacheKey={cacheKey}
         columnDefs={tableColumns}
         data={vData} /> : null}
      {mabData.length > 0 ? <>
        <Header as="h3" id="monoclonal-antibodies-pseudovirus">
          Monoclonal antibodies
        </Header>
        <SimpleTable
         cacheKey={cacheKey}
         columnDefs={tableColumnsMAb}
         data={mabData} />
      </> : null}
    </>;
  }

}

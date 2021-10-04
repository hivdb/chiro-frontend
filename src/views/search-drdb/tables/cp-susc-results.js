import useRenderSuscResults from './use-render-susc-results';
import colDefStyle from './column-defs/style.module.scss';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';
import style from '../style.module.scss';

const subfilterOptions = {
  infectedVarName: [
    {
      action: 'infected',
      value: 'no',
      label: 'None',
      descAdd: <>
        List results of samples from <strong>uninfected</strong> persons
      </>,
      predicate: r => r.infectedVarName === null
    },
    {
      action: 'infected',
      value: 'yes',
      label: 'Infected',
      descAdd: <>
        List results of samples from <strong>infected</strong> persons
      </>,
      predicate: r => r.infectedVarName !== null
    }
  ],
  timingRange: [
    {
      action: 'month',
      value: '1',
      descAdd: <>
        List results of samples collected{' '}
        <strong>up to 1 month</strong> after symptom onset
      </>,
      predicate: r => r.timingRange === '1'
    },
    {
      action: 'month',
      value: '2-6',
      descAdd: <>
        List results of samples collected{' '}
        <strong>between 2 to 6 months</strong> after symptom onset
      </>,
      predicate: r => r.timingRange === '2-6'
    },
    {
      action: 'month',
      value: '≥6',
      descAdd: <>
        List results of samples collected{' '}
        <strong>more than 6 months</strong> after symptom onset
      </>,
      predicate: r => r.timingRange === '≥6'
    }
  ]
};

const allTableConfig = {
  indivMut: {
    columns: [
      'refName',
      'assayName',
      'section',
      'infectedVarName',
      'timingRange',
      'subjectSpecies',
      // 'severity',
      'controlVarName',
      'isoAggkey',
      'numStudies',
      'cumulativeCount',
      'potency',
      'fold',
      'dataAvailability'
    ],
    labels: {
      isoAggkey: 'Mutation',
      timingRange: 'Months',
      potency: <>
        NT50 Dilution{' '}
        <span className={style['nowrap']}>
          GeoMean
          <span className={colDefStyle['mul-div-sign']}>
            ×÷
          </span>GSD
        </span>
      </>,
      fold: <>
        Fold Reduction{' '}
        <span className={style['nowrap']}>
          Median (IQR)
        </span>
      </>
    },
    rawDataLabels: {
      isoAggkey: 'Mutation',
      timingRange: 'Months',
      potency: 'NT50 Dilution',
      fold: 'Fold Reduction'
    },
    groupBy: [
      'refName',
      'assayName',
      'infectedVarName',
      'timingRange',
      'subjectSpecies',
      'controlVarName',
      'isoAggkey',
      'numMutations',
      'rxType'
    ],
    defaultGroupBy: [
      'refName',
      'assayName',
      'infectedVarName',
      'timingRange',
      'controlVarName',
      'isoAggkey',
      'numMutations',
      'rxType'
    ],
    subfilterOptions
  },
  comboMuts: {
    columns: [
      'refName',
      'assayName',
      'section',
      'infectedVarName',
      'timingRange',
      'subjectSpecies',
      // 'severity',
      'controlVarName',
      'varNameOrIsoAggkey',
      'numStudies',
      'cumulativeCount',
      'potency',
      'fold',
      'dataAvailability'
    ],
    labels: {
      varNameOrIsoAggkey: 'Variant',
      timingRange: 'Months',
      potency: <>
        NT50 Dilution{' '}
        <span className={style['nowrap']}>
          GeoMean
          <span className={colDefStyle['mul-div-sign']}>
            ×÷
          </span>GSD
        </span>
      </>,
      fold: <>
        Fold Reduction{' '}
        <span className={style['nowrap']}>
          Median (IQR)
        </span>
      </>
    },
    rawDataLabels: {
      varNameOrIsoAggkey: 'Variant',
      timingRange: 'Months',
      potency: 'NT50 Dilution',
      fold: 'Fold Reduction'
    },
    groupBy: [
      'refName',
      'assayName',
      'infectedVarName',
      'timingRange',
      'subjectSpecies',
      // 'severity',
      'controlVarName',
      'varNameOrIsoAggkey',
      'rxType'
    ],
    defaultGroupBy: [
      'refName',
      'assayName',
      'infectedVarName',
      'timingRange',
      'controlVarName',
      'varNameOrIsoAggkey',
      'rxType'
    ],
    subfilterOptions
  }
};


export default function CPSuscResults() {
  const {
    params: {
      refName,
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, varName, isoAggkey});

  const {suscResults, isPending} = SuscResults.useCP();

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'cp-susc-results',
    cacheKey,
    suscResults,
    allTableConfig,
    hideNN: true,
    hideNon50: true,
    footnoteMean: true
  });
}

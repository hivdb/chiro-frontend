import useRenderSuscResults from './use-render-susc-results';
import colDefStyle from './column-defs/style.module.scss';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';
import style from '../style.module.scss';

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
    ]
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
      'isoAggkey',
      'numStudies',
      'cumulativeCount',
      'potency',
      'fold',
      'dataAvailability'
    ],
    labels: {
      isoAggkey: 'Variant',
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
      isoAggkey: 'Variant',
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
    ]
  }
};


export default function CPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey});

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

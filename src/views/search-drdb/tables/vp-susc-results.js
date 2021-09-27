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
      'vaccineName',
      'dosage',
      'timingRange',
      'subjectSpecies',
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
      infectedVarName: 'Pre-vaccine Infection',
      dosage: '# Shots',
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
      infectedVarName: 'Pre-vaccine Infection',
      dosage: '# Shots',
      timingRange: 'Months',
      potency: 'NT50 Dilution',
      fold: 'Fold Reduction'
    },
    groupBy: [
      'refName',
      'assayName',
      'infectedVarName',
      'vaccineName',
      'dosage',
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
      'vaccineName',
      'dosage',
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
      'vaccineName',
      'dosage',
      'timingRange',
      'subjectSpecies',
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
      infectedVarName: 'Pre-vaccine Infection',
      dosage: '# Shots',
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
      infectedVarName: 'Pre-vaccine Infection',
      dosage: '# Shots',
      timingRange: 'Months',
      potency: 'NT50 Dilution',
      fold: 'Fold Reduction'
    },
    groupBy: [
      'refName',
      'assayName',
      'infectedVarName',
      'vaccineName',
      'dosage',
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
      'vaccineName',
      'dosage',
      'timingRange',
      'controlVarName',
      'isoAggkey',
      'numMutations',
      'rxType'
    ]
  }
};


export default function VPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      vaccineName
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, vaccineName});
  const {suscResults, isPending} = SuscResults.useVP();

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'vp-susc-results',
    cacheKey,
    suscResults,
    allTableConfig,
    hideNN: true,
    footnoteMean: true
  });
}

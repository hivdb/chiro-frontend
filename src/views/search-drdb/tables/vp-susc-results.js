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
      </>
    },
    {
      action: 'infected',
      value: 'yes',
      label: 'Infected',
      descAdd: <>
        List results of samples from <strong>infected</strong> persons
      </>
    }
  ],
  dosage: [
    {
      action: 'dosage',
      value: '1',
      descAdd: <>
        List results of samples from persons
        received <strong>one vaccine dose</strong>
      </>
    },
    {
      action: 'dosage',
      value: '2',
      descAdd: <>
        List results of samples from persons
        received <strong>two vaccine doses</strong>
      </>
    },
    {
      action: 'dosage',
      value: '3',
      descAdd: <>
        List results of samples from persons
        received <strong>three vaccine doses</strong>
      </>
    }
  ],
  timingRange: [
    {
      action: 'month',
      value: '1',
      descAdd: <>
        List results of samples collected{' '}
        <strong>up to 1 month</strong> after last vaccination
      </>
    },
    {
      action: 'month',
      value: '2-6',
      descAdd: <>
        List results of samples collected{' '}
        <strong>between 2 to 6 months</strong> after last vaccination
      </>
    },
    {
      action: 'month',
      value: '≥6',
      descAdd: <>
        List results of samples collected{' '}
        <strong>more than 6 months</strong> after last vaccination
      </>
    }
  ],
  subjectSpecies: [
    {
      action: 'host',
      value: 'human',
      descAdd: <>
        List results of <strong>human</strong> samples
      </>
    },
    {
      action: 'host',
      value: 'animal',
      descAdd: <>
        List results of <strong>animal model</strong> samples
      </>
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
    ],
    subfilterOptions
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
      'varNameOrIsoAggkey',
      'numStudies',
      'cumulativeCount',
      'potency',
      'fold',
      'dataAvailability'
    ],
    labels: {
      varNameOrIsoAggkey: 'Variant',
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
      varNameOrIsoAggkey: 'Variant',
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
      'varNameOrIsoAggkey',
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
      'varNameOrIsoAggkey',
      'rxType'
    ],
    subfilterOptions
  }
};


export default function VPSuscResults() {
  const {
    params: {
      refName,
      varName,
      isoAggkey,
      vaccineName
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, varName, isoAggkey, vaccineName});
  const {suscResults, isPending} = SuscResults.useVP();

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'vp-susc-results',
    cacheKey,
    suscResults,
    allTableConfig,
    hideNN: true,
    hideNon50: true,
    footnoteMean: true
  });
}

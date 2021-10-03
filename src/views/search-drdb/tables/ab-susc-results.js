import useRenderSuscResults from './use-render-susc-results';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';

const allTableConfig = {
  indivMut: {
    columns: [
      'refName',
      'assayName',
      'section',
      'abNames',
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
      potency: 'IC50 (ng/ml)',
      fold: 'Fold Reduction'
    },
    groupBy: [
      'refName',
      'assayName',
      'abNames',
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
      'abNames',
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
      potency: 'IC50 (ng/ml)',
      fold: 'Fold Reduction'
    },
    groupBy: [
      'refName',
      'assayName',
      'abNames',
      'controlVarName',
      'varNameOrIsoAggkey',
      'rxType'
    ]
  }
};


export default function AbSuscResults() {
  const {
    params: {
      refName,
      varName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, varName, isoAggkey, abNames});

  const {suscResults, isPending} = SuscResults.useAb();

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'mab-susc-results',
    cacheKey,
    hideNN: true,
    hideNon50: true,
    suscResults,
    allTableConfig
  });
}

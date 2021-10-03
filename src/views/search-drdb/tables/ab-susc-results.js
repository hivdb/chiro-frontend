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
      'isoAggkey',
      'numStudies',
      'cumulativeCount',
      'potency',
      'fold',
      'dataAvailability'
    ],
    labels: {
      isoAggkey: 'Variant',
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
  }
};


export default function AbSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, abNames});

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

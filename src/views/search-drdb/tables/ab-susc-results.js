import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import {useAbSuscResults} from '../hooks';
import LocationParams from '../hooks/location-params';


export default function AbSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, abNames});

  const {suscResults, isPending} = useAbSuscResults();

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'abNames',
      'controlIsoName',
      'isoName',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      potency: 'IC50 (ng/ml)',
      fold: 'Fold Reduction'

    }
  });
  const indivMutAggFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'abNames',
      'controlIsoName',
      'isoName',
      'cumulativeCount',
      'potency',
      'fold',
    ],
    labels: {
      isoName: 'Mutation',
      potency: 'Mean/Median IC50 (ng/ml)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'abNames',
      'controlIsoName',
      'isoName',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      potency: 'IC50 (ng/ml)',
      fold: 'Fold Reduction'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'controlIsoName',
      'abNames',
      'controlIsoName',
      'isoName',
      'cumulativeCount',
      'potency',
      'fold',
    ],
    labels: {
      isoName: 'Variant',
      potency: 'Mean/Median IC50 (ng/ml)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'mab-susc-results',
    cacheKey,
    hideNN: true,
    suscResults,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

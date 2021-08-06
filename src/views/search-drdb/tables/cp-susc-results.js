import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import {useCPSuscResults} from '../hooks';
import LocationParams from '../hooks/location-params';


export default function CPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey});

  const {suscResults, isPending} = useCPSuscResults();

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'infectedIsoName',
      'timing',
      // 'severity',
      'controlIsoName',
      'isoName',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      timing: 'Months',
      potency: 'NT50 (Dilution)',
      fold: 'Fold Reduction'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'infectedIsoName',
      'timing',
      // 'severity',
      'controlIsoName',
      'isoName',
      'cumulativeCount',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      timing: 'Months',
      potency: 'Mean/Median NT50 (Dilution)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'infectedIsoName',
      'timing',
      // 'severity',
      'controlIsoName',
      'isoName',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      timing: 'Months',
      potency: 'NT50 (Dilution)',
      fold: 'Fold Reduction'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    columns: [
      'refName',
      'assayName',
      'section',
      'infectedIsoName',
      'timing',
      // 'severity',
      'controlIsoName',
      'isoName',
      'cumulativeCount',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      timing: 'Months',
      potency: 'Mean/Median NT50 (Dilution)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'cp-susc-results',
    cacheKey,
    suscResults,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function AbSuscResults({
  loaded,
  cacheKey,
  isolateLookup,
  abSuscResults
}) {

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    isolateLookup,
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
    isolateLookup,
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
    isolateLookup,
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
    isolateLookup,
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
    loaded,
    id: 'mab-susc-results',
    cacheKey,
    hideNN: true,
    suscResults: abSuscResults,
    isolateLookup,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

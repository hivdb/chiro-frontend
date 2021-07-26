import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function CPSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  isolateLookup,
  cpSuscResults
}) {

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
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
      potency: 'Potency (NT50)'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
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
      potency: 'Mean/Median Potency (NT50)',
      fold: 'Mean/Median Fold'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
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
      potency: 'Potency (NT50)'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
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
      potency: 'Mean/Median Potency (NT50)',
      fold: 'Mean/Median Fold'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'cp-susc-results',
    cacheKey,
    suscResults: cpSuscResults,
    isolateLookup,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

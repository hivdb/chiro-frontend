import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function CPSuscResults({
  loaded,
  cacheKey,
  isolateLookup,
  cpSuscResults
}) {

  const indivMutIndivFoldColumnDefs = useColumnDefs({
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
      potency: 'NT50 (Dilution)',
      fold: 'Fold Reduction'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
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
      potency: 'Mean/Median NT50 (Dilution)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
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
      potency: 'NT50 (Dilution)',
      fold: 'Fold Reduction'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
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
      potency: 'Mean/Median NT50 (Dilution)',
      fold: 'Mean/Median Fold Reduction'
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

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
      'section',
      // 'controlIsoName',
      'isoName',
      'infectedIsoName',
      'timing',
      'severity',
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      timing: '# Months'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      // 'controlIsoName',
      'isoName',
      'infectedIsoName',
      'timing',
      'severity',
      'fold',
      'cumulativeCount'
    ],
    labels: {
      isoName: 'Mutation',
      timing: '# Months'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      // 'controlIsoName',
      'isoName',
      'infectedIsoName',
      'timing',
      'severity',
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      timing: '# Months'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      // 'controlIsoName',
      'isoName',
      'infectedIsoName',
      'timing',
      'severity',
      'fold',
      'cumulativeCount'
    ],
    labels: {
      isoName: 'Variant',
      timing: '# Months'
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

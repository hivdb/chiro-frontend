import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function AbSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  antibodyLookup,
  isolateLookup,
  abSuscResults
}) {

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'isoName',
      'abNames',
      'controlIsoName',
      'fold'
    ],
    labels: {
      isoName: 'Mutation'
    }
  });
  const indivMutAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'isoName',
      'abNames',
      'controlIsoName',
      'cumulativeCount',
      'fold',
    ],
    labels: {
      isoName: 'Mutation',
      fold: 'Mean/Median Fold'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'isoName',
      'abNames',
      'controlIsoName',
      'fold'
    ],
    labels: {
      isoName: 'Variant'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'controlIsoName',
      'isoName',
      'abNames',
      'controlIsoName',
      'cumulativeCount',
      'fold',
    ],
    labels: {
      isoName: 'Variant',
      fold: 'Mean/Median Fold'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'mab-susc-results',
    cacheKey,
    suscResults: abSuscResults,
    isolateLookup,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

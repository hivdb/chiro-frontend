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
      'controlIsoName',
      'isoName',
      'abNames',
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
      'controlIsoName',
      'isoName',
      'abNames',
      'fold',
      'cumulativeCount'
    ],
    labels: {
      isoName: 'Mutation'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'controlIsoName',
      'isoName',
      'abNames',
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
      'fold',
      'cumulativeCount'
    ],
    labels: {
      isoName: 'Variant'
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

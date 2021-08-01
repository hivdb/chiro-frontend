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
      potency: 'Potency (IC50)',
      fold: 'Fold Reduction'

    }
  });
  const indivMutAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
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
      potency: 'Mean/Median Potency (IC50)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
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
      potency: 'Potency (IC50)',
      fold: 'Fold Reduction'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    antibodyLookup,
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
      potency: 'Mean/Median Potency (IC50)',
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

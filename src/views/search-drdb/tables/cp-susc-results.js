import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function CPSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  variantLookup,
  cpSuscResults
}) {

  const indivMutColumnDefs = useColumnDefs({
    articleLookup,
    variantLookup,
    columns: [
      'refName',
      'section',
      // 'controlVariantName',
      'variantName',
      'infection',
      'timing',
      'severity',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      variantName: 'Mutation'
    }
  });

  const comboMutsColumnDefs = useColumnDefs({
    articleLookup,
    variantLookup,
    columns: [
      'refName',
      'section',
      // 'controlVariantName',
      'variantName',
      'infection',
      'timing',
      'severity',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      variantName: 'Variant'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'cp-susc-results',
    cacheKey,
    suscResults: cpSuscResults,
    variantLookup,
    indivMutColumnDefs,
    comboMutsColumnDefs
  });
}

import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function CPSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  isolateLookup,
  cpSuscResults
}) {

  const indivMutColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      // 'controlIsoName',
      'isoName',
      'infection',
      'timing',
      'severity',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      isoName: 'Mutation'
    }
  });

  const comboMutsColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      // 'controlIsoName',
      'isoName',
      'infection',
      'timing',
      'severity',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      isoName: 'Variant'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'cp-susc-results',
    cacheKey,
    suscResults: cpSuscResults,
    isolateLookup,
    indivMutColumnDefs,
    comboMutsColumnDefs
  });
}

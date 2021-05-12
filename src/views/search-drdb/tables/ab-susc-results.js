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

  const indivMutColumnDefs = useColumnDefs({
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

  const comboMutsColumnDefs = useColumnDefs({
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

  return useRenderSuscResults({
    loaded,
    id: 'mab-susc-results',
    cacheKey,
    suscResults: abSuscResults,
    isolateLookup,
    indivMutColumnDefs,
    comboMutsColumnDefs
  });
}

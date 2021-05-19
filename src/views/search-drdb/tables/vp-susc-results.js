import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function VPSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  isolateLookup,
  vpSuscResults
}) {

  const indivMutColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'controlIsoName',
      'isoName',
      'vaccineName',
      'dosage',
      'timing',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      isoName: 'Mutation',
      dosage: '# Shots',
      timing: '# Months'
    }
  });

  const comboMutsColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'section',
      'controlIsoName',
      'isoName',
      'vaccineName',
      'dosage',
      'timing',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      isoName: 'Variant',
      dosage: '# Shots',
      timing: '# Months'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'vp-susc-results',
    cacheKey,
    suscResults: vpSuscResults,
    isolateLookup,
    indivMutColumnDefs,
    comboMutsColumnDefs
  });
}

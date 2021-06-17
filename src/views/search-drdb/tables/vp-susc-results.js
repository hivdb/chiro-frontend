import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function VPSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  isolateLookup,
  vpSuscResults
}) {

  const indivMutIndivFoldColumnDefs = useColumnDefs({
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
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      dosage: '# Shots',
      timing: '# Months'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
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
      'cumulativeCount'
    ],
    labels: {
      isoName: 'Mutation',
      dosage: '# Shots',
      timing: '# Months'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
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
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      dosage: '# Shots',
      timing: '# Months'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
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
      'cumulativeCount'
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
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

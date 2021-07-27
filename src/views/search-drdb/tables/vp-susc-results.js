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
      'assayName',
      'section',
      'vaccineName',
      'dosage',
      'timing',
      'controlIsoName',
      'isoName',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      dosage: '# Shots',
      timing: 'Months',
      potency: 'Potency (NT50)',
      fold: 'Fold Reduction'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'assayName',
      'section',
      'vaccineName',
      'dosage',
      'timing',
      'controlIsoName',
      'isoName',
      'cumulativeCount',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Mutation',
      dosage: '# Shots',
      timing: 'Months',
      potency: 'Mean/Median Potency (NT50)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'assayName',
      'section',
      'vaccineName',
      'dosage',
      'timing',
      'controlIsoName',
      'isoName',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      dosage: '# Shots',
      timing: 'Months',
      potency: 'Potency (NT50)',
      fold: 'Fold Reduction'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    articleLookup,
    isolateLookup,
    columns: [
      'refName',
      'assayName',
      'section',
      'vaccineName',
      'dosage',
      'timing',
      'controlIsoName',
      'isoName',
      'cumulativeCount',
      'potency',
      'fold'
    ],
    labels: {
      isoName: 'Variant',
      dosage: '# Shots',
      timing: 'Months',
      potency: 'Mean/Median Potency (NT50)',
      fold: 'Mean/Median Fold Reduction'
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

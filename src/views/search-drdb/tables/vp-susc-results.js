import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function VPSuscResults({
  loaded,
  cacheKey,
  isolateLookup,
  vpSuscResults
}) {

  const indivMutIndivFoldColumnDefs = useColumnDefs({
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
      potency: 'NT50 (Dilution)',
      fold: 'Fold Reduction'
    }
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
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
      potency: 'Mean/Median NT50 (Dilution)',
      fold: 'Mean/Median Fold Reduction'
    }
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
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
      potency: 'NT50 (Dilution)',
      fold: 'Fold Reduction'
    }
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
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
      potency: 'Mean/Median NT50 (Dilution)',
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

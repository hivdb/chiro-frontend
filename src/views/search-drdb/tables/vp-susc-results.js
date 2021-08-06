import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import {useVPSuscResults} from '../hooks';
import LocationParams from '../hooks/location-params';


export default function VPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      vaccineName
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, vaccineName});
  const {suscResults, isPending} = useVPSuscResults();

  const indivMutIndivFoldColumnDefs = useColumnDefs({
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
    loaded: !isPending,
    id: 'vp-susc-results',
    cacheKey,
    suscResults,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}

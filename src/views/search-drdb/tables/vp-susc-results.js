import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';

const INDIV_MUT_INDIV_FOLD_COLUMNS = [
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
];

const INDIV_MUT_INDIV_FOLD_LABELS = {
  isoName: 'Mutation',
  dosage: '# Shots',
  timing: 'Months',
  potency: 'NT50 (Dilution)',
  fold: 'Fold Reduction'
};

const INDIV_MUT_AGG_FOLD_COLUMNS = [
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
];

const INDIV_MUT_AGG_FOLD_LABELS = {
  isoName: 'Mutation',
  dosage: '# Shots',
  timing: 'Months',
  potency: 'Mean/Median NT50 (Dilution)',
  fold: 'Mean/Median Fold Reduction'
};

const COMBO_MUTS_INDIV_FOLD_COLUMNS = [
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
];

const COMBO_MUTS_INDIV_FOLD_LABELS = {
  isoName: 'Variant',
  dosage: '# Shots',
  timing: 'Months',
  potency: 'NT50 (Dilution)',
  fold: 'Fold Reduction'
};

const COMBO_MUTS_AGG_FOLD_COLUMNS = [
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
];

const COMBO_MUTS_AGG_FOLD_LABELS = {
  isoName: 'Variant',
  dosage: '# Shots',
  timing: 'Months',
  potency: 'Mean/Median NT50 (Dilution)',
  fold: 'Mean/Median Fold Reduction'
};


export default function VPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      vaccineName
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, vaccineName});
  const {suscResults, isPending} = SuscResults.useVP();

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    columns: INDIV_MUT_INDIV_FOLD_COLUMNS,
    labels: INDIV_MUT_INDIV_FOLD_LABELS
  });

  const indivMutAggFoldColumnDefs = useColumnDefs({
    columns: INDIV_MUT_AGG_FOLD_COLUMNS,
    labels: INDIV_MUT_AGG_FOLD_LABELS
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    columns: COMBO_MUTS_INDIV_FOLD_COLUMNS,
    labels: COMBO_MUTS_INDIV_FOLD_LABELS
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    columns: COMBO_MUTS_AGG_FOLD_COLUMNS,
    labels: COMBO_MUTS_AGG_FOLD_LABELS
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
